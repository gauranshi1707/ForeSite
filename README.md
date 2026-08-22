# ForeSite — Predictive Land-Change Intelligence System

> **Smart India Hackathon 2026 MVP** | Multi-Temporal Satellite Land Parcel Monitoring & Enforcement Prioritization System

ForeSite is an AI-assisted decision-support web system for monitoring potential encroachment on government land parcels using multi-temporal Earth Observation (EO) imagery.

Rather than merely displaying raw satellite imagery or detecting generic visual changes, ForeSite operates on a closed enforcement loop:

**DETECT → PRIORITIZE → ACT → RE-CHECK → RE-ESCALATE**

---

## 🚀 Key Features & Product Workflow

1. **Interactive GIS Land Map (~1,000 Monitored Parcels)**:
   - Visualizes government parcels with risk-tiered polygons and centroid markers (Critical, High, Medium, Low/Stable).
   - Filter by district, state, land category, trajectory, and status.

2. **2024–2026 Multi-Temporal Timeline**:
   - Compares baseline (2024), intermediate (2025), current (2026), and simulated post-notice (2027) land-use change.

3. **Transparent Trajectory Classifier**:
   - `STABLE`: Negligible built-up footprint expansion (< 50 m²).
   - `GROWING`: Moderate, consistent expansion across observation epochs.
   - `GROWING FAST`: Rapid expansion (> 300 m² growth or high velocity).

4. **Explainable Urgency Scoring Engine (0–100 Score)**:
   - **Growth Velocity (30%)**
   - **Recent Change Magnitude (20%)**
   - **Accumulated Built-up Area (15%)**
   - **Multi-Year Continuity (15%)**
   - **Post-Notice Non-Compliance (20%)**
   - Renders audit-ready point breakdowns (+28 rapid growth, +20 recent change, +17 post-notice growth).

5. **Ranked Priority Inspection Alert List**:
   - Auto-prioritizes high-risk land parcels so enforcement officers inspect the most critical cases first.

6. **Official Governance Action System**:
   - Update statuses: `Under Review`, `Inspection Scheduled`, `Notice Issued`, `Resolved`, `Re-check Required`.
   - Records timestamped audit logs with authorizing officer details.

7. **Post-Notice Verification & Re-Escalation**:
   - Detects if land encroachment continues after legal notices are issued.
   - Automatically marks parcel as **RE-CHECK REQUIRED**, re-escalates urgency score, and displays prominent violation warnings.

8. **Human-in-the-Loop Compliance**:
   - AI identifies and prioritizes cases; human officials verify and make final legal determinations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom GIS Dark Theme
- **Mapping**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11 + FastAPI
- **Server**: Uvicorn
- **Data Access**: SQLite abstraction layer (PostgreSQL + PostGIS ready)
- **ML / Rules**: Modular Python engines (`ml/trajectory.py`, `ml/scoring.py`, `ml/change_detection.py`)

---

## 📁 Repository Structure

```
ForeSite/
├── backend/
│   ├── api/
│   │   ├── parcels.py       # REST API: Parcel details, history, imagery
│   │   ├── alerts.py        # REST API: Ranked priority queue
│   │   ├── statistics.py    # REST API: Dashboard KPI aggregation
│   │   └── actions.py       # REST API: Official actions & 2027 recheck trigger
│   ├── ml/
│   │   ├── trajectory.py    # Trajectory classification rules
│   │   ├── scoring.py       # Explainable 0-100 urgency scoring engine
│   │   └── change_detection.py # Earth Observation imagery abstraction layer
│   ├── data/
│   │   ├── db.py            # Data abstraction & SQLite persistence layer
│   │   └── seed_generator.py # Reproducible 1,000 synthetic land parcel seed data
│   ├── main.py              # FastAPI server entrypoint
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Portal header with live status
│   │   │   ├── KpiCards.jsx         # Monitoring KPI summary statistics
│   │   │   ├── InteractiveMap.jsx   # Leaflet map rendering 1,000 land parcels
│   │   │   ├── TimelineSlider.jsx   # Multi-temporal epoch controller (2024-2027)
│   │   │   ├── ParcelDetailModal.jsx# Split before/after imagery & graph inspection
│   │   │   ├── ScoreExplainability.jsx # Human-readable score point breakdown
│   │   │   ├── ActionFormModal.jsx  # Official action recording form
│   │   │   ├── PriorityAlertList.jsx# Filterable ranked inspection queue
│   │   │   ├── ClosedLoopWorkflow.jsx# DETECT -> PRIORITIZE -> ACT -> RE-CHECK banner
│   │   │   └── HeroDemoBanner.jsx   # One-click judge walkthrough launcher
│   │   ├── services/
│   │   │   └── api.js              # REST client interface
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 💻 How to Run ForeSite Locally

### Step 1: Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend API will start at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)

### Step 2: Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will start at: `http://localhost:3000`

