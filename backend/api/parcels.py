"""
ForeSite REST API - Parcel Management & Imagery Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

from data.db import get_all_parcels, get_parcel_by_id
from ml.change_detection import get_parcel_imagery

router = APIRouter(prefix="/api/parcels", tags=["parcels"])

@router.get("", response_model=List[Dict[str, Any]])
def list_parcels(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    trajectory: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None)
):
    return get_all_parcels(state=state, district=district, ward=ward, trajectory=trajectory, status=status, min_score=min_score)

@router.get("/{parcel_id}", response_model=Dict[str, Any])
def get_parcel(parcel_id: str):
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel

@router.get("/{parcel_id}/history")
def get_parcel_history(parcel_id: str):
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return {
        "parcel_id": parcel["parcel_id"],
        "history": parcel["history"],
        "score_history": parcel.get("score_history", {}),
        "audit_trail": parcel["audit_trail"]
    }

@router.get("/{parcel_id}/score")
def get_parcel_score(parcel_id: str):
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return {
        "parcel_id": parcel["parcel_id"],
        "urgency_score": parcel["urgency_score"],
        "risk_level": parcel["risk_level"],
        "score_history": parcel.get("score_history", {}),
        "breakdown": parcel["score_breakdown"]
    }

@router.get("/{parcel_id}/imagery")
def get_parcel_imagery_endpoint(parcel_id: str, year: int = Query(2026)):
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    change_area = parcel["history"].get(str(year), parcel["history"].get("2026", 0.0))
    return get_parcel_imagery(
        parcel_id=parcel["parcel_id"],
        year=year,
        center_lat=parcel["latitude"],
        center_lng=parcel["longitude"],
        change_area=change_area
    )
