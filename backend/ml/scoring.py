"""
ForeSite Explainable Urgency Scoring Engine

Calculates a 0-100 Urgency Score for land parcel inspection prioritization with a fully transparent, human-auditable breakdown.
Configurable Weights:
- Growth Rate / Velocity: 30%
- Recent Change: 20%
- Total Changed Area: 15%
- Persistence (Multi-temporal continuity): 15%
- Post-Notice Growth (Post-intervention violation): 20%
"""

from typing import Dict, Any, List

def calculate_urgency_score(parcel_data: Dict[str, Any]) -> Dict[str, Any]:
    history = parcel_data.get("history", {})
    status = parcel_data.get("status", "New Alert")
    has_post_notice_growth = parcel_data.get("post_notice_growth", False)

    y24 = history.get("2024", 0.0)
    y25 = history.get("2025", 0.0)
    y26 = history.get("2026", 0.0)
    y27 = history.get("2027", None)

    breakdown: List[Dict[str, Any]] = []
    score_components = []

    # 1. Growth Rate / Velocity (Max 30 pts)
    g_24_25 = max(0.0, y25 - y24)
    g_25_26 = max(0.0, y26 - y25)
    g_latest = max(0.0, (y27 - y26)) if y27 is not None else g_25_26

    max_recent_rate = max(g_25_26, g_latest)
    if max_recent_rate >= 350:
        pts_rate = 30
        desc = f"Critical expansion rate detected (+{int(max_recent_rate)} m²/yr)"
    elif max_recent_rate >= 200:
        pts_rate = 24
        desc = f"Rapid expansion rate (+{int(max_recent_rate)} m²/yr)"
    elif max_recent_rate >= 100:
        pts_rate = 16
        desc = f"Moderate growth velocity (+{int(max_recent_rate)} m²/yr)"
    elif max_recent_rate > 30:
        pts_rate = 8
        desc = f"Low growth velocity (+{int(max_recent_rate)} m²/yr)"
    else:
        pts_rate = 0
        desc = "Negligible growth velocity"

    if pts_rate > 0:
        breakdown.append({
            "factor": "Growth Velocity",
            "points": pts_rate,
            "max_points": 30,
            "description": desc
        })

    # 2. Recent Change Magnitude (Max 20 pts)
    recent_delta = g_latest
    if recent_delta >= 400:
        pts_recent = 20
        desc = f"Large scale recent change (+{int(recent_delta)} m²)"
    elif recent_delta >= 200:
        pts_recent = 15
        desc = f"Significant recent change (+{int(recent_delta)} m²)"
    elif recent_delta >= 80:
        pts_recent = 10
        desc = f"Noticeable recent change (+{int(recent_delta)} m²)"
    elif recent_delta > 20:
        pts_recent = 5
        desc = f"Minor recent change (+{int(recent_delta)} m²)"
    else:
        pts_recent = 0
        desc = "No significant recent change"

    if pts_recent > 0:
        breakdown.append({
            "factor": "Recent Change Magnitude",
            "points": pts_recent,
            "max_points": 20,
            "description": desc
        })

    # 3. Total Changed Area (Max 15 pts)
    current_area = y27 if y27 is not None else y26
    if current_area >= 800:
        pts_total = 15
        desc = f"High accumulated built-up footprint ({int(current_area)} m²)"
    elif current_area >= 400:
        pts_total = 11
        desc = f"Moderate accumulated built-up footprint ({int(current_area)} m²)"
    elif current_area >= 150:
        pts_total = 6
        desc = f"Low accumulated built-up footprint ({int(current_area)} m²)"
    else:
        pts_total = 2
        desc = f"Minimal total changed footprint ({int(current_area)} m²)"

    breakdown.append({
        "factor": "Accumulated Built-up Area",
        "points": pts_total,
        "max_points": 15,
        "description": desc
    })

    # 4. Persistence of Growth (Max 15 pts)
    persistent_years = 0
    if g_24_25 > 20:
        persistent_years += 1
    if g_25_26 > 20:
        persistent_years += 1
    if y27 is not None and (y27 - y26) > 20:
        persistent_years += 1

    if persistent_years >= 3:
        pts_persist = 15
        desc = "Continuous multi-year growth across 3+ consecutive observations"
    elif persistent_years == 2:
        pts_persist = 10
        desc = "Sustained growth across 2 consecutive observation periods"
    elif persistent_years == 1:
        pts_persist = 5
        desc = "Single observation growth period detected"
    else:
        pts_persist = 0
        desc = "No persistent multi-year growth pattern"

    if pts_persist > 0:
        breakdown.append({
            "factor": "Multi-Year Continuity",
            "points": pts_persist,
            "max_points": 15,
            "description": desc
        })

    # 5. Post-Notice Violation / Continued Growth (Max 20 pts)
    if has_post_notice_growth or status == "Re-check Required":
        pts_notice = 20
        desc = "HIGH RISK: Encroachment continued despite official intervention/notice"
        breakdown.append({
            "factor": "Post-Notice Non-Compliance",
            "points": pts_notice,
            "max_points": 20,
            "description": desc
        })
    elif status == "Notice Issued":
        pts_notice = 5
        desc = "Official notice currently active; pending post-notice observation"
        breakdown.append({
            "factor": "Active Enforcement Status",
            "points": pts_notice,
            "max_points": 20,
            "description": desc
        })
    else:
        pts_notice = 0

    total_score = pts_rate + pts_recent + pts_total + pts_persist + pts_notice
    final_score = min(100, max(0, total_score))

    # Priority category mapping
    if final_score >= 80:
        risk_level = "Critical"
    elif final_score >= 60:
        risk_level = "High"
    elif final_score >= 35:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "urgency_score": final_score,
        "risk_level": risk_level,
        "breakdown": breakdown,
        "summary": f"Scored {final_score}/100 based on {len(breakdown)} risk indicators."
    }
