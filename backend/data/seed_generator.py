"""
ForeSite Seed Data Generator - Institutional GIS Edition

Generates a realistic administrative ward land parcel dataset (~1,000 government parcels with a contiguous demo ward cluster of 15-20 parcels in Dwarka Zone 3, South West Delhi).
Includes ownership, ward designation, 3D built-up density factors, and multi-year risk score trajectories.
"""

import random
from typing import List, Dict, Any

REGIONS = [
    {"state": "Delhi NCR", "district": "South West Delhi", "wards": ["Dwarka Zone 3", "Najafgarh Ward 12", "Vasant Kunj Ward 4"], "lat": 28.5833, "lng": 77.0667, "owner": "Delhi Development Authority (DDA)"},
    {"state": "Delhi NCR", "district": "North West Delhi", "wards": ["Rohini Zone 7", "Pitampura Ward 2"], "lat": 28.6900, "lng": 77.1400, "owner": "Municipal Corporation of Delhi (MCD)"},
    {"state": "Maharashtra", "district": "Pune", "wards": ["Baner Ward 8", "Kothrud Zone 4", "Hinjawadi Ward 1"], "lat": 18.5204, "lng": 73.8567, "owner": "Pune Municipal Corporation (PMC)"},
    {"state": "Karnataka", "district": "Bengaluru Urban", "wards": ["Whitefield Ward 84", "Koramangala Zone 2"], "lat": 12.9716, "lng": 77.5946, "owner": "Bruhat Bengaluru Mahanagara Palike (BBMP)"},
    {"state": "Uttar Pradesh", "district": "Gautam Buddha Nagar", "wards": ["Noida Sector 62", "Greater Noida Zone 1"], "lat": 28.5355, "lng": 77.3910, "owner": "NOIDA Authority"},
    {"state": "Telangana", "district": "Rangareddy", "wards": ["Gachibowli Ward 10", "Serilingampally Zone 3"], "lat": 17.3850, "lng": 78.4867, "owner": "GHMC / HMDA"},
    {"state": "Tamil Nadu", "district": "Chennai", "wards": ["Adyar Zone 13", "Velachery Ward 170"], "lat": 13.0827, "lng": 80.2707, "owner": "Greater Chennai Corporation"},
    {"state": "Gujarat", "district": "Ahmedabad", "wards": ["Bodakdev Ward 5", "SG Highway Zone 2"], "lat": 23.0225, "lng": 72.5714, "owner": "Ahmedabad Municipal Corporation (AMC)"}
]

LAND_CATEGORIES = [
    "Public Parks & Green Belt",
    "Municipal Reserve Land",
    "Forest Buffer Zone",
    "Irrigation & Riverbed Lands",
    "Industrial Development Parcel",
    "Institutional Education Zone",
    "Transport Corridor Buffer"
]

def generate_polygon_at(lat: float, lng: float, width_deg: float = 0.0018, height_deg: float = 0.0014) -> List[List[float]]:
    """Generates precise 4-corner polygon geometry for realistic GIS plotting."""
    return [
        [round(lat, 5), round(lng, 5)],
        [round(lat + height_deg, 5), round(lng + 0.0001, 5)],
        [round(lat + height_deg - 0.0001, 5), round(lng + width_deg, 5)],
        [round(lat - 0.0001, 5), round(lng + width_deg - 0.0001, 5)]
    ]

