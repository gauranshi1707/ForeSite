"""
ForeSite Trajectory Classification Engine

Categorizes land-use / built-up change trajectory based on historical multi-temporal observation data.
Categories:
- STABLE: Minimal or negligible built-up area growth (< 50 m² overall)
- GROWING: Consistent, moderate increase in built-up footprint
- GROWING FAST: Rapid growth (> 300 m² expansion or strong acceleration)
"""

def classify_trajectory(history: dict) -> str:
    """
    history format:
    {
        "2024": float,
        "2025": float,
        "2026": float,
        "2027": float (optional, post-notice)
    }
    """
    y24 = history.get("2024", 0.0)
    y25 = history.get("2025", 0.0)
    y26 = history.get("2026", 0.0)
    y27 = history.get("2027", None)

    # Determine primary evaluation values
    total_change = y26 - y24
    g_24_25 = y25 - y24
    g_25_26 = y26 - y25
    
    # If 2027 observation exists, consider latest growth step
    if y27 is not None:
        g_26_27 = y27 - y26
        latest_annual_growth = g_26_27
        overall_growth = y27 - y24
    else:
        latest_annual_growth = g_25_26
        overall_growth = total_change

    max_annual = max(g_24_25, g_25_26, latest_annual_growth if y27 is not None else 0.0)

    if overall_growth < 50.0 and max_annual < 40.0:
        return "STABLE"

    if max_annual >= 250.0 or latest_annual_growth >= 200.0 or (overall_growth > 400.0 and g_25_26 > 150.0):
        return "GROWING FAST"
        
    if overall_growth >= 50.0 or max_annual >= 40.0:
        return "GROWING"

    return "STABLE"
