"""
ForeSite REST API - Monitoring Statistics Endpoint
"""

from fastapi import APIRouter
from typing import Dict, Any

from data.db import get_all_parcels

router = APIRouter(prefix="/api/statistics", tags=["statistics"])

@router.get("", response_model=Dict[str, Any])
def get_dashboard_statistics():
    parcels = get_all_parcels()
    total_parcels = len(parcels)
    
    active_alerts = sum(1 for p in parcels if p["urgency_score"] >= 35 or p["status"] not in ["Resolved"])
    high_priority = sum(1 for p in parcels if p["urgency_score"] >= 75)
    requiring_recheck = sum(1 for p in parcels if p["status"] == "Re-check Required" or p["post_notice_growth"])

    trajectory_counts = {"STABLE": 0, "GROWING": 0, "GROWING FAST": 0}
    for p in parcels:
        traj = p["trajectory"]
        trajectory_counts[traj] = trajectory_counts.get(traj, 0) + 1

    status_counts = {}
    for p in parcels:
        st = p["status"]
        status_counts[st] = status_counts.get(st, 0) + 1

    state_counts = {}
    for p in parcels:
        st = p["state"]
        state_counts[st] = state_counts.get(st, 0) + 1

    return {
        "total_parcels": total_parcels,
        "active_alerts": active_alerts,
        "high_priority": high_priority,
        "requiring_recheck": requiring_recheck,
        "monitoring_period": "2024–2026 (Live 2027 Re-check Ready)",
        "trajectory_breakdown": trajectory_counts,
        "status_breakdown": status_counts,
        "regional_breakdown": state_counts
    }