def generate_seed_parcels(total_count: int = 1000) -> List[Dict[str, Any]]:
    random.seed(2026)
    parcels = []

    # 1. Hero Parcel PL-4587 (Dwarka Zone 3, South West Delhi)
    hero_lat, hero_lng = 28.5833, 77.0667
    hero_parcel = {
        "id": "PL-4587",
        "parcel_id": "PL-4587",
        "state": "Delhi NCR",
        "district": "South West Delhi",
        "ward": "Dwarka Zone 3",
        "land_category": "Public Parks & Green Belt",
        "ownership": "Delhi Development Authority (DDA)",
        "latitude": hero_lat,
        "longitude": hero_lng,
        "area_sqm": 15400.0,
        "polygon": generate_polygon_at(hero_lat, hero_lng, 0.0022, 0.0016),
        "history": {
            "2024": 120.0,
            "2025": 480.0,
            "2026": 920.0,
            "2027": 1150.0
        },
        "score_history": {
            "2024": 32,
            "2025": 58,
            "2026": 85,
            "2027": 95
        },
        "trajectory": "GROWING FAST",
        "urgency_score": 85,
        "status": "Notice Issued",
        "notice_date": "2026-06-15",
        "last_checked": "2026-08-20",
        "post_notice_growth": True,
        "is_hero": True,
        "audit_trail": [
            {"timestamp": "2024-04-15", "event": "Baseline satellite imagery ingested (120 m² change)", "actor": "Automated Satellite Pipeline"},
            {"timestamp": "2025-04-18", "event": "Intermediate expansion detected (+360 m² built-up)", "actor": "ForeSite Change Engine"},
            {"timestamp": "2026-05-10", "event": "Priority alert generated (920 m² change). Urgency score: 85/100", "actor": "AI Decision Support Engine"},
            {"timestamp": "2026-05-14", "event": "Case assigned to Nodal Officer S. Verma for field verification", "actor": "District Admin Office"},
            {"timestamp": "2026-06-15", "event": "Official Legal Notice Issued (Ref #DEL/SWD/2026/0891)", "actor": "Executive Magistrate"},
        ]
    }
    parcels.append(hero_parcel)

    # 2. Contiguous Ward Cluster around Dwarka Zone 3 (18 Demo Parcels)
    grid_offsets = [
        (-0.0020, 0.0025), (0.0020, 0.0025), (0.0040, -0.0010), (-0.0035, -0.0020),
        (0.0025, -0.0030), (-0.0015, -0.0040), (0.0045, 0.0030), (-0.0040, 0.0015),
        (0.0005, 0.0045), (-0.0030, 0.0040), (0.0035, -0.0045), (-0.0050, -0.0010),
        (0.0015, 0.0060), (-0.0025, -0.0060), (0.0055, 0.0005), (-0.0045, 0.0050),
        (0.0060, -0.0025), (-0.0060, 0.0025)
    ]

    hero_cases = [
        {"id": "PL-2134", "cat": "Forest Buffer Zone", "h": {"2024": 180, "2025": 520, "2026": 880, "2027": 1100}, "st": "Notice Issued", "png": True, "score": 87},
        {"id": "PL-7821", "cat": "Irrigation & Riverbed Lands", "h": {"2024": 90, "2025": 380, "2026": 790}, "st": "Inspection Scheduled", "png": False, "score": 81},
        {"id": "PL-1102", "cat": "Municipal Reserve Land", "h": {"2024": 50, "2025": 210, "2026": 640}, "st": "Under Review", "png": False, "score": 68},
        {"id": "PL-9034", "cat": "Transport Corridor Buffer", "h": {"2024": 200, "2025": 610, "2026": 1050, "2027": 1380}, "st": "Re-check Required", "png": True, "score": 92},
        {"id": "PL-3311", "cat": "Public Parks & Green Belt", "h": {"2024": 0, "2025": 310, "2026": 720}, "st": "New Alert", "png": False, "score": 74},
        {"id": "PL-6620", "cat": "Municipal Reserve Land", "h": {"2024": 40, "2025": 390, "2026": 810, "2027": 1020}, "st": "Re-check Required", "png": True, "score": 90},
        {"id": "PL-5412", "cat": "Institutional Education Zone", "h": {"2024": 150, "2025": 200, "2026": 210}, "st": "Resolved", "png": False, "score": 28},
    ]

    for idx, offset in enumerate(grid_offsets):
        p_lat = hero_lat + offset[0]
        p_lng = hero_lng + offset[1]
        
        if idx < len(hero_cases):
            hc = hero_cases[idx]
            p_id = hc["id"]
            cat = hc["cat"]
            hist = hc["h"]
            st = hc["st"]
            png = hc["png"]
            sc = hc["score"]
        else:
            p_id = f"PL-10{idx:02d}"
            cat = random.choice(LAND_CATEGORIES)
            y24 = round(random.uniform(0, 40), 1)
            y25 = round(y24 + random.uniform(10, 50), 1)
            y26 = round(y25 + random.uniform(10, 60), 1)
            hist = {"2024": y24, "2025": y25, "2026": y26}
            st = "Resolved" if y26 < 60 else "New Alert"
            png = False
            sc = 22 if st == "Resolved" else 48

        parcels.append({
            "id": p_id,
            "parcel_id": p_id,
            "state": "Delhi NCR",
            "district": "South West Delhi",
            "ward": "Dwarka Zone 3",
            "land_category": cat,
            "ownership": "Delhi Development Authority (DDA)",
            "latitude": round(p_lat, 5),
            "longitude": round(p_lng, 5),
            "area_sqm": round(random.uniform(8000, 24000), 1),
            "polygon": generate_polygon_at(p_lat, p_lng, random.uniform(0.0016, 0.0024), random.uniform(0.0012, 0.0018)),
            "history": hist,
            "score_history": {
                "2024": max(10, sc - 40),
                "2025": max(20, sc - 20),
                "2026": sc,
                "2027": sc + 10 if png else sc
            },
            "trajectory": "GROWING FAST" if hist.get("2026", 0) > 700 else "GROWING" if hist.get("2026", 0) > 200 else "STABLE",
            "urgency_score": sc,
            "status": st,
            "notice_date": "2026-05-20" if "Notice" in st or st == "Re-check Required" else None,
            "last_checked": "2026-08-18",
            "post_notice_growth": png,
            "is_hero": False,
            "audit_trail": [
                {"timestamp": "2024-04-10", "event": "Baseline observation ingested", "actor": "Automated Satellite Pipeline"},
                {"timestamp": "2026-05-01", "event": f"Status classified as '{st}'", "actor": "ForeSite Monitor"}
            ]
        })

    used_ids = {p["id"] for p in parcels}
    # 3. Generate remaining ~980 synthetic parcels across Indian regions
    count_idx = 100
    while len(parcels) < total_count:
        count_idx += 1
        p_id = f"PL-{count_idx:04d}"
        if p_id in used_ids:
            continue
        used_ids.add(p_id)
        reg = random.choice(REGIONS)
        ward = random.choice(reg["wards"])
        cat = random.choice(LAND_CATEGORIES)

        lat = round(reg["lat"] + random.uniform(-0.12, 0.12), 5)
        lng = round(reg["lng"] + random.uniform(-0.12, 0.12), 5)

        rand_p = random.random()
        if rand_p < 0.70: # Stable
            y24 = round(random.uniform(0, 30), 1)
            y25 = round(y24 + random.uniform(0, 15), 1)
            y26 = round(y25 + random.uniform(0, 15), 1)
            hist = {"2024": y24, "2025": y25, "2026": y26}
            st = "Resolved"
            png = False
            sc = random.randint(5, 30)
        elif rand_p < 0.90: # Growing
            y24 = round(random.uniform(10, 80), 1)
            y25 = round(y24 + random.uniform(60, 150), 1)
            y26 = round(y25 + random.uniform(80, 220), 1)
            hist = {"2024": y24, "2025": y25, "2026": y26}
            st = random.choice(["New Alert", "Under Review", "Inspection Scheduled"])
            png = False
            sc = random.randint(35, 65)
        else: # Growing Fast
            y24 = round(random.uniform(40, 150), 1)
            y25 = round(y24 + random.uniform(180, 350), 1)
            y26 = round(y25 + random.uniform(250, 500), 1)
            st = random.choice(["New Alert", "Notice Issued", "Re-check Required"])
            png = (st == "Re-check Required")
            hist = {"2024": y24, "2025": y25, "2026": y26}
            if png:
                hist["2027"] = round(y26 + random.uniform(150, 300), 1)
            sc = random.randint(70, 95)

        parcels.append({
            "id": p_id,
            "parcel_id": p_id,
            "state": reg["state"],
            "district": reg["district"],
            "ward": ward,
            "land_category": cat,
            "ownership": reg["owner"],
            "latitude": lat,
            "longitude": lng,
            "area_sqm": round(random.uniform(6000, 35000), 1),
            "polygon": generate_polygon_at(lat, lng, random.uniform(0.0015, 0.0025), random.uniform(0.0012, 0.0018)),
            "history": hist,
            "score_history": {
                "2024": max(5, sc - 35),
                "2025": max(15, sc - 15),
                "2026": sc,
                "2027": sc + 10 if png else sc
            },
            "trajectory": "STABLE",
            "urgency_score": sc,
            "status": st,
            "notice_date": "2026-05-15" if st in ["Notice Issued", "Re-check Required"] else None,
            "last_checked": "2026-08-18",
            "post_notice_growth": png,
            "is_hero": False,
            "audit_trail": [
                {"timestamp": "2024-04-10", "event": "Baseline satellite record ingested", "actor": "Automated Satellite Pipeline"}
            ]
        })

    return parcels
