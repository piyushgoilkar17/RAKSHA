import React, { useState } from 'react';
import { 
  Settings, Cpu, Radio, Zap, Shield, 
  Send, RefreshCw, CheckCircle2, Code2, Terminal
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { droneGateway } from '../../services/droneGateway';

export const SettingsGatewayView: React.FC = () => {
  const [targetDroneId, setTargetDroneId] = useState('RAKSHA-01');
  const [testLat, setTestLat] = useState('45.4390');
  const [testLon, setTestLon] = useState('12.3280');
  const [testAlt, setTestAlt] = useState('48');
  const [testBattery, setTestBattery] = useState('85');
  const [detectionType, setDetectionType] = useState('Survivor (Child in Water)');
  const [injectSuccess, setInjectSuccess] = useState(false);

  const samplePayload = {
    timestamp: new Date().toISOString(),
    drone_id: targetDroneId,
    telemetry: {
      latitude: parseFloat(testLat) || 45.4390,
      longitude: parseFloat(testLon) || 12.3280,
      altitude_m: parseFloat(testAlt) || 48,
      speed_mps: 12.4,
      heading_deg: 184,
      battery_pct: parseInt(testBattery) || 85,
      gps_fix: '3D_RTK_FIX',
      imu_status: 'HEALTHY',
    },
    inference: {
      model: 'YOLOv8x-Rescue-Edge-v2',
      detections_count: 1,
      top_class: detectionType,
      confidence: 0.94,
    },
  };

  const handleInjectTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    droneGateway.pushTelemetry(targetDroneId, {
      latitude: parseFloat(testLat) || 45.4390,
      longitude: parseFloat(testLon) || 12.3280,
      altitude: parseFloat(testAlt) || 48,
      battery: parseInt(testBattery) || 85,
    });

    setInjectSuccess(true);
    setTimeout(() => setInjectSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
              EDGE AI GATEWAY & HARDWARE INTEGRATION CONSOLE
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-hover border border-line-strong text-green-700 font-bold">
              GATEWAY ONLINE • MQTT / WS READY
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5 font-sans">
            Clean hardware abstraction layer for physical drone fleet telemetry, MAVLink bridges, and test injections
          </p>
        </div>
      </div>

      {/* Embedded Hardware Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-panel border border-line p-3.5 rounded space-y-1">
          <div className="text-xs text-red-700 font-bold uppercase">ON-DEVICE EDGE COMPUTE</div>
          <div className="text-sm font-bold text-foreground">NVIDIA Jetson Orin Nano</div>
          <p className="text-[13px] text-muted font-sans">
            40 TOPS AI compute running TensorRT-optimized YOLOv8 at 35+ FPS directly onboard airframe.
          </p>
        </div>

        <div className="bg-panel border border-line p-3.5 rounded space-y-1">
          <div className="text-xs text-red-700 font-bold uppercase">THERMAL IMAGING PAYLOAD</div>
          <div className="text-sm font-bold text-foreground">FLIR Boson LWIR Core</div>
          <p className="text-[13px] text-muted font-sans">
            640x512 radiometric thermal core with Coral TPU secondary coprocessor for biological heat classification.
          </p>
        </div>

        <div className="bg-panel border border-line p-3.5 rounded space-y-1">
          <div className="text-xs text-green-700 font-bold uppercase">FLIGHT CONTROLLER (FCU)</div>
          <div className="text-sm font-bold text-foreground">Holybro Pixhawk 6X (PX4)</div>
          <p className="text-[13px] text-muted font-sans">
            Dual redundant IMUs, MAVLink telemetry protocol via micro-XRCE-DDS bridge to ROS2 Foxy.
          </p>
        </div>

        <div className="bg-panel border border-line p-3.5 rounded space-y-1">
          <div className="text-xs text-yellow-700 font-bold uppercase">DISASTER TELEMETRY MESH</div>
          <div className="text-sm font-bold text-foreground">433 MHz LoRa + 5G NR</div>
          <p className="text-[13px] text-muted font-sans">
            Decentralized peer-to-peer relay mesh ensures continuous connectivity even when cellular towers fail.
          </p>
        </div>
      </div>

      {/* Gateway Telemetry Injection & Real-Time JSON Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Telemetry Injection Form */}
        <div className="lg:col-span-5 bg-panel border border-line rounded p-4">
          <div className="text-xs font-bold text-foreground uppercase mb-3 flex items-center justify-between pb-2 border-b border-line">
            <span className="flex items-center gap-1.5">
              <Send className="w-4 h-4 text-red-700" /> HARDWARE TELEMETRY INJECTION
            </span>
            <span className="text-xs text-green-700 font-bold">SIMULATION / REAL HARNESS</span>
          </div>

          <form onSubmit={handleInjectTelemetry} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-muted text-xs uppercase font-bold mb-1">Target Airframe:</label>
              <select
                value={targetDroneId}
                onChange={(e) => setTargetDroneId(e.target.value)}
                className="w-full px-2 py-1.5 bg-inset border border-line rounded text-foreground"
              >
                {commandStore.drones.map((d) => (
                  <option key={d.droneId} value={d.droneId}>
                    {d.droneId} ({d.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted text-xs uppercase font-bold mb-1">Latitude:</label>
                <input
                  type="text"
                  value={testLat}
                  onChange={(e) => setTestLat(e.target.value)}
                  className="w-full px-2 py-1.5 bg-inset border border-line rounded text-foreground"
                />
              </div>
              <div>
                <label className="block text-muted text-xs uppercase font-bold mb-1">Longitude:</label>
                <input
                  type="text"
                  value={testLon}
                  onChange={(e) => setTestLon(e.target.value)}
                  className="w-full px-2 py-1.5 bg-inset border border-line rounded text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted text-xs uppercase font-bold mb-1">Altitude (meters):</label>
                <input
                  type="number"
                  value={testAlt}
                  onChange={(e) => setTestAlt(e.target.value)}
                  className="w-full px-2 py-1.5 bg-inset border border-line rounded text-foreground"
                />
              </div>
              <div>
                <label className="block text-muted text-xs uppercase font-bold mb-1">Battery (%):</label>
                <input
                  type="number"
                  value={testBattery}
                  onChange={(e) => setTestBattery(e.target.value)}
                  className="w-full px-2 py-1.5 bg-inset border border-line rounded text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-foreground font-bold rounded flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{injectSuccess ? 'Telemetry Dispatched to Store!' : 'Transmit Packet to Drone Store'}</span>
            </button>
          </form>
        </div>

        {/* Right: Raw JSON Contract & MQTT Broker Bridge */}
        <div className="lg:col-span-7 bg-panel border border-line rounded p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-foreground uppercase mb-2 flex items-center justify-between pb-2 border-b border-line">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-green-700" /> LIVE TELEMETRY PAYLOAD (JSON CONTRACT)
              </span>
              <span className="text-xs text-secondary font-bold">TOPIC: rescue/drones/+/telemetry</span>
            </div>

            <div className="p-3 bg-shell rounded border border-line overflow-x-auto text-[13px] text-green-700 font-mono">
              <pre>{JSON.stringify(samplePayload, null, 2)}</pre>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-inset rounded border border-line text-[13px] text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-red-700" />
              <span>WebSocket Gateway URI: <strong className="text-secondary">wss://api.aerorescue.ai/v1/stream</strong></span>
            </span>
            <span className="text-green-700 font-bold">STATUS: LISTENING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
