import React from 'react';
import { 
  AlertOctagon, Flame, Waves, Zap, Building2, 
  Mountain, AlertTriangle, CheckCircle, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { commandStore } from '../../services/store';

export const HazardsView: React.FC = () => {
  const hazards = commandStore.hazards;

  const totalHazards = hazards.length;
  const criticalHazards = hazards.filter((h) => h.severity === 'CRITICAL').length;
  const fireIncidents = hazards.filter((h) => h.hazardType.includes('Fire')).length;
  const floodZones = hazards.filter((h) => h.hazardType.includes('Flood')).length;
  const structuralDamage = hazards.filter((h) => h.hazardType.includes('structure') || h.hazardType.includes('building')).length;
  const electricalHazards = hazards.filter((h) => h.hazardType.includes('Electrical')).length;
  const landslides = hazards.filter((h) => h.hazardType.includes('Landslide')).length;
  const debrisCount = hazards.filter((h) => h.hazardType.includes('Debris')).length;

  // Aggregate Data for Recharts
  const typeCounts: Record<string, number> = {};
  hazards.forEach((h) => {
    typeCounts[h.hazardType] = (typeCounts[h.hazardType] || 0) + 1;
  });
  const typeChartData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

  const severityCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  hazards.forEach((h) => {
    severityCounts[h.severity] = (severityCounts[h.severity] || 0) + 1;
  });
  const severityChartData = [
    { name: 'Critical', value: severityCounts.CRITICAL, color: '#dc2626' },
    { name: 'High', value: severityCounts.HIGH, color: '#ea580c' },
    { name: 'Medium', value: severityCounts.MEDIUM, color: '#ca8a04' },
    { name: 'Low', value: severityCounts.LOW, color: '#525252' },
  ];

  const droneDistribution: Record<string, number> = {};
  hazards.forEach((h) => {
    droneDistribution[h.droneId] = (droneDistribution[h.droneId] || 0) + 1;
  });
  const droneChartData = Object.entries(droneDistribution).map(([drone, count]) => ({ drone, count }));

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded font-mono">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
              DISASTER HAZARD INTELLIGENCE & THREAT MAPPING
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-hover border border-line-strong text-foreground font-bold">
              {totalHazards} THREATS IDENTIFIED
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Geospatial environmental threats categorized by type, severity, and secondary breach risk
          </p>
        </div>
      </div>

      {/* Hazard Type KPI Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-muted">TOTAL HAZARDS</div>
          <div className="text-xl font-bold text-foreground">{totalHazards}</div>
        </div>
        <div className="bg-panel border border-red-200/60 p-3 rounded">
          <div className="text-xs text-red-700">CRITICAL SEVERE</div>
          <div className="text-xl font-bold text-red-700">{criticalHazards}</div>
        </div>
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-secondary flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-700" /> FIRE
          </div>
          <div className="text-xl font-bold text-foreground">{fireIncidents}</div>
        </div>
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-secondary flex items-center gap-1">
            <Waves className="w-3 h-3 text-blue-700" /> FLOOD
          </div>
          <div className="text-xl font-bold text-foreground">{floodZones}</div>
        </div>
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-secondary flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-700" /> ELECTRICAL
          </div>
          <div className="text-xl font-bold text-foreground">{electricalHazards}</div>
        </div>
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-secondary flex items-center gap-1">
            <Building2 className="w-3 h-3 text-orange-700" /> STRUCTURAL
          </div>
          <div className="text-xl font-bold text-foreground">{structuralDamage}</div>
        </div>
        <div className="bg-panel border border-line p-3 rounded">
          <div className="text-xs text-secondary flex items-center gap-1">
            <Mountain className="w-3 h-3 text-purple-700" /> LANDSLIDES
          </div>
          <div className="text-xl font-bold text-foreground">{landslides}</div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Hazards by Type (Bar Chart) */}
        <div className="lg:col-span-7 bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold font-mono text-foreground uppercase mb-3 flex items-center justify-between">
            <span>Hazards Classified by Type</span>
            <span className="text-xs text-muted">EDGE INFERENCE CLASSIFIER</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#444" tick={{ fill: '#596579', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis stroke="#444" tick={{ fill: '#596579', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution (Donut Chart) */}
        <div className="lg:col-span-5 bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold font-mono text-foreground uppercase mb-3">
            Threat Severity Distribution
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hazard Records Table */}
      <div className="bg-panel border border-line rounded overflow-hidden font-mono text-xs">
        <div className="p-3 bg-inset border-b border-line flex items-center justify-between">
          <span className="font-bold text-foreground uppercase">ACTIVE HAZARD REGISTER</span>
          <span className="text-[13px] text-muted">Total verified: {hazards.filter(h => h.status === 'Human Verified').length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-inset text-muted border-b border-line text-xs uppercase">
              <tr>
                <th className="p-2.5">Hazard ID</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5">AI Conf</th>
                <th className="p-2.5">Detecting Drone</th>
                <th className="p-2.5">Recommended Action</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {hazards.map((h) => (
                <tr key={h.hazardId} className="hover:bg-hover transition-colors">
                  <td className="p-2.5 font-bold text-foreground">{h.hazardId}</td>
                  <td className="p-2.5 text-secondary">{h.hazardType}</td>
                  <td className="p-2.5">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        h.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {h.severity}
                    </span>
                  </td>
                  <td className="p-2.5 text-red-700 font-bold">{h.confidence}%</td>
                  <td className="p-2.5 text-secondary">{h.droneId}</td>
                  <td className="p-2.5 text-secondary max-w-xs truncate text-[13px] font-sans">
                    {h.recommendedResponse}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        h.status === 'Human Verified'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : h.status === 'Resolved'
                          ? 'bg-hover text-muted border border-line'
                          : 'bg-hover text-secondary border border-line-strong'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    {h.status !== 'Resolved' && (
                      <button
                        onClick={() => commandStore.updateHazardStatus(h.hazardId, 'Resolved')}
                        className="px-2 py-1 rounded bg-green-50 hover:bg-green-50 border border-green-200 text-green-700 font-bold text-xs transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
