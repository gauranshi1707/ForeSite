"""
ForeSite Remote Sensing & Change Detection Service

Implements spectral index computation (NDBI, NDVI, NDWI), multi-temporal
change detection, change mask generation, and detection confidence scoring.

Architecture: Satellite/EO → Preprocessing → Spectral Indices → Change Detection
→ Change Mask → Parcel Intersection → Temporal Analysis → Priority Engine
"""
import math
from typing import Dict, Any, List, Optional, Tuple

def compute_ndbi(swir: float, nir: float) -> float:
    """Normalized Difference Built-up Index: (SWIR - NIR) / (SWIR + NIR)"""
    if swir + nir == 0:
        return 0.0
    return round((swir - nir) / (swir + nir), 4)

def compute_ndvi(nir: float, red: float) -> float:
    """Normalized Difference Vegetation Index: (NIR - RED) / (NIR + RED)"""
    if nir + red == 0:
        return 0.0
    return round((nir - red) / (nir + red), 4)

def compute_ndwi(green: float, nir: float) -> float:
    """Normalized Difference Water Index: (GREEN - NIR) / (GREEN + NIR)"""
    if green + nir == 0:
        return 0.0
    return round((green - nir) / (green + nir), 4)

def simulate_spectral_bands(built_up_area: float, parcel_area: float, year: int) -> Dict[str, float]:
    """
    Simulate Sentinel-2 spectral band reflectances based on built-up proportion.
    In production, these would come from actual Sentinel-2 L2A products.
    
    Band mapping (Sentinel-2):
    - B2: Blue (490nm)
    - B3: Green (560nm) 
    - B4: Red (665nm)
    - B8: NIR (842nm)
    - B11: SWIR1 (1610nm)
    """
    # Built-up proportion drives the spectral signature
    built_ratio = min(1.0, built_up_area / max(parcel_area * 0.6, 1.0))
    
    # Vegetation signature (low built-up): high NIR, low SWIR, low Red
    # Urban signature (high built-up): moderate NIR, high SWIR, moderate Red
    
    # Temporal degradation factor (older observations have slightly different calibration)
    temporal_noise = (2027 - year) * 0.005
    
    nir = round(0.35 - (built_ratio * 0.12) + temporal_noise, 4)
    red = round(0.08 + (built_ratio * 0.06), 4)
    swir = round(0.12 + (built_ratio * 0.22), 4)
    green = round(0.10 + (built_ratio * 0.03), 4)
    blue = round(0.07 + (built_ratio * 0.02), 4)
    
    return {
        "B2_blue": blue, "B3_green": green, "B4_red": red,
        "B8_nir": nir, "B11_swir1": swir
    }

def compute_spectral_indices(bands: Dict[str, float]) -> Dict[str, float]:
    """Compute all spectral indices from band reflectances."""
    ndbi = compute_ndbi(bands["B11_swir1"], bands["B8_nir"])
    ndvi = compute_ndvi(bands["B8_nir"], bands["B4_red"])
    ndwi = compute_ndwi(bands["B3_green"], bands["B8_nir"])
    return {"ndbi": ndbi, "ndvi": ndvi, "ndwi": ndwi}

def compute_detection_confidence(
    ndbi_change: float, ndvi_change: float,
    persistent_years: int, total_observations: int,
    change_area: float, parcel_area: float
) -> Dict[str, Any]:
    """
    Calculate prototype detection confidence based on:
    - Spectral signal strength (NDBI/NDVI magnitude)
    - Temporal persistence (across how many observations)
    - Spatial consistency (change area vs parcel area)
    - Imagery quality proxy
    
    Returns confidence 0-100 and breakdown.
    """
    # 1. Spectral signal strength (0-30)
    spectral_score = min(30, abs(ndbi_change) * 80 + abs(ndvi_change) * 40)
    
    # 2. Temporal persistence (0-30)
    persistence_score = min(30, persistent_years * 10)
    
    # 3. Spatial consistency (0-20)
    spatial_ratio = min(1.0, change_area / max(parcel_area * 0.5, 1.0))
    spatial_score = spatial_ratio * 20
    
    # 4. Observation quality proxy (0-20)
    quality_score = min(20, total_observations * 5)
    
    total = round(min(100, spectral_score + persistence_score + spatial_score + quality_score))
    
    return {
        "confidence": total,
        "breakdown": {
            "spectral_signal": round(spectral_score, 1),
            "temporal_persistence": round(persistence_score, 1),
            "spatial_consistency": round(spatial_score, 1),
            "observation_quality": round(quality_score, 1)
        },
        "label": "High" if total >= 80 else "Medium" if total >= 60 else "Low"
    }

