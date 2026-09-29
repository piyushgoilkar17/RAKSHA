import React from 'react';
import { 
  Plane, Users, ShieldAlert, AlertTriangle, MapPin, 
  Battery, Radio, Gauge, Compass, Activity, ArrowRight,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { DisasterMap } from '../map/DisasterMap';
import { commandStore } from '../../services/store';
import { Survivor, Hazard, Drone } from '../../types';

interface OverviewDashboardProps {
  onNavigate: (page: any) => void;
  onSelectSurvivor?: (s: Survivor) => void;
  onSelectHazard?: (h: Hazard) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onSelectSurvivor,
  onSelectHazard,
}) => {
  const drones = commandStore.drones;
  const activeDrones = drones.filter((d) => d.status === 'ACTIVE');
  const survivors = commandStore.survivors;
  const criticalSurvivors = survivors.filter((s) => s.priorityLevel === 'CRITICAL' && s.rescueStatus !== 'Rescued');
  const hazards = commandStore.hazards.filter((h) => h.status !== 'Resolved');
  const criticalAlerts = commandStore.alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
  const totalSurveyedKm2 = commandStore.missions.reduce((acc, m) => acc + m.areaCoveredKm2, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto text-foreground">
      {/* 6 Real-time KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 min-[1600px]:grid-cols-6 gap-3">
        {/* Card 1: Active Drones */}
        <div 
          onClick={() => onNavigate('drones')}
          className="bg-panel border border-line hover:border-line-strong p-4 rounded-md cursor-pointer transition-colors group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-muted text-xs uppercase font-bold tracking-wide mb-1">
            <span>ACTIVE DRONES</span>
            <Plane className="w-3.5 h-3.5 text-secondary group-hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{activeDrones.length}</span>
            <span className="text-[13px] text-green-700 font-mono font-bold">/{drones.length} ONLINE</span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all" 
              style={{ width: `${(activeDrones.length / Math.max(1, drones.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 2: Survivors Detected */}
        <div 
          onClick={() => onNavigate('survivors')}
          className="bg-panel border border-line hover:border-line-strong p-4 rounded-md cursor-pointer transition-colors group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-muted text-xs uppercase font-bold tracking-wide mb-1">
            <span>SURVIVORS</span>
            <Users className="w-3.5 h-3.5 text-secondary group-hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{survivors.length}</span>
            <span className="text-xs text-green-700 font-mono font-bold">
              {survivors.filter((s) => s.rescueStatus === 'Rescued').length} SAFE
            </span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div className="h-full bg-green-500 w-[65%]" />
          </div>
        </div>

        {/* Card 3: Critical Survivors */}
        <div 
          onClick={() => onNavigate('survivors')}
          className="bg-panel border border-red-200/60 hover:border-red-600 p-4 rounded-md cursor-pointer transition-colors group relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-red-700 text-xs uppercase font-bold tracking-wide mb-1">
            <span>CRITICAL RESCUE</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-700 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-red-700">{criticalSurvivors.length}</span>
            <span className="text-xs text-red-700 font-mono font-bold">PRIORITY</span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div className="h-full bg-red-600 w-full animate-pulse" />
          </div>
        </div>

        {/* Card 4: Hazards Detected */}
        <div 
          onClick={() => onNavigate('hazards')}
          className="bg-panel border border-line hover:border-line-strong p-4 rounded-md cursor-pointer transition-colors group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-muted text-xs uppercase font-bold tracking-wide mb-1">
            <span>HAZARDS DETECTED</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-orange-700">{hazards.length}</span>
            <span className="text-xs text-muted font-mono">ACTIVE</span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div className="h-full bg-orange-500 w-[45%]" />
          </div>
        </div>

        {/* Card 5: Area Surveyed */}
        <div 
          className="bg-panel border border-line p-4 rounded-md "
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-muted text-xs uppercase font-bold tracking-wide mb-1">
            <span>AREA SURVEYED</span>
            <MapPin className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{totalSurveyedKm2.toFixed(1)}</span>
            <span className="text-xs text-muted font-mono font-bold">KM²</span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div className="h-full bg-blue-500 w-[70%]" />
          </div>
        </div>

        {/* Card 6: Active Alerts */}
        <div 
          onClick={() => onNavigate('alerts')}
          className="bg-panel border border-line hover:border-line-strong p-4 rounded-md cursor-pointer transition-colors group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-muted text-xs uppercase font-bold tracking-wide mb-1">
            <span>ACTIVE ALERTS</span>
            <Radio className="w-3.5 h-3.5 text-red-700 animate-ping" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-red-700">{criticalAlerts.length}</span>
            <span className="text-xs text-muted font-mono">CRITICAL</span>
          </div>
          <div className="w-full h-1 bg-hover mt-2 rounded overflow-hidden">
            <div className="h-full bg-red-600 w-[80%]" />
          </div>
        </div>
      </div>

      {/* Main Center Grid: Live Tactical Map (Left) & Alert / Triage (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Map Container with Geometric Balance border */}
        <div className="xl:col-span-8 min-w-0 bg-panel border border-line rounded overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-3 bg-panel border-b border-line flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                LIVE DISASTER TACTICAL MAP — VENICE FLOOD SECTOR
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => onNavigate('map')}
                className="text-secondary hover:text-foreground flex items-center gap-1 font-bold uppercase transition-colors"
              >
                Expand Map View <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <DisasterMap
              onSelectSurvivor={onSelectSurvivor}
              onSelectHazard={onSelectHazard}
              heightClass="h-full min-h-[500px]"
            />
          </div>
        </div>

        {/* Right Column: High-Priority Triage & Live Alert Feed */}
        <div className="xl:col-span-4 min-w-0 space-y-4 flex flex-col">
          {/* Critical Alerts Feed */}
          <div className="bg-panel border border-line rounded p-3.5 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                  EMERGENCY ALERTS FEED
                </span>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-mono text-secondary hover:text-foreground uppercase font-bold transition-colors"
              >
                View All ({commandStore.alerts.length})
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-1">
              {commandStore.alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.alertId}
                  className={`p-2.5 rounded-r text-xs font-mono transition-colors ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-inset border-l-2 border-red-600 text-foreground'
                      : 'bg-inset border-l-2 border-orange-500 text-foreground'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        alert.severity === 'CRITICAL' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {alert.severity} • {alert.droneId}
                    </span>
                    <span className="text-xs text-muted">{alert.createdAt}</span>
                  </div>
                  <p className="text-[13px] font-sans font-medium text-foreground leading-snug mb-1">
                    {alert.message}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1 border-t border-line">
                    <span className="truncate mr-2 text-secondary">REC: {alert.recommendation}</span>
                    {alert.status === 'NEW' && (
                      <button
                        onClick={() => commandStore.updateAlertStatus(alert.alertId, 'ACKNOWLEDGED')}
                        className="text-orange-700 hover:text-foreground shrink-0 font-bold underline"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Priority Rescue Queue */}
          <div className="bg-panel border border-line rounded p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-700" />
                <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                  AI RESCUE PRIORITY QUEUE
                </span>
              </div>
              <span className="text-[11px] font-mono text-green-700 bg-inset px-1.5 py-0.5 rounded border border-line">
                DYNAMIC SCORING
              </span>
            </div>

            <div className="space-y-2">
              {survivors
                .filter((s) => s.rescueStatus !== 'Rescued')
                .slice(0, 3)
                .map((surv) => (
                  <div
                    key={surv.survivorId}
                    className="p-2 bg-inset border border-line rounded flex flex-wrap items-center justify-between gap-2 gap-2 hover:border-line-strong transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-hover border border-line-strong flex items-center justify-center font-mono font-bold text-xs text-foreground">
                        {surv.survivorId}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground font-mono">
                            {surv.peopleCount} Person(s)
                          </span>
                          <span
                            className={`text-[11px] px-1 rounded font-mono font-bold ${
                              surv.priorityLevel === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {surv.priorityLevel}
                          </span>
                        </div>
                        <div className="text-xs text-muted font-mono">
                          Score: <span className="text-red-700 font-bold">{surv.priorityScore}/100</span> • {surv.detectedAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('survivors')}
                      className="px-2 py-1 bg-hover hover:bg-hover border border-line-strong text-foreground text-xs font-mono font-bold rounded transition-colors"
                    >
                      Triage
                    </button>
                  </div>
                ))}
            </div>

            {/* Emergency Broadcast Quick Action */}
            <div className="mt-3 pt-2.5 border-t border-line">
              <button
                onClick={() => onNavigate('alerts')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-foreground font-bold text-xs rounded transition-colors tracking-wide uppercase font-mono"
              >
                BROADCAST EMERGENCY ALERT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Drone Fleet Telemetry Section */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-secondary uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-green-700" />
            <span>REAL-TIME DRONE FLEET TELEMETRY (EDGE MESH MAVLINK)</span>
          </div>
          <button
            onClick={() => onNavigate('drones')}
            className="text-xs font-mono text-secondary hover:text-foreground font-bold flex items-center gap-1 uppercase transition-colors"
          >
            Manage Fleet <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {drones.map((drone) => (
            <div
              key={drone.droneId}
              className="bg-panel border border-line rounded p-3.5 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-foreground">{drone.droneId}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        drone.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {drone.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted truncate max-w-[200px]">{drone.name}</div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                    <Battery className={`w-3.5 h-3.5 ${drone.battery > 30 ? 'text-green-700' : 'text-red-700'}`} />
                    <span>{drone.battery}%</span>
                  </div>
                  <div className="text-[11px] font-mono text-muted">{drone.signalStrength} dBm</div>
                </div>
              </div>

              {/* Progress bar for Battery */}
              <div className="w-full h-1 bg-hover rounded overflow-hidden mb-2.5">
                <div 
                  className={`h-full transition-all ${drone.battery > 30 ? 'bg-green-500' : 'bg-red-600'}`}
                  style={{ width: `${drone.battery}%` }}
                />
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono mb-2">
                <div className="bg-inset p-1.5 rounded border border-line">
                  <div className="text-[11px] text-muted uppercase font-bold">ALT</div>
                  <div className="text-xs font-bold text-foreground">{drone.altitude}m</div>
                </div>
                <div className="bg-inset p-1.5 rounded border border-line">
                  <div className="text-[11px] text-muted uppercase font-bold">SPD</div>
                  <div className="text-xs font-bold text-foreground">{drone.speed}m/s</div>
                </div>
                <div className="bg-inset p-1.5 rounded border border-line">
                  <div className="text-[11px] text-muted uppercase font-bold">HDG</div>
                  <div className="text-xs font-bold text-foreground">{drone.heading}°</div>
                </div>
                <div className="bg-inset p-1.5 rounded border border-line">
                  <div className="text-[11px] text-muted uppercase font-bold">GPS</div>
                  <div className="text-xs font-bold text-green-700">{drone.gpsStatus}</div>
                </div>
              </div>

              {/* Location & Sensor Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted pt-2 border-t border-line">
                <span>LAT: {drone.latitude.toFixed(4)} | LON: {drone.longitude.toFixed(4)}</span>
                <span className="text-secondary font-bold">{drone.navMode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
