"""
ForeSite Satellite Imagery & Change Detection Abstraction Layer

Serves multi-temporal imagery metadata and prototype tile layers for baseline (2024), intermediate (2025), current (2026), and post-notice (2027) observations.
Architected to easily interface with Sentinel-2 / Copernicus API / Google Earth Engine REST endpoints.
"""

from typing import Dict, Any

def get_parcel_imagery(parcel_id: str, year: int, center_lat: float, center_lng: float, change_area: float) -> Dict[str, Any]:
    """
    Returns structured satellite imagery details, visual change overlay metrics, and spectral indices (NDVI/NDBI).
    """
    # Simulate spectral index changes for built-up land conversion
    # Higher NDBI (Normalized Difference Built-up Index) = more construction/structures
    # Lower NDVI (Normalized Difference Vegetation Index) = loss of open green space
    
    base_ndbi = 0.15
    base_ndvi = 0.65
    
    growth_factor = min(1.0, change_area / 1200.0)
    ndbi = round(base_ndbi + (growth_factor * 0.55), 3)
    ndvi = round(max(0.05, base_ndvi - (growth_factor * 0.48)), 3)

    # Conceptual satellite source information
    constellation = "Sentinel-2 MSI / Landsat-9"
    cloud_cover_pct = 1.2
    resolution_m = 10.0  # 10m spatial resolution
    
    # Generate change mask polygon offset around center
    delta_lat = (change_area ** 0.5) * 0.00001
    delta_lng = (change_area ** 0.5) * 0.00001
    
    change_mask_bbox = [
        [center_lat - delta_lat, center_lng - delta_lng],
        [center_lat + delta_lat, center_lng - delta_lng],
        [center_lat + delta_lat, center_lng + delta_lng],
        [center_lat - delta_lat, center_lng + delta_lng]
    ]

    return {
        "parcel_id": parcel_id,
        "observation_year": year,
        "imagery_date": f"{year}-04-15",
        "source": constellation,
        "cloud_cover_percentage": cloud_cover_pct,
        "resolution_meters": resolution_m,
        "ndvi": ndvi,
        "ndbi": ndbi,
        "detected_builtup_sqm": change_area,
        "change_mask_bbox": change_mask_bbox,
        "tile_layer_url": f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}",
        "is_prototype": True,
        "data_notice": "Prototype simulated Earth Observation layer. Ready for Earth Engine / Sentinel-2 API integration."
    }
