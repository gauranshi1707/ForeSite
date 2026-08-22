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
        change_area=change_area,
        parcel_area=parcel.get("area_sqm", 15000.0)
    )

@router.get("/{parcel_id}/evidence")
def get_parcel_evidence(parcel_id: str):
    from ml.change_detection import generate_evidence_stack, generate_why_flagged
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    evidence = generate_evidence_stack(parcel)
    why = generate_why_flagged(parcel)
    return {"evidence": evidence, "why_flagged": why}

@router.get("/{parcel_id}/change-analysis")
def get_parcel_change_analysis(parcel_id: str):
    from ml.change_detection import get_parcel_imagery
    parcel = get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    history = parcel.get("history", {})
    analyses = {}
    for year_str, area in history.items():
        year = int(year_str)
        analyses[year_str] = get_parcel_imagery(
            parcel_id, year, parcel["latitude"], parcel["longitude"],
            area, parcel.get("area_sqm", 15000.0)
        )
    
    return {
        "parcel_id": parcel_id,
        "spectral": parcel.get("spectral", {}),
        "detection_confidence": parcel.get("detection_confidence", 50),
        "change_mask": parcel.get("change_mask", []),
        "yearly_analysis": analyses
    }

from fastapi import Body
@router.post("/{parcel_id}/verification")
def record_verification(parcel_id: str, body: dict = Body(...)):
    from data.db import update_parcel_verification
    outcome = body.get("outcome", "Requires Further Review")
    notes = body.get("notes", "")
    officer = body.get("officer", "Field Inspector")
    result = update_parcel_verification(parcel_id, outcome, notes, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return result
