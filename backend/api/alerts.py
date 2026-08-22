"""
ForeSite REST API - Ranked Priority Alerts Endpoint
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

from data.db import get_all_parcels

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("", response_model=List[Dict[str, Any]])
def get_priority_alerts(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    trajectory: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100)
):
    parcels = get_all_parcels(state=state, district=district, trajectory=trajectory, status=status)
    
    # Filter active alerts (excluding simple resolved ones without post notice growth)
    alerts = [p for p in parcels if p["urgency_score"] > 20 or p["status"] != "Resolved"]
    
    # Sort by urgency score descending
    alerts.sort(key=lambda x: x["urgency_score"], reverse=True)

    # Attach rank numbers
    ranked_alerts = []
    for rank, p in enumerate(alerts[:limit], start=1):
        p_copy = dict(p)
        p_copy["rank"] = rank
        p_copy["recommended_action"] = (
            "Urgent Field Inspection & Stop Work Notice" if p["urgency_score"] >= 80
            else "Issue Legal Notice" if p["urgency_score"] >= 65
            else "Schedule Field Verification" if p["urgency_score"] >= 40
            else "Routine Remote Monitoring"
        )
        ranked_alerts.append(p_copy)

    return ranked_alerts
