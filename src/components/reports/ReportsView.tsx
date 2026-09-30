import React, { useState } from 'react';
import { 
  FileText, Printer, Download, Copy, Check, 
  ShieldCheck, AlertTriangle, Users, Plane, RefreshCw
} from 'lucide-react';
import { commandStore } from '../../services/store';

export const ReportsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const survivors = commandStore.survivors;
  const criticalSurvivors = survivors.filter((s) => s.priorityLevel === 'CRITICAL' && s.rescueStatus !== 'Rescued');
  const rescuedSurvivors = survivors.filter((s) => s.rescueStatus === 'Rescued');
  const hazards = commandStore.hazards.filter((h) => h.status !== 'Resolved');
  const rakshas = commandStore.rakshas;
  const totalSurveyedKm2 = commandStore.missions.reduce((acc, m) => acc + m.areaCoveredKm2, 0);

  const currentDateStr = new Date().toLocaleString();

  const handleCopyClipboard = () => {
    const textReport = `
=====================================================
RAKSHA AI — SITUATION REPORT (SITREP #04)
Incident: Venice Flood Emergency Response
Commander: ${commandStore.currentUser.name} (${commandStore.currentUser.callsign})
Classification: RESTRICTED / DISASTER TACTICAL
Timestamp: ${currentDateStr}
=====================================================

1. EXECUTIVE SUMMARY:
Autonomous raksha reconnaissance squadron completed continuous aerial sweeps over Adyar Basin and Velachery Sectors. Multi-spectrum AI edge detection identified ${survivors.length} survivor clusters, including ${criticalSurvivors.length} critical priority incidents requiring swift amphibious evacuation. ${hazards.length} environmental hazard zones (active fires, live powerlines, and unstable buildings) have been geofenced.

2. OPERATIONAL STATISTICS:
- Active Reconnaissance Rakshas: ${rakshas.filter(d => d.status === 'ACTIVE').length}/${rakshas.length}
- Total Surveyed Footprint: ${totalSurveyedKm2.toFixed(1)} km²
- Total Survivor Casualties Logged: ${survivors.length}
- Rescued & Stabilized: ${rescuedSurvivors.length}
- Pending High-Priority Extraction: ${criticalSurvivors.length}
- Environmental Hazards Active: ${hazards.length}

3. SQUADRON FLEET READINESS:
${rakshas.map(d => `* ${d.rakshaId}: Status ${d.status}, Battery ${d.battery}%, Nav ${d.navMode}, Area ${d.zone}`).join('\n')}

4. TACTICAL RECOMMENDATIONS:
- Dispatch NDRF Inflatable Zodiac boats along Safe Corridor Bravo.
- Isolate TANGEDCO 11kV substation feeder grid to eliminate water electrification danger.
- Maintain RAKSHA-01 and RAKSHA-02 cyclic relay for uninterrupted thermal FLIR night watch.
=====================================================
`;
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const reportData = {
      incident: 'Venice Flood Emergency Response',
      sitrepNumber: '04',
      generatedAt: new Date().toISOString(),
      officer: commandStore.currentUser,
      statistics: {
        totalSurvivors: survivors.length,
        criticalSurvivors: criticalSurvivors.length,
        rescuedSurvivors: rescuedSurvivors.length,
        activeHazards: hazards.length,
        areaSurveyedKm2: totalSurveyedKm2,
      },
      rakshas: commandStore.rakshas,
      survivors: commandStore.survivors,
      hazards: commandStore.hazards,
      alerts: commandStore.alerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Raksha_SITREP_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1200px] mx-auto text-foreground font-mono text-xs">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
              SITUATION REPORT (SITREP) DISPATCH
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5 font-sans">
            Standardized incident response dossier for command staff, NDRF coordinators, and civic disaster authorities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-hover hover:bg-hover border border-line-strong text-secondary font-bold rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-hover hover:bg-hover border border-line-strong text-secondary font-bold rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Downloaded!' : 'Export JSON'}</span>
          </button>
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-foreground font-bold rounded shadow-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy SITREP'}</span>
          </button>
        </div>
      </div>

      {/* Official SITREP Document Sheet (Printable) */}
      <div className="bg-panel border border-line p-6 md:p-8 rounded space-y-6 text-secondary print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-line pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-red-700 font-bold uppercase tracking-wide">
              DISASTER EMERGENCY RESPONSE COMMAND
            </div>
            <h2 className="text-lg font-bold text-foreground uppercase font-sans mt-0.5">
              INCIDENT SITUATION REPORT (SITREP #04)
            </h2>
            <div className="text-muted text-xs mt-1">
              OPERATION: <strong className="text-secondary">VENICE MONSOON INUNDATION RECON</strong>
            </div>
          </div>

          <div className="text-right text-[13px] space-y-0.5">
            <div>CLASSIFICATION: <span className="text-red-700 font-bold">TACTICAL / RESTRICTED</span></div>
            <div>INCIDENT COMMANDER: <span className="text-foreground font-bold">{commandStore.currentUser.name} ({commandStore.currentUser.callsign})</span></div>
            <div>DATE & TIME: <span className="text-muted">{currentDateStr}</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            1. EXECUTIVE OPERATIONAL SUMMARY
          </h3>
          <p className="text-xs text-secondary font-sans leading-relaxed">
            Autonomous raksha reconnaissance squadron completed continuous aerial sweeps over Adyar Basin and Velachery Sectors. Multi-spectrum AI edge detection identified <strong className="text-foreground">{survivors.length} survivor clusters</strong>, including <strong className="text-red-700">{criticalSurvivors.length} critical priority incidents</strong> requiring swift amphibious evacuation. <strong className="text-foreground">{hazards.length} environmental hazard zones</strong> (active fires, live powerlines, and unstable buildings) have been geofenced. Real-time telemetry confirmed nominal GNSS and Edge SLAM synchronization across all active airframes.
          </p>
        </div>

        {/* Section 2: Mission Statistics Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            2. KEY DISASTER METRICS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-inset p-2.5 rounded border border-line-strong">
              <div className="text-muted text-xs">TOTAL SURVIVORS</div>
              <div className="text-lg font-bold text-foreground">{survivors.length}</div>
            </div>
            <div className="bg-inset p-2.5 rounded border border-red-200/40">
              <div className="text-red-700 text-xs">CRITICAL PENDING</div>
              <div className="text-lg font-bold text-red-700">{criticalSurvivors.length}</div>
            </div>
            <div className="bg-inset p-2.5 rounded border border-line-strong">
              <div className="text-muted text-xs">RESCUED SAFELY</div>
              <div className="text-lg font-bold text-green-700">{rescuedSurvivors.length}</div>
            </div>
            <div className="bg-inset p-2.5 rounded border border-line-strong">
              <div className="text-muted text-xs">SURVEYED AREA</div>
              <div className="text-lg font-bold text-foreground">{totalSurveyedKm2.toFixed(1)} km²</div>
            </div>
          </div>
        </div>

        {/* Section 3: Raksha Fleet Status */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            3. AIR SQUADRON READINESS SUMMARY
          </h3>
          <div className="space-y-1.5">
            {rakshas.map((d) => (
              <div
                key={d.rakshaId}
                className="p-2 bg-inset rounded border border-line-strong flex items-center justify-between"
              >
                <div>
                  <strong className="text-foreground">{d.rakshaId}</strong> ({d.name}) — Status: <span className="text-green-700 font-bold">{d.status}</span>
                </div>
                <div className="text-secondary">
                  Battery: <strong className="text-foreground">{d.battery}%</strong> | Alt: {d.altitude}m | Nav: {d.navMode}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recommendations */}
        <div className="space-y-2 pt-2 border-t border-line">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            4. TACTICAL RECOMMENDATIONS & IMMEDIATE NEXT STEPS
          </h3>
          <ul className="list-disc list-inside space-y-1 font-sans text-xs text-secondary">
            <li>Dispatch NDRF Inflatable Zodiac rescue boats along Safe Corridor Bravo to evacuate rooftop group at Lat 45.4364, Lon 12.3261.</li>
            <li>Coordinate with TANGEDCO civil engineers to de-energize downed 11kV distribution lines near Sector 4.</li>
            <li>Maintain RAKSHA-01 and RAKSHA-02 relay for uninterrupted thermal FLIR night watch.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