def generate_change_mask(center_lat: float, center_lng: float,
                         change_area: float, parcel_polygon: list,
                         seed_offset: int = 0) -> List[List[float]]:
    """
    Generate a change mask sub-polygon within the parcel boundary.
    The mask represents WHERE change was detected, not just that it was detected.
    
    In production, this would come from pixel-level NDBI differencing + thresholding.
    """
    # Scale the change mask relative to change area
    scale = min(0.8, math.sqrt(change_area) / 120.0)  # Max 80% of parcel
    if scale < 0.05:
        return []
    
    # Create an irregular sub-polygon offset from center
    offsets = [
        (0.0003 * scale, 0.0002 * scale),
        (0.0005 * scale, -0.0001 * scale),
        (0.0004 * scale, -0.0004 * scale),
        (0.0001 * scale, -0.0005 * scale),
        (-0.0002 * scale, -0.0003 * scale),
        (-0.0004 * scale, 0.0001 * scale),
        (-0.0003 * scale, 0.0003 * scale),
        (-0.0001 * scale, 0.0004 * scale),
    ]
    
    # Apply a deterministic rotation based on seed_offset
    angle = (seed_offset % 360) * math.pi / 180.0
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    
    mask_polygon = []
    for dlat, dlng in offsets:
        rlat = dlat * cos_a - dlng * sin_a
        rlng = dlat * sin_a + dlng * cos_a
        mask_polygon.append([
            round(center_lat + rlat, 6),
            round(center_lng + rlng, 6)
        ])
    
    return mask_polygon

def generate_evidence_stack(parcel_data: dict) -> List[Dict[str, Any]]:
    """
    Generate structured evidence items for a parcel.
    Each item provides one piece of supporting evidence for the detection.
    """
    evidence = []
    history = parcel_data.get("history", {})
    spectral = parcel_data.get("spectral", {})
    y24 = history.get("2024", 0)
    y26 = history.get("2026", 0)
    y27 = history.get("2027", None)
    current = y27 if y27 is not None else y26
    
    # 1. Government Boundary
    evidence.append({
        "id": 1,
        "type": "boundary",
        "title": "Government Land Boundary",
        "description": f"Parcel falls within monitored {parcel_data.get('land_category', 'government')} land boundary.",
        "confidence_impact": "baseline"
    })
    
    # 2. Temporal Change
    if current > y24:
        evidence.append({
            "id": 2,
            "type": "temporal",
            "title": "Temporal Change Detected",
            "description": f"Built-up area increased from {int(y24)} m² to {int(current)} m² (+{int(current - y24)} m²).",
            "confidence_impact": "high"
        })
    
    # 3. Spectral Evidence
    ndbi_2024 = spectral.get("2024", {}).get("ndbi", 0)
    ndbi_2026 = spectral.get("2026", {}).get("ndbi", 0)
    ndbi_change = round(ndbi_2026 - ndbi_2024, 3)
    if abs(ndbi_change) > 0.05:
        evidence.append({
            "id": 3,
            "type": "spectral",
            "title": "Spectral Evidence (NDBI)",
            "description": f"NDBI increased by {'+' if ndbi_change > 0 else ''}{ndbi_change}, indicating {'built-up expansion' if ndbi_change > 0 else 'built-up reduction'}.",
            "confidence_impact": "high" if abs(ndbi_change) > 0.15 else "medium"
        })
    
    ndvi_2024 = spectral.get("2024", {}).get("ndvi", 0)
    ndvi_2026 = spectral.get("2026", {}).get("ndvi", 0)
    ndvi_change = round(ndvi_2026 - ndvi_2024, 3)
    if abs(ndvi_change) > 0.05:
        evidence.append({
            "id": 4,
            "type": "spectral",
            "title": "Vegetation Change (NDVI)",
            "description": f"NDVI changed by {'+' if ndvi_change > 0 else ''}{ndvi_change}, indicating {'vegetation recovery' if ndvi_change > 0 else 'vegetation loss / land conversion'}.",
            "confidence_impact": "medium"
        })
    
    # 4. Persistence
    persistent_years = 0
    g1 = history.get("2025", 0) - y24
    g2 = y26 - history.get("2025", 0)
    if g1 > 20: persistent_years += 1
    if g2 > 20: persistent_years += 1
    if y27 and (y27 - y26) > 20: persistent_years += 1
    
    if persistent_years >= 2:
        evidence.append({
            "id": 5,
            "type": "persistence",
            "title": "Multi-Temporal Persistence",
            "description": f"Change detected across {persistent_years} consecutive observation periods, ruling out transient signal.",
            "confidence_impact": "high"
        })
    elif persistent_years == 1:
        evidence.append({
            "id": 5,
            "type": "persistence",
            "title": "Single-Period Change",
            "description": "Change detected in only one observation period. Persistence not yet confirmed.",
            "confidence_impact": "low"
        })
    
    # 5. Intervention
    if parcel_data.get("notice_date"):
        evidence.append({
            "id": 6,
            "type": "intervention",
            "title": "Official Intervention Record",
            "description": f"Notice issued on {parcel_data['notice_date']}.",
            "confidence_impact": "baseline"
        })
    
    # 6. Post-Intervention Growth
    if parcel_data.get("post_notice_growth") and y27:
        post_growth = int(y27 - y26)
        evidence.append({
            "id": 7,
            "type": "post_intervention",
            "title": "Post-Intervention Growth",
            "description": f"Additional +{post_growth} m² growth detected after official notice.",
            "confidence_impact": "critical"
        })
    
    # 7. Detection Confidence
    det_conf = parcel_data.get("detection_confidence", 50)
    evidence.append({
        "id": 8,
        "type": "confidence",
        "title": "Detection Confidence",
        "description": f"Prototype detection confidence: {det_conf}%.",
        "confidence_impact": "high" if det_conf >= 80 else "medium" if det_conf >= 60 else "low"
    })
    
    # 8. False positive note
    if parcel_data.get("is_false_positive"):
        evidence.append({
            "id": 9,
            "type": "false_positive",
            "title": "Potential False Positive",
            "description": parcel_data.get("false_positive_reason", "Low confidence — change may be seasonal."),
            "confidence_impact": "negative"
        })
    
    return evidence

