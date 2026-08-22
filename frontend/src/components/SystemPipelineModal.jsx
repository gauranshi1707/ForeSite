import React from 'react';

export default function SystemPipelineModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-stone-900 text-[14px]">System Architecture & Verification Pipeline</h2>
            <p className="text-[10.5px] text-stone-500 mt-0.5">Continuous Monitoring & Human-in-the-Loop Verification Workflow</p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-lg font-bold leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Pipeline flow */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-semibold text-stone-800 uppercase tracking-wider">Geospatial Data Processing Flow</h3>
            
            <div className="relative border-l border-stone-200 ml-3 pl-6 space-y-5">
              
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">1</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Earth Observation (EO) Satellite Data</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Continuous data ingestion from Sentinel-2 MSI (Level 2A Bottom-of-Atmosphere reflectance) and Landsat-9 imagery streams.</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">2</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Atmospheric Preprocessing & Masking</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Cloud, shadow, and haze masking using Sentinel-2 Scene Classification (SCL) and QA bands to eliminate false alarms.</p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">3</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Spectral Index Ingestion</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Continuous computation of specialized indices to identify physical ground properties:</p>
                <div className="mt-2 bg-stone-50 p-2.5 rounded border border-stone-200 font-mono text-[10px] text-stone-600 space-y-1">
                  <div>• NDBI (Normalized Difference Built-up Index): (SWIR1 - NIR) / (SWIR1 + NIR)</div>
                  <div>• NDVI (Normalized Difference Vegetation Index): (NIR - Red) / (NIR + Red)</div>
                  <div>• NDWI (Normalized Difference Water Index): (Green - NIR) / (Green + NIR)</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">4</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Multi-Temporal Change Differencing</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Comparison of baseline imagery (e.g. 2024) against recent observations (2025-2026) using difference thresholds to build a binary change mask overlay.</p>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">5</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Geospatial Cadastral Intersection</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Intersection of the pixel-level change mask with official government parcel boundary layers using geo-spatial overlay algorithms.</p>
              </div>

              {/* Step 6 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">6</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Scoring, Prioritization & Confidence Assessment</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Priority Engine evaluates growth velocity, recency, persistence, active enforcement notices, and separates **Urgency Score (Priority)** from **Detection Confidence**.</p>
              </div>

              {/* Step 7 */}
              <div className="relative">
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-blue-700 font-mono">7</div>
                <h4 className="text-[12px] font-semibold text-stone-900">Human-in-the-Loop Field Verification</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Prioritized cases are dispatched to field inspectors who record verification surveys (e.g., Confirmed Land-Use Change, Authorized Activity, False Positive) to close the feedback loop.</p>
              </div>

            </div>
          </div>

          <hr className="border-stone-200" />

          {/* Differentiator summary */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-2">
            <h4 className="text-[11.5px] font-semibold text-stone-900">Core Value Differentiator</h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Standard systems merely alert on satellite pixel changes, leading to alert fatigue from vegetation changes or road construction. **ForeSite** analyzes temporal change trajectories and overlaps cadastral data with human-in-the-loop validation outcomes, mapping a continuous, closed-loop workflow:
            </p>
            <div className="text-[10px] font-mono font-bold text-blue-700 flex items-center justify-between gap-1 pt-1.5 overflow-x-auto">
              <span>MONITOR</span>
              <span>→</span>
              <span>DETECT</span>
              <span>→</span>
              <span>ANALYZE</span>
              <span>→</span>
              <span>PRIORITIZE</span>
              <span>→</span>
              <span>VERIFY</span>
              <span>→</span>
              <span>ACT</span>
              <span>→</span>
              <span>RE-CHECK</span>
              <span>→</span>
              <span>RE-ESCALATE</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-medium transition-colors"
          >
            Close Diagram
          </button>
        </div>

      </div>
    </div>
  );
}
