import React from 'react';
import { 
  BarChart3, TrendingUp, Users, Clock, 
  MapPin, ShieldCheck, Activity, Plane
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { commandStore } from '../../services/store';

export const AnalyticsView: React.FC = () => {
  const missions = commandStore.missions;
  const survivors = commandStore.survivors;
  const hazards = commandStore.hazards;

  // Chart 1: Survivors Detected Per Mission
  const survivorMissionData = missions.map((m) => {
    const survCount = survivors.filter((s) => s.droneId === m.assignedDroneIds[0]).length;
    return {
      name: m.missionId,
      survivors: survCount,
      areaKm2: m.areaCoveredKm2,
    };
  });

  // Chart 2: Hazard Detections Timeline (Mock historical trend for demo)
  const timelineData = [
    { time: '09:00', flood: 2, fire: 0, structure: 1 },
    { time: '09:30', flood: 4, fire: 1, structure: 2 },
    { time: '10:00', flood: 6, fire: 2, structure: 3 },
    { time: '10:30', flood: 7, fire: 2, structure: 4 },
    { time: '11:00', flood: 8, fire: 2, structure: 5 },
  ];

  // Chart 3: Detection Confidence Histogram
  const confidenceData = [
    { range: '60-69%', count: 1 },
    { range: '70-79%', count: 3 },
    { range: '80-89%', count: 8 },
    { range: '90-99%', count: 12 },
  ];

  // Chart 4: Drone Flight Hours
  const droneFlightData = commandStore.drones.map((d) => ({
    name: d.droneId,
    minutes: d.flightTimeMinutes,
    km: d.distanceTravelledKm,
  }));

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
              DISASTER MISSION ANALYTICS & AI PERFORMANCE
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5 font-sans">
            Comprehensive telemetry analytics, coverage rates, model accuracy benchmarks, and extraction speed
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-inset border border-line">
            AVG EXTRACTION: <strong className="text-green-700">18.4 MIN</strong>
          </div>
          <div className="px-3 py-1.5 rounded bg-inset border border-line">
            MODEL ACCURACY: <strong className="text-red-700">94.2% mAP</strong>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Survivors Detected & Area Surveyed */}
        <div className="bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold text-foreground uppercase mb-3 flex items-center justify-between">
            <span>Survivors Detected per Mission</span>
            <span className="text-xs text-muted">AIR CORRIDOR RECON</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={survivorMissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#dce2e9" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="survivors" fill="#dc2626" radius={[2, 2, 0, 0]} name="Survivors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hazard Accumulation Timeline */}
        <div className="bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold text-foreground uppercase mb-3 flex items-center justify-between">
            <span>Disaster Hazard Detections Cumulative Trend</span>
            <span className="text-xs text-muted">TEMPORAL PROGRESSION</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#dce2e9" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="flood" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Flood Surges" />
                <Area type="monotone" dataKey="fire" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.4} name="Fires" />
                <Area type="monotone" dataKey="structure" stackId="1" stroke="#ea580c" fill="#ea580c" fillOpacity={0.4} name="Structural" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: AI Inference Confidence Distribution */}
        <div className="bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold text-foreground uppercase mb-3 flex items-center justify-between">
            <span>Detection Confidence Distribution (YOLOv8 & FLIR)</span>
            <span className="text-xs text-green-700 font-bold">HIGH RELIABILITY</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#dce2e9" strokeDasharray="3 3" />
                <XAxis dataKey="range" stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[2, 2, 0, 0]} name="Detections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Drone Flight Endurance & Distance */}
        <div className="bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold text-foreground uppercase mb-3 flex items-center justify-between">
            <span>Fleet Flight Endurance (Minutes Flown)</span>
            <span className="text-xs text-muted">LIPO HEALTH CHECK</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={droneFlightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#dce2e9" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#596579', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dce2e9', color: '#182333', fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="minutes" fill="#64748b" radius={[2, 2, 0, 0]} name="Minutes Flown" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
