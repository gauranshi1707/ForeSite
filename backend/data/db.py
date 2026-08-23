"""
ForeSite Database Interface & Data Persistence Layer
Initializes SQLite database and handles read/write transactions for government land parcels.
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from ml.trajectory import classify_trajectory
from ml.scoring import calculate_urgency_score

if os.environ.get("VERCEL"):
    DB_FILE = "/tmp/foresite.db"
else:
    DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "foresite.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force_reseed: bool = False):
    """Initializes SQLite tables and seeds ~1,000 land parcels if empty or requested."""
    conn = get_connection()
    cursor = conn.cursor()

    # Drop the table if force_reseed is requested
    if force_reseed:
        cursor.execute("DROP TABLE IF EXISTS parcels")
        conn.commit()
    else:
        # Check if table exists and has the expected columns. If not, drop it to migrate.
        try:
            cursor.execute("SELECT spectral_json FROM parcels LIMIT 1")
        except sqlite3.OperationalError:
            # Table or column does not exist. Drop table so it gets recreated with correct schema.
            cursor.execute("DROP TABLE IF EXISTS parcels")
            conn.commit()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS parcels (
            id TEXT PRIMARY KEY,
            parcel_id TEXT UNIQUE,
            state TEXT,
            district TEXT,
            ward TEXT,
            land_category TEXT,
            ownership TEXT,
            latitude REAL,
            longitude REAL,
            area_sqm REAL,
            polygon_json TEXT,
            history_json TEXT,
            score_history_json TEXT,
            status TEXT,
            notice_date TEXT,
            last_checked TEXT,
            post_notice_growth INTEGER,
            is_hero INTEGER,
            audit_trail_json TEXT,
            
            -- V3 Technical Attributes
            spectral_json TEXT,
            detection_confidence INTEGER DEFAULT 50,
            is_false_positive INTEGER DEFAULT 0,
            false_positive_reason TEXT,
            verification_outcome TEXT,
            verification_json TEXT,
            change_mask_json TEXT
        )
    """)

    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM parcels")
    count = cursor.fetchone()[0]

    if count == 0 or force_reseed:
        cursor.execute("DELETE FROM parcels")
        
        # Delayed import to avoid circular dependency
        from data.seed_generator import generate_seed_parcels
        
        # Reduce seed count to 20 on Vercel to prevent cold-start timeouts
        seed_count = 20 if os.environ.get("VERCEL") else 1000
        seed_data = generate_seed_parcels(seed_count)
        for p in seed_data:
            cursor.execute("""
                INSERT INTO parcels (
                    id, parcel_id, state, district, ward, land_category, ownership,
                    latitude, longitude, area_sqm, polygon_json,
                    history_json, score_history_json, status, notice_date, last_checked,
                    post_notice_growth, is_hero, audit_trail_json,
                    
                    spectral_json, detection_confidence, is_false_positive,
                    false_positive_reason, verification_outcome, verification_json, change_mask_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"],
                p["parcel_id"],
                p["state"],
                p["district"],
                p.get("ward", "Zone 1"),
                p["land_category"],
                p.get("ownership", "Government Land Authority"),
                p["latitude"],
                p["longitude"],
                p["area_sqm"],
                json.dumps(p["polygon"]),
                json.dumps(p["history"]),
                json.dumps(p.get("score_history", {"2024": 30, "2025": 50, "2026": 80})),
                p["status"],
                p.get("notice_date"),
                p.get("last_checked", "2026-08-20"),
                1 if p["post_notice_growth"] else 0,
                1 if p.get("is_hero") else 0,
                json.dumps(p["audit_trail"]),
                
                json.dumps(p.get("spectral", {})),
                p.get("detection_confidence", 50),
                1 if p.get("is_false_positive", False) else 0,
                p.get("false_positive_reason"),
                p.get("verification_outcome"),
                json.dumps(p.get("verification", {})),
                json.dumps(p.get("change_mask", []))
            ))
        conn.commit()
    conn.close()

def _format_parcel(row: sqlite3.Row) -> Dict[str, Any]:
    history = json.loads(row["history_json"])
    score_history = json.loads(row["score_history_json"]) if row["score_history_json"] else {"2024": 30, "2025": 50, "2026": 80}
    post_notice_growth = bool(row["post_notice_growth"])
    status = row["status"]

    trajectory = classify_trajectory(history)
    
    parcel_dict = {
        "id": row["id"],
        "parcel_id": row["parcel_id"],
        "state": row["state"],
        "district": row["district"],
        "ward": row["ward"] if "ward" in row.keys() and row["ward"] else "Dwarka Zone 3",
        "land_category": row["land_category"],
        "ownership": row["ownership"] if "ownership" in row.keys() and row["ownership"] else "Delhi Development Authority (DDA)",
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "area_sqm": row["area_sqm"],
        "polygon": json.loads(row["polygon_json"]),
        "history": history,
        "score_history": score_history,
        "status": status,
        "notice_date": row["notice_date"],
        "last_checked": row["last_checked"],
        "post_notice_growth": post_notice_growth,
        "is_hero": bool(row["is_hero"]),
        "audit_trail": json.loads(row["audit_trail_json"]),
        "trajectory": trajectory,
        
        # V3 new fields
        "spectral": json.loads(row["spectral_json"]) if row["spectral_json"] else {},
        "detection_confidence": row["detection_confidence"],
        "is_false_positive": bool(row["is_false_positive"]),
        "false_positive_reason": row["false_positive_reason"],
        "verification_outcome": row["verification_outcome"],
        "verification": json.loads(row["verification_json"]) if row["verification_json"] else {},
        "change_mask": json.loads(row["change_mask_json"]) if row["change_mask_json"] else []
    }

    scoring_result = calculate_urgency_score(parcel_dict)
    parcel_dict["urgency_score"] = scoring_result["urgency_score"]
    parcel_dict["risk_level"] = scoring_result["risk_level"]
    parcel_dict["score_breakdown"] = scoring_result["breakdown"]

    # Keep score_history synchronized with latest year score
    parcel_dict["score_history"]["2026"] = scoring_result["urgency_score"]

    return parcel_dict

def get_all_parcels(
    state: Optional[str] = None,
    district: Optional[str] = None,
    ward: Optional[str] = None,
    trajectory: Optional[str] = None,
    status: Optional[str] = None,
    min_score: Optional[int] = None
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parcels")
    rows = cursor.fetchall()
    conn.close()

    parcels = [_format_parcel(r) for r in rows]

    if state and state != "All":
        parcels = [p for p in parcels if p["state"] == state]
    if district and district != "All":
        parcels = [p for p in parcels if p["district"] == district]
    if ward and ward != "All":
        parcels = [p for p in parcels if p["ward"] == ward]
    if trajectory and trajectory != "All":
        parcels = [p for p in parcels if p["trajectory"] == trajectory]
    if status and status != "All":
        parcels = [p for p in parcels if p["status"] == status]
    if min_score is not None:
        parcels = [p for p in parcels if p["urgency_score"] >= min_score]

    return parcels

def get_parcel_by_id(parcel_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parcels WHERE parcel_id = ? OR id = ?", (parcel_id, parcel_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    return _format_parcel(row)

def update_parcel_action(parcel_id: str, new_status: str, notes: Optional[str] = None, actor: str = "Official User") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parcels WHERE parcel_id = ? OR id = ?", (parcel_id, parcel_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    audit_trail = json.loads(row["audit_trail_json"])
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    notice_date = row["notice_date"]
    if new_status == "Notice Issued" and not notice_date:
        notice_date = datetime.now().strftime("%Y-%m-%d")

    note_text = f" ({notes})" if notes else ""
    event_msg = f"Status updated to '{new_status}'{note_text}"
    
    audit_trail.append({
        "timestamp": now_str,
        "event": event_msg,
        "actor": actor
    })

    cursor.execute("""
        UPDATE parcels
        SET status = ?, notice_date = ?, last_checked = ?, audit_trail_json = ?
        WHERE id = ?
    """, (
        new_status,
        notice_date,
        datetime.now().strftime("%Y-%m-%d"),
        json.dumps(audit_trail),
        row["id"]
    ))
    conn.commit()
    conn.close()

    return get_parcel_by_id(parcel_id)

def update_parcel_verification(parcel_id: str, outcome: str, notes: Optional[str] = None, officer: str = "Field Inspector") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parcels WHERE parcel_id = ? OR id = ?", (parcel_id, parcel_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    audit_trail = json.loads(row["audit_trail_json"])
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    event_msg = f"Field Verification recorded: '{outcome}' by {officer}. Notes: {notes}"
    audit_trail.append({
        "timestamp": now_str,
        "event": event_msg,
        "actor": officer
    })
    
    verification_data = {
        "verified_at": now_str,
        "officer": officer,
        "outcome": outcome,
        "notes": notes
    }

    # Map verification outcome to appropriate status
    is_fp = 1 if outcome in ["False Positive", "No Significant Change"] else 0
    fp_reason = notes if is_fp else row["false_positive_reason"]
    
    new_status = "Resolved" if outcome in ["Resolved", "Authorized Construction", "False Positive", "No Significant Change"] else "Under Review"

    cursor.execute("""
        UPDATE parcels
        SET status = ?, verification_outcome = ?, verification_json = ?, is_false_positive = ?, false_positive_reason = ?, audit_trail_json = ?
        WHERE id = ?
    """, (
        new_status,
        outcome,
        json.dumps(verification_data),
        is_fp,
        fp_reason,
        json.dumps(audit_trail),
        row["id"]
    ))
    conn.commit()
    conn.close()

    return get_parcel_by_id(parcel_id)

def simulate_recheck_observation(parcel_id: str, year_2027_area: float = 1150.0) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parcels WHERE parcel_id = ? OR id = ?", (parcel_id, parcel_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    history = json.loads(row["history_json"])
    score_history = json.loads(row["score_history_json"]) if row["score_history_json"] else {"2024": 30, "2025": 58, "2026": 85}
    audit_trail = json.loads(row["audit_trail_json"])
    spectral = json.loads(row["spectral_json"]) if row["spectral_json"] else {}
    
    y26 = history.get("2026", 920.0)
    history["2027"] = year_2027_area
    score_history["2027"] = 95

    # Simulate spectral for 2027
    from ml.change_detection import simulate_spectral_bands, compute_spectral_indices, generate_change_mask
    bands_2027 = simulate_spectral_bands(year_2027_area, row["area_sqm"], 2027)
    spectral["2027"] = compute_spectral_indices(bands_2027)
    
    # Update change mask for 2027
    new_mask = generate_change_mask(row["latitude"], row["longitude"], year_2027_area - history.get("2024", 0.0), [], 2027)

    growth_occurred = year_2027_area > y26
    new_status = "Re-check Required" if growth_occurred else "Resolved"
    post_notice_growth = 1 if growth_occurred else 0

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    event_msg = f"Post-Notice Satellite Re-Observation (2027): Built-up area expanded from {int(y26)} m² to {int(year_2027_area)} m²."
    if growth_occurred:
        event_msg += " WARNING: Continued growth detected after official intervention! Status updated to 'Re-check Required' and score re-escalated to 95/100."

    audit_trail.append({
        "timestamp": now_str,
        "event": event_msg,
        "actor": "ForeSite Automated Earth Engine Pipeline"
    })

    cursor.execute("""
        UPDATE parcels
        SET history_json = ?, score_history_json = ?, status = ?, post_notice_growth = ?, last_checked = ?, audit_trail_json = ?, spectral_json = ?, change_mask_json = ?
        WHERE id = ?
    """, (
        json.dumps(history),
        json.dumps(score_history),
        new_status,
        post_notice_growth,
        datetime.now().strftime("%Y-%m-%d"),
        json.dumps(audit_trail),
        json.dumps(spectral),
        json.dumps(new_mask),
        row["id"]
    ))
    conn.commit()
    conn.close()

    return get_parcel_by_id(parcel_id)
