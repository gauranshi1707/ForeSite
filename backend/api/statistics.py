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

    # Monitoring funnel stats
    detected_change = sum(1 for p in parcels if p.get('history', {}).get('2026', 0) - p.get('history', {}).get('2024', 0) > 50)
    persistent_changes = sum(1 for p in parcels if p['trajectory'] in ['GROWING', 'GROWING FAST'])
    high_priority_funnel = sum(1 for p in parcels if p['urgency_score'] >= 70)
    inspection_candidates = sum(1 for p in parcels if p['urgency_score'] >= 80)
    false_positives = sum(1 for p in parcels if p.get('is_false_positive', False))

    # HITL dynamic performance metrics
    verified_parcels = [p for p in parcels if p.get("verification_outcome") is not None]
    num_validation = len(verified_parcels)
    
    performance = {"validation_sufficient": False, "num_validation_parcels": num_validation}
    if num_validation >= 5:
        tp = sum(1 for p in verified_parcels if p["verification_outcome"] == "Confirmed Land-Use Change" and p["urgency_score"] >= 45)
        fp = sum(1 for p in verified_parcels if p["verification_outcome"] in ["False Positive", "No Significant Change"] and p["urgency_score"] >= 45)
        fn = sum(1 for p in verified_parcels if p["verification_outcome"] == "Confirmed Land-Use Change" and p["urgency_score"] < 45)
        tn = sum(1 for p in verified_parcels if p["verification_outcome"] in ["False Positive", "No Significant Change"] and p["urgency_score"] < 45)
        
        precision = round(tp / (tp + fp), 3) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 3) if (tp + fn) > 0 else 0.0
        f1 = round(2 * precision * recall / (precision + recall), 3) if (precision + recall) > 0 else 0.0
        fpr = round(fp / (fp + tn), 3) if (fp + tn) > 0 else 0.0
        
        performance = {
            "validation_sufficient": True,
            "num_validation_parcels": num_validation,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "false_positive_rate": fpr
        }

    return {
        "total_parcels": total_parcels,
        "active_alerts": active_alerts,
        "high_priority": high_priority,
        "requiring_recheck": requiring_recheck,
        "monitoring_period": "2024–2026 (Live 2027 Re-check Ready)",
        "trajectory_breakdown": trajectory_counts,
        "status_breakdown": status_counts,
        "regional_breakdown": state_counts,
        "monitoring_funnel": {
            "monitored": total_parcels,
            "detected_change": detected_change,
            "persistent_changes": persistent_changes,
            "high_priority": high_priority_funnel,
            "inspection_candidates": inspection_candidates,
            "false_positives": false_positives
        },
        "model_performance": performance
    }