---

## 🎯 17-Step Hackathon Judge Demo Walkthrough

Follow these exact steps to demonstrate ForeSite's end-to-end capability:

1. **Open Dashboard**: Navigate to `http://localhost:3000`.
2. **Inspect Monitored Parcels**: Observe ~1,000 parcels rendered on the interactive Leaflet map.
3. **Verify KPIs**: Check top KPI bar (1,000 Parcels, Active Alerts, High Priority, Requiring Re-check).
4. **Locate Hero Case**: Click **Launch Judge Demo (Hero Parcel #PL-4587)** button or select `PL-4587`.
5. **Timeline Exploration**: Toggle timeline slider between `2024`, `2025`, and `2026`.
6. **Change History**: Observe built-up expansion (2024: 120 m² → 2025: 480 m² → 2026: 920 m²).
7. **Trajectory Classification**: Confirm trajectory is classified as **GROWING FAST**.
8. **Urgency Score**: Confirm Urgency Score is **85/100** (High Priority).
9. **Explainable AI Breakdown**: Review the transparent point breakdown (+30 Growth Velocity, +15 Recent Magnitude, +15 Built-up Area, +15 Multi-Year Continuity).
10. **Ranked Alert Queue**: Locate `PL-4587` in the Priority Inspection Alert table sorted at rank #1.
11. **Open Official Action Panel**: Click **Record Official Enforcement Action**.
12. **Record Notice**: Select **Issue Official Notice**, add notes (Ref: `DEL/SWD/2026/0891`), and click **Record & Persist Action**.
13. **Simulate 2027 Re-Observation**: Click **Simulate 2027 Post-Notice Re-Check (1,150 m²)** inside the parcel modal.
14. **Post-Notice Violation Detection**: Observe built-up expansion to 1,150 m².
15. **Auto-Escalation**: See status automatically update to **RE-CHECK REQUIRED** with a prominent **POST-NOTICE VIOLATION DETECTED** banner.
16. **Score Escalation**: Observe Urgency Score jump to **95/100** due to post-notice non-compliance penalties (+20 pts).
17. **Audit Log Verification**: Review the timestamped audit log timeline capturing every satellite observation and official legal action.

---

## 🛰️ Future Sentinel-2 & Google Earth Engine Integration

ForeSite is architected with a decoupled `get_parcel_imagery()` service abstraction in `ml/change_detection.py`. 

To transition from prototype synthetic data to live Sentinel-2 production:
1. Replace `get_parcel_imagery()` with Google Earth Engine Python API (`ee.ImageCollection('COPERNICUS/S2_SR')`) or Sentinel Hub REST API.
2. Compute Normalized Difference Built-up Index (NDBI) and Normalized Difference Vegetation Index (NDVI) dynamically.
3. Migrate `backend/data/db.py` to PostgreSQL + PostGIS (`ST_Contains`, `ST_Area`, `ST_Intersects`) without changing any API contracts or React components.

---

## ⚖️ Legal & Governance Statement

*ForeSite is an AI-assisted decision-support prototype built for Smart India Hackathon 2026. Prototype synthetic data is clearly labeled. AI models prioritize potential change cases to assist officials; final legal determinations remain under human judicial authority.*