def generate_why_flagged(parcel_data: dict) -> Dict[str, Any]:
    """Generate an explanation of why a parcel was or was not flagged."""
    score = parcel_data.get("urgency_score", 0)
    trajectory = parcel_data.get("trajectory", "STABLE")
    confidence = parcel_data.get("detection_confidence", 50)
    is_fp = parcel_data.get("is_false_positive", False)
    history = parcel_data.get("history", {})
    y24 = history.get("2024", 0)
    y26 = history.get("2026", 0)
    
    if score >= 60:
        return {
            "flagged": True,
            "title": "Why Was This Parcel Flagged?",
            "reasons": [
                r for r in [
                    f"Built-up expansion: +{int(y26 - y24)} m²" if y26 - y24 > 50 else None,
                    f"Trajectory: {trajectory}" if trajectory != "STABLE" else None,
                    f"Detection confidence: {confidence}%",
                    "Post-notice growth detected" if parcel_data.get("post_notice_growth") else None,
                ] if r
            ],
            "recommended_action": "Priority field inspection" if score >= 80 else "Scheduled review"
        }
    else:
        reasons = []
        if y26 - y24 < 50:
            reasons.append("Change magnitude below threshold (<50 m²)")
        if trajectory == "STABLE":
            reasons.append("Stable trajectory — no sustained growth")
        if confidence < 60:
            reasons.append(f"Low detection confidence ({confidence}%)")
        if is_fp:
            reasons.append(f"Classified as potential false positive: {parcel_data.get('false_positive_reason', 'seasonal')}")
        if not reasons:
            reasons.append("Change detected but below prioritization threshold")
        
        return {
            "flagged": False,
            "title": "Change Detected but Not Prioritized",
            "reasons": reasons,
            "recommended_action": "Continue monitoring"
        }

# Keep the existing get_parcel_imagery function but enhance it
def get_parcel_imagery(parcel_id: str, year: int, center_lat: float, center_lng: float, 
                       change_area: float, parcel_area: float = 15000.0) -> Dict[str, Any]:
    """
    Returns structured satellite imagery details with real spectral index computation.
    """
    bands = simulate_spectral_bands(change_area, parcel_area, year)
    indices = compute_spectral_indices(bands)
    
    constellation = "Sentinel-2 MSI (L2A)"
    cloud_cover_pct = round(1.2 + (year - 2024) * 0.3, 1)
    resolution_m = 10.0
    
    # Generate change mask
    seed_val = int("".join(filter(str.isdigit, parcel_id)) or "0") + year
    change_mask = generate_change_mask(center_lat, center_lng, change_area, [], seed_val)
    
    return {
        "parcel_id": parcel_id,
        "observation_year": year,
        "imagery_date": f"{year}-04-15",
        "source": constellation,
        "cloud_cover_percentage": cloud_cover_pct,
        "resolution_meters": resolution_m,
        "bands": bands,
        "ndvi": indices["ndvi"],
        "ndbi": indices["ndbi"],
        "ndwi": indices["ndwi"],
        "detected_builtup_sqm": change_area,
        "change_mask_polygon": change_mask,
        "tile_layer_url": f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}",
        "is_prototype": True,
        "data_notice": "Prototype synthetic EO dataset — Sentinel-2 / Earth Engine architecture ready"
    }
