import React, { useState } from 'react';
import { 
  Plane, Battery, Compass, Gauge, Radio, Shield, 
  RotateCcw, Play, Pause, AlertTriangle, Eye, Video,
  Cpu, MapPin, Zap
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { Drone, DroneStatus } from '../../types';

interface DroneFleetViewProps {
  onOpenLiveVision: (droneId: string) => void;
}

export const DroneFleetView: React.FC<DroneFleetViewProps> = ({ onOpenLiveVision }) => {
  const [selectedDroneId, setSelectedDroneId] = useState<string>(commandStore.drones[0]?.droneId || 'RAKSHA-01');
  const drones = commandStore.drones;
  const selectedDrone = drones.find((d) => d.droneId === selectedDroneId) || drones[0];

  const handleStatusChange = (droneId: string, newStatus: DroneStatus) => {
    commandStore.setDroneStatus(droneId, newStatus);
    if (newStatus === 'RETURNING') {
      commandStore.setDroneNavMode(droneId, 'RETURN_TO_HOME');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold font-mono tracking-wide text-foreground uppercase">
              DRONE FLEET COMMAND & TELEMETRY
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 font-mono font-bold">
              {drones.filter((d) => d.status === 'ACTIVE').length} ACTIVE SQUADRON
            </span>
          </div>
          <p className="text-xs text-muted font-mono mt-0.5">
            Autonomous edge-enabled multi-rotor reconnaissance fleet with SLAM & FLIR payloads
          </p>
        </div>

        {/* Global Fleet Quick Actions */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              drones.forEach((d) => commandStore.setDroneStatus(d.droneId, 'RETURNING'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50/80 hover:bg-orange-50 border border-orange-200 text-orange-700 rounded font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>GLOBAL RECALL (ALL RTH)</span>
          </button>
          <button
            onClick={() => {
              drones.forEach((d) => commandStore.setDroneStatus(d.droneId, 'ACTIVE'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-foreground rounded font-bold transition-colors shadow-lg"
          >
            <Play className="w-3.5 h-3.5" />
            <span>RESUME ALL PATROLS</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drones.map((drone) => {
          const isSelected = selectedDrone.droneId === drone.droneId;
          return (
            <div
              key={drone.droneId}
              onClick={() => setSelectedDroneId(drone.droneId)}
              className={`bg-panel border rounded p-4 cursor-pointer transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-red-600/70 ring-1 ring-red-600/30'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold font-mono text-foreground">{drone.droneId}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        drone.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : drone.status === 'RETURNING'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse'
                          : 'bg-hover text-secondary border border-line-strong'
                      }`}
                    >
                      {drone.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-secondary font-medium">{drone.name}</div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-foreground">
                    <Battery className={`w-4 h-4 ${drone.battery > 30 ? 'text-green-700' : 'text-red-700'}`} />
                    <span>{drone.battery}%</span>
                  </div>
                  <div className="text-xs font-mono text-muted">{drone.signalStrength} dBm</div>
                </div>
              </div>

              {/* Hardware Specs */}
              <div className="text-[13px] font-mono text-secondary mb-3 bg-inset p-2 rounded border border-line">
                <div className="text-secondary font-bold truncate">{drone.model}</div>
                <div className="text-foreground mt-0.5 text-xs">{drone.zone}</div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 font-mono text-center mb-3">
                <div className="bg-inset p-2 rounded border border-line">
                  <div className="text-[11px] text-muted">ALTITUDE</div>
                  <div className="text-xs font-bold text-foreground">{drone.altitude} m</div>
                </div>
                <div className="bg-inset p-2 rounded border border-line">
                  <div className="text-[11px] text-muted">SPEED</div>
                  <div className="text-xs font-bold text-foreground">{drone.speed} m/s</div>
                </div>
                <div className="bg-inset p-2 rounded border border-line">
                  <div className="text-[11px] text-muted">HEADING</div>
                  <div className="text-xs font-bold text-foreground">{drone.heading}°</div>
                </div>
              </div>

              {/* Flight stats */}
              <div className="flex items-center justify-between text-xs font-mono text-muted mb-3 px-1">
                <span>Flight Time: <strong className="text-secondary">{drone.flightTimeMinutes}m</strong></span>
                <span>Distance: <strong className="text-secondary">{drone.distanceTravelledKm} km</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-line">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLiveVision(drone.droneId);
                  }}
                  className="py-1.5 px-2 bg-hover hover:bg-hover border border-line-strong text-foreground font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-red-700" />
                  <span>Live Vision</span>
                </button>

                {drone.status === 'ACTIVE' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(drone.droneId, 'STANDBY');
                    }}
                    className="py-1.5 px-2 bg-inset hover:bg-hover border border-line text-secondary rounded font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Hold/Hover</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(drone.droneId, 'ACTIVE');
                    }}
                    className="py-1.5 px-2 bg-green-50 hover:bg-green-50 border border-green-200 text-green-700 rounded font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Patrol</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Diagnostic & Telemetry Inspector for Selected Drone */}
      {selectedDrone && (
        <div className="bg-panel border border-line rounded p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-line gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-hover border border-line-strong flex items-center justify-center text-foreground font-mono font-bold text-sm">
                {selectedDrone.droneId.slice(-2)}
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
                  {selectedDrone.droneId} — {selectedDrone.name}
                  <span className="text-xs px-2 py-0.5 rounded bg-inset text-secondary border border-line">
                    {selectedDrone.navMode}
                  </span>
                </h2>
                <p className="text-[13px] text-muted font-mono">
                  Coordinates: Lat {selectedDrone.latitude.toFixed(6)}°N, Lon {selectedDrone.longitude.toFixed(6)}°E
                </p>
              </div>
            </div>

            {/* Operator Control Deck */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => handleStatusChange(selectedDrone.droneId, 'RETURNING')}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-50 border border-orange-200 text-orange-700 font-bold rounded flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Issue RTH Command</span>
              </button>
              <button
                onClick={() => handleStatusChange(selectedDrone.droneId, 'EMERGENCY')}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-50 border border-red-200 text-red-700 font-bold rounded flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Emergency Land</span>
              </button>
              <button
                onClick={() => onOpenLiveVision(selectedDrone.droneId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-foreground font-bold rounded flex items-center gap-1.5 shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Dual Feeds</span>
              </button>
            </div>
          </div>

          {/* Subsystem Health Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-inset p-3 rounded border border-line">
              <div className="text-muted text-xs mb-1 uppercase font-bold">GPS / GNSS RECEIVER</div>
              <div className="text-green-700 font-bold text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                {selectedDrone.gpsStatus} (18 SATS)
              </div>
              <div className="text-xs text-muted mt-1">RTK differential correction active</div>
            </div>

            <div className="bg-inset p-3 rounded border border-line">
              <div className="text-muted text-xs mb-1 uppercase font-bold">IMU / ATTITUDE FILTER</div>
              <div className="text-green-700 font-bold text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {selectedDrone.imuStatus}
              </div>
              <div className="text-xs text-muted mt-1">Dual 6-DOF redundant gyros</div>
            </div>

            <div className="bg-inset p-3 rounded border border-line">
              <div className="text-muted text-xs mb-1 uppercase font-bold">PRIMARY RGB OPTICS</div>
              <div className="text-foreground font-bold text-sm flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-red-700" />
                {selectedDrone.cameraStatus}
              </div>
              <div className="text-xs text-muted mt-1">4K Sony Exmor CMOS Sensor</div>
            </div>

            <div className="bg-inset p-3 rounded border border-line">
              <div className="text-muted text-xs mb-1 uppercase font-bold">FLIR THERMAL PAYLOAD</div>
              <div className="text-red-700 font-bold text-sm flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {selectedDrone.thermalStatus}
              </div>
              <div className="text-xs text-muted mt-1">LWIR 8-14μm Radiometric Core</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
