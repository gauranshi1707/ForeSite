"""
ForeSite REST API - Official Action & Post-Notice Re-Check Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from data.db import update_parcel_action, simulate_recheck_observation

router = APIRouter(prefix="/api/parcels", tags=["actions"])

class ActionPayload(BaseModel):
    action: str  # Under Review, Inspection Scheduled, Notice Issued, Resolved, Re-check Required
    notes: Optional[str] = None
    official_id: Optional[str] = "Govt Official (District Admin)"

class RecheckPayload(BaseModel):
    year_2027_area: Optional[float] = 1150.0 # Default expansion for PL-4587 demo

@router.post("/{parcel_id}/action", response_model=Dict[str, Any])
def record_official_action(parcel_id: str, payload: ActionPayload):
    updated = update_parcel_action(
        parcel_id=parcel_id,
        new_status=payload.action,
        notes=payload.notes,
        actor=payload.official_id or "Govt Official"
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return updated

@router.post("/{parcel_id}/recheck", response_model=Dict[str, Any])
def trigger_post_notice_recheck(parcel_id: str, payload: Optional[RecheckPayload] = None):
    y27_area = payload.year_2027_area if payload and payload.year_2027_area else 1150.0
    updated = simulate_recheck_observation(parcel_id=parcel_id, year_2027_area=y27_area)
    if not updated:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return updated
