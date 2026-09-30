import React, { useState, useEffect } from 'react';
import { 
  Eye, Zap, Camera, Shield, Crosshair, 
  Maximize2, Radio, Sliders, RefreshCw, Cpu
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { createSvgImageDataUrl } from '../../services/seedData';

interface LiveVisionViewProps {
  initialRakshaId?: string;
}

export const LiveVisionView: React.FC<LiveVisionViewProps> = ({ initialRakshaId = 'RAKSHA-01' }) => {
  const [activeRakshaId, setActiveRakshaId] = useState<string>(initialRakshaId);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState(true);
  const [thermalPalette, setThermalPalette] = useState<'IRONBOW' | 'WHITE_HOT' | 'RAINBOW'>('IRONBOW');
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const raksha = commandStore.rakshas.find((d) => d.rakshaId === activeRakshaId) || commandStore.rakshas[0];
  const activeDetections = commandStore.detections.filter((det) => det.rakshaId === raksha?.rakshaId);

  const handleCaptureSnapshot = () => {
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-3 rounded font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-xs font-bold text-foreground uppercase tracking-wider">
              DUAL-SPECTRUM LIVE SENSOR VISION
            </h1>
          </div>

          <div className="h-4 w-[1px] bg-hover" />

          {/* Raksha Selector Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted text-xs font-bold uppercase">RAKSHA FEED:</span>
            {commandStore.rakshas.map((d) => (
              <button
                key={d.rakshaId}
                onClick={() => setActiveRakshaId(d.rakshaId)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  activeRakshaId === d.rakshaId
                    ? 'bg-red-600 text-foreground'
                    : 'bg-inset text-muted hover:text-foreground border border-line'
                }`}
              >
                {d.rakshaId}
              </button>
            ))}
          </div>
        </div>

        {/* Vision Display Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showBoundingBoxes
                ? 'bg-hover border-line-strong text-foreground font-bold'
                : 'bg-inset border-line text-muted'
            }`}
          >
            AI Bounding Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowTelemetryHUD(!showTelemetryHUD)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showTelemetryHUD
                ? 'bg-hover border-line-strong text-foreground font-bold'
                : 'bg-inset border-line text-muted'
            }`}
          >
            HUD Overlay: {showTelemetryHUD ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleCaptureSnapshot}
            className="px-3 py-1 bg-inset hover:bg-hover border border-line text-foreground rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-red-700" />
            <span>{snapshotSuccess ? 'Snapshot Saved!' : 'Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Cameras Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: RGB CAMERA */}
        <div className="bg-panel border border-line rounded overflow-hidden flex flex-col">
          <div className="p-3 bg-panel border-b border-line flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-700" />
              <span className="font-bold text-foreground uppercase text-[13px]">PRIMARY RGB OPTICS (4K 60FPS)</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-hover border border-line-strong text-secondary">
                EDGE YOLOv8-X
              </span>
            </div>
            <div className="text-xs text-green-700 font-bold">BITRATE: 18.4 Mbps</div>
          </div>

          <div className="relative aspect-video bg-inset overflow-hidden select-none flex items-center justify-center">
            {/* Aerial Simulated Disaster Feed */}
            <img
              src={createSvgImageDataUrl('survivor')}
              alt="Simulated Aerial RGB Raksha Feed"
              className="w-full h-full object-cover"
            />

            {/* Simulated Live Tactical HUD Overlay with Crosshair Reticles */}
            {showTelemetryHUD && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-green-700 text-xs">
                {/* Geometric Balance red crosshair reticle lines */}
                <div className="w-full h-[1px] bg-red-500/30 absolute top-1/2 left-0 pointer-events-none" />
                <div className="h-full w-[1px] bg-red-500/30 absolute top-0 left-1/2 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs">
                    <div>CAM: SONY EXMOR 4K</div>
                    <div>FPS: 59.8 | EXP: 1/1200</div>
                    <div>FOV: 84° WIDE</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs text-right">
                    <div>ALT: {raksha?.altitude} M AGL</div>
                    <div>SPD: {raksha?.speed} M/S</div>
                    <div>HDG: {raksha?.heading}°</div>
                  </div>
                </div>

                {/* Center Pitch / Roll Horizon Ladder */}
                <div className="self-center flex flex-col items-center z-10">
                  <div className="w-20 h-[1px] bg-green-500/80 my-1" />
                  <div className="w-12 h-[1px] bg-green-500/60 my-1" />
                  <Crosshair className="w-6 h-6 text-red-700 animate-pulse my-1" />
                  <div className="w-12 h-[1px] bg-green-500/60 my-1" />
                  <div className="w-20 h-[1px] bg-green-500/80 my-1" />
                </div>

                <div className="flex justify-between items-end z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs">
                    <div>LAT: {raksha?.latitude.toFixed(5)}° N</div>
                    <div>LON: {raksha?.longitude.toFixed(5)}° E</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs text-right text-green-700 font-bold">
                    SLAM LOCALIZATION LOCKED
                  </div>
                </div>
              </div>
            )}

            {/* AI Bounding Boxes */}
            {showBoundingBoxes && (
              <div className="absolute top-[38%] left-[40%] w-[25%] h-[28%] border border-red-500 bg-red-500/15 pointer-events-none rounded flex flex-col justify-start">
                <span className="bg-red-600 text-foreground font-mono font-bold text-[11px] px-1 py-0.5 leading-none w-fit uppercase tracking-wider">
                  SURVIVOR GROUP x4 (96%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: THERMAL CAMERA (FLIR) */}
        <div className="bg-panel border border-line rounded overflow-hidden flex flex-col">
          <div className="p-3 bg-panel border-b border-line flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-700" />
              <span className="font-bold text-foreground uppercase text-[13px]">THERMAL LWIR FLIR (640x512)</span>
              <span className="text-[11px] text-foreground bg-red-50 px-1.5 py-0.5 rounded font-bold uppercase">
                FLIR THERMAL
              </span>
            </div>
            <div className="text-xs text-red-700 font-bold">SPOT PEAK: 37.8°C</div>
          </div>

          <div className="relative aspect-video bg-inset overflow-hidden select-none flex items-center justify-center">
            {/* Simulated Radiometric FLIR Thermal Feed */}
            <img
              src={createSvgImageDataUrl('thermal_person')}
              alt="Simulated Radiometric FLIR Raksha Thermal Feed"
              className="w-full h-full object-cover"
            />

            {/* Thermal HUD with Reticles */}
            {showTelemetryHUD && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-orange-700 text-xs">
                {/* Reticle crosshair lines */}
                <div className="w-full h-[1px] bg-red-500/30 absolute top-1/2 left-0 pointer-events-none" />
                <div className="h-full w-[1px] bg-red-500/30 absolute top-0 left-1/2 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs">
                    <div>SENSOR: FLIR BOSON 640</div>
                    <div>NETD: &lt; 40 mK</div>
                    <div>RANGE: -20°C to +150°C</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs text-right">
                    <div>HUMAN HEAT SIG: 2 POSITIVE</div>
                    <div>WATER TEMP: 18.2°C</div>
                    <div>ISOTHERM: ACTIVE</div>
                  </div>
                </div>

                <div className="self-center z-10">
                  <Crosshair className="w-8 h-8 text-red-700/80 animate-pulse" />
                </div>

                <div className="flex justify-between items-end z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs text-red-700 font-bold">
                    EDGE INFERENCE: CORAL DUAL-CORE
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-line text-xs text-right">
                    SURFACE TEMP: 37.4°C
                  </div>
                </div>
              </div>
            )}

            {/* Thermal Hotspot Bounding Box */}
            {showBoundingBoxes && (
              <div className="absolute top-[42%] left-[42%] w-[22%] h-[25%] border border-red-500 bg-red-500/20 pointer-events-none rounded">
                <span className="bg-red-600 text-foreground font-mono font-bold text-[11px] px-1 py-0.5 leading-none uppercase">
                  BIOLOGICAL HEAT: 37.2°C (94%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry & Detection Meta Banner Below Cameras */}
      <div className="bg-panel border border-line rounded p-4 font-mono text-xs">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center border-b border-line pb-3 mb-3">
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">ACTIVE RAKSHA</div>
            <div className="text-foreground font-bold text-sm">{raksha?.rakshaId}</div>
          </div>
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">MISSION ID</div>
            <div className="text-foreground font-bold text-sm">{raksha?.currentMissionId}</div>
          </div>
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">GPS COORDINATES</div>
            <div className="text-green-700 font-bold text-xs">{raksha?.latitude.toFixed(5)}°N, {raksha?.longitude.toFixed(5)}°E</div>
          </div>
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">ALTITUDE / SPEED</div>
            <div className="text-foreground font-bold text-sm">{raksha?.altitude}m @ {raksha?.speed}m/s</div>
          </div>
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">AI CONFIDENCE PEAK</div>
            <div className="text-green-700 font-bold text-sm">96%</div>
          </div>
          <div>
            <div className="text-muted text-[11px] uppercase font-bold">EDGE LATENCY</div>
            <div className="text-foreground font-bold text-sm">24 ms (On-device)</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-muted text-xs gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-red-700" />
            <span>VIDEO PIPELINE READY: Architecture prepared for RTSP / WebRTC low-latency streaming pipeline</span>
          </div>
          <span className="text-green-700 font-bold">
            ON-DEVICE EDGE INFERENCE ACTIVE (NVIDIA JETSON / GOOGLE CORAL)
          </span>
        </div>
      </div>
    </div>
  );
};
