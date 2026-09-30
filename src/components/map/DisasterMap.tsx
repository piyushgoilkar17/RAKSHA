import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Navigation, ShieldAlert, Heart, Eye,
  Info, CheckCircle, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import { calculateRescueRoute, RoutePoint } from '../../services/rescueRouting';
import { commandStore } from '../../services/store';
import { Raksha, Survivor, Hazard, Waypoint } from '../../types';

interface DisasterMapProps {
  onSelectSurvivor?: (survivor: Survivor) => void;
  onSelectHazard?: (hazard: Hazard) => void;
  onSelectRaksha?: (raksha: Raksha) => void;
  selectedEntity?: { type: 'survivor' | 'hazard' | 'raksha'; id: string } | null;
  heightClass?: string;
}

function proposedHQ(): RoutePoint {
  const locations = commandStore.survivors;
  return locations.length ? {
    latitude: locations.reduce((sum, point) => sum + point.latitude, 0) / locations.length,
    longitude: Math.min(...locations.map(point => point.longitude)) - 0.012,
  } : { latitude: 45.438, longitude: 12.29 };
}

function fitOperationalArea(map: L.Map) {
  const points = [
    ...commandStore.rakshas,
    ...commandStore.survivors,
    ...commandStore.hazards,
    proposedHQ(),
  ].filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  if (points.length) {
    map.fitBounds(L.latLngBounds(points.map((point) => [point.latitude, point.longitude])), {
      paddingTopLeft: [48, 76],
      paddingBottomRight: [48, 48],
      maxZoom: 15,
      animate: false,
    });
  }
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  onSelectSurvivor,
  onSelectHazard,
  onSelectRaksha,
  selectedEntity,
  heightClass = 'h-full min-h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    rakshas: L.LayerGroup;
    survivors: L.LayerGroup;
    hazards: L.LayerGroup;
    zones: L.LayerGroup;
    waypoints: L.LayerGroup;
    paths: L.LayerGroup;
  } | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    rakshas: true,
    survivors: true,
    hazards: true,
    zones: true,
    waypoints: true,
    flightPaths: true,
  });

  const [inspectedSurvivor, setInspectedSurvivor] = useState<Survivor | null>(null);
  const [inspectedHazard, setInspectedHazard] = useState<Hazard | null>(null);
  const [inspectedRaksha, setInspectedRaksha] = useState<Raksha | null>(null);

  const [hq, setHQ] = useState<RoutePoint>(proposedHQ);
  const [routeTargetId, setRouteTargetId] = useState(() =>
    [...commandStore.survivors].filter(s => s.rescueStatus !== 'Rescued')
      .sort((a, b) => b.priorityScore - a.priorityScore)[0]?.survivorId || ''
  );
  const target = commandStore.survivors.find(s => s.survivorId === routeTargetId && s.rescueStatus !== 'Rescued');
  const hazardSignature = JSON.stringify(commandStore.hazards.map(h => [h.hazardId, h.latitude, h.longitude, h.radiusMeters, h.severity, h.status]));
  const route = useMemo(() => target ? calculateRescueRoute(hq, target, commandStore.hazards) : null,
    [hq, target?.latitude, target?.longitude, target?.survivorId, hazardSignature]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Venice Flood Center: Lat 45.4380, Lng 12.3270
    const map = L.map(mapContainerRef.current, {
      center: [45.4380, 12.3270],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap Tiles (Free, no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Layer groups
    const rakshaGroup = L.layerGroup().addTo(map);
    const survivorGroup = L.layerGroup().addTo(map);
    const hazardGroup = L.layerGroup().addTo(map);
    const zoneGroup = L.layerGroup().addTo(map);
    const waypointGroup = L.layerGroup().addTo(map);
    const pathGroup = L.layerGroup().addTo(map);

    layersRef.current = {
      rakshas: rakshaGroup,
      survivors: survivorGroup,
      hazards: hazardGroup,
      zones: zoneGroup,
      waypoints: waypointGroup,
      paths: pathGroup,
    };

    mapInstanceRef.current = map;

    // Leaflet must remeasure after the flex layout or sidebar changes size.
    let initialFitDone = false;
    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        const size = map.getSize();
        if (!initialFitDone && size.x > 0 && size.y > 0) {
          fitOperationalArea(map);
          initialFitDone = true;
        }
      });
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const group = L.layerGroup().addTo(map);
    const marker = L.marker([hq.latitude, hq.longitude], {
      draggable: true,
      title: 'Proposed rescue HQ — drag to relocate',
      icon: L.divIcon({
        className: 'rescue-hq-marker', iconSize: [46, 48], iconAnchor: [23, 24],
        html: '<div style="background:#1d4ed8;color:white;border:3px solid white;border-radius:8px;padding:5px;text-align:center;box-shadow:0 2px 6px #0003"><svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2" style="margin:auto"><path d="M3 18V6l9-4 9 4v12H3Z M9 18v-6h6v6 M7 7h2m6 0h2"/></svg><strong style="font:700 11px sans-serif">HQ</strong></div>',
      }),
    }).bindTooltip('Proposed HQ · drag to move').addTo(group);
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setHQ({ latitude: position.lat, longitude: position.lng });
    });
    if (route) {
      route.buffers.forEach(buffer => L.rectangle(buffer.bounds.map(p => [p.latitude, p.longitude]) as L.LatLngBoundsExpression,
        { color: '#d97706', weight: 1, dashArray: '3 4', fillOpacity: 0.06, interactive: false }).addTo(group));
      if (route.path.length) {
        const line = route.path.map(p => [p.latitude, p.longitude] as [number, number]);
        L.polyline(line, { color: '#fff', weight: 8, opacity: 0.9, interactive: false }).addTo(group);
        L.polyline(line, { color: '#15803d', weight: 4, dashArray: '10 6' })
          .bindTooltip('Simulated hazard-avoiding corridor · access unverified').addTo(group);
        const end = line[line.length - 1];
        L.circleMarker(end, { radius: 7, color: '#15803d', fillColor: '#fff', fillOpacity: 1, weight: 3 })
          .bindTooltip(route.approachMeters > 1 ? 'Staging point · final approach unverified' : 'Selected survivor location').addTo(group);
      }
    }
    return () => { group.remove(); };
  }, [hq, route]);

  // Update Layers when store changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    // 1. Rakshas Layer
    layers.rakshas.clearLayers();
    if (activeLayers.rakshas) {
      commandStore.rakshas.forEach((raksha) => {
        const isSelected = selectedEntity?.type === 'raksha' && selectedEntity.id === raksha.rakshaId;
        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-9 h-9 rounded-full bg-sky-500/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full ${
              raksha.status === 'ACTIVE' ? 'bg-sky-500 text-black' : 'bg-slate-700 text-foreground'
            } border-2 ${isSelected ? 'border-amber-400 ring-2 ring-amber-400' : 'border-white'} flex items-center justify-center font-bold text-xs shadow-lg transform transition-transform" style="transform: rotate(${raksha.heading}deg)">
              ▲
            </div>
            <div class="map-marker-label absolute -bottom-4 bg-slate-950/90 text-sky-700 font-mono text-[11px] px-1 rounded border border-slate-700 whitespace-nowrap">
              ${raksha.rakshaId} • ${raksha.battery}%
            </div>
          </div>
        `;
        const marker = L.marker([raksha.latitude, raksha.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'raksha-marker', iconSize: [36, 36], iconAnchor: [18, 18] }),
        });
        marker.on('click', () => {
          setInspectedRaksha(raksha);
          setInspectedSurvivor(null);
          setInspectedHazard(null);
          if (onSelectRaksha) onSelectRaksha(raksha);
        });
        marker.addTo(layers.rakshas);
      });
    }

    // 2. Survivors Layer
    layers.survivors.clearLayers();
    if (activeLayers.survivors) {
      commandStore.survivors.forEach((survivor) => {
        const isRescued = survivor.rescueStatus === 'Rescued';
        const isCritical = survivor.priorityLevel === 'CRITICAL';
        const isHigh = survivor.priorityLevel === 'HIGH';

        const ringColor = isRescued
          ? 'border-emerald-400 bg-emerald-50/90 text-emerald-700'
          : isCritical
          ? 'border-rose-500 bg-rose-50/90 text-rose-700 ring-2 ring-rose-500 animate-pulse'
          : isHigh
          ? 'border-amber-500 bg-amber-50/90 text-amber-700 ring-1 ring-amber-400'
          : 'border-emerald-500 bg-emerald-50/90 text-emerald-700';

        const iconHtml = `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <div class="w-6 h-6 rounded-full border-2 ${ringColor} flex items-center justify-center font-bold text-[13px] shadow-md">
              ${isRescued ? '✓' : '👤'}
            </div>
            <div class="map-marker-label absolute -bottom-4 bg-slate-900/90 font-mono text-[11px] text-slate-200 px-1 rounded border border-slate-700 whitespace-nowrap">
              ${survivor.survivorId} (${survivor.priorityScore})
            </div>
          </div>
        `;

        const marker = L.marker([survivor.latitude, survivor.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'survivor-marker', iconSize: [26, 26], iconAnchor: [13, 13] }),
        });

        marker.on('click', () => {
          setInspectedSurvivor(survivor);
          if (!isRescued) setRouteTargetId(survivor.survivorId);
          setInspectedHazard(null);
          setInspectedRaksha(null);
          if (onSelectSurvivor) onSelectSurvivor(survivor);
        });
        marker.addTo(layers.survivors);
      });
    }

    // 3. Hazards Layer
    layers.hazards.clearLayers();
    if (activeLayers.hazards) {
      commandStore.hazards.forEach((hazard) => {
        if (hazard.status === 'Resolved') return;

        let iconSymbol = '⚠️';
        let colorClass = 'border-amber-500 bg-amber-50/90 text-amber-700';
        let circleColor = '#f59e0b';

        if (hazard.hazardType.includes('Fire')) {
          iconSymbol = '🔥';
          colorClass = 'border-rose-600 bg-rose-50/90 text-rose-700';
          circleColor = '#ef4444';
        } else if (hazard.hazardType.includes('Flood')) {
          iconSymbol = '🌊';
          colorClass = 'border-sky-500 bg-sky-50/90 text-sky-700';
          circleColor = '#0ea5e9';
        } else if (hazard.hazardType.includes('Electrical')) {
          iconSymbol = '⚡';
          colorClass = 'border-yellow-400 bg-yellow-50/90 text-yellow-700';
          circleColor = '#eab308';
        } else if (hazard.hazardType.includes('structure') || hazard.hazardType.includes('building')) {
          iconSymbol = '🏚️';
          colorClass = 'border-orange-500 bg-orange-50/90 text-orange-700';
          circleColor = '#f97316';
        } else if (hazard.hazardType.includes('Landslide')) {
          iconSymbol = '⛰️';
          colorClass = 'border-purple-500 bg-purple-50/90 text-purple-700';
          circleColor = '#a855f7';
        } else {
          iconSymbol = '🪨';
          colorClass = 'border-stone-500 bg-stone-900/90 text-stone-300';
          circleColor = '#78716c';
        }

        // Draw danger radius circle
        L.circle([hazard.latitude, hazard.longitude], {
          radius: hazard.radiusMeters,
          color: circleColor,
          weight: 1,
          opacity: 0.8,
          fillColor: circleColor,
          fillOpacity: 0.15,
          dashArray: '4, 4',
        }).addTo(layers.hazards);

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-6 h-6 rounded-full border-2 ${colorClass} flex items-center justify-center text-xs shadow-lg">
              ${iconSymbol}
            </div>
            <div class="map-marker-label absolute -bottom-4 bg-slate-900/90 font-mono text-[11px] text-slate-300 px-1 rounded border border-slate-700 whitespace-nowrap">
              ${hazard.hazardType}
            </div>
          </div>
        `;

        const marker = L.marker([hazard.latitude, hazard.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'hazard-marker', iconSize: [26, 26], iconAnchor: [13, 13] }),
        });

        marker.on('click', () => {
          setInspectedHazard(hazard);
          setInspectedSurvivor(null);
          setInspectedRaksha(null);
          if (onSelectHazard) onSelectHazard(hazard);
        });
        marker.addTo(layers.hazards);
      });
    }

    // 4. Search Zones Layer
    layers.zones.clearLayers();
    if (activeLayers.zones) {
      // Zone A (Adyar Basin)
      L.polygon(
        [
          [45.4530, 12.3020],
          [45.4630, 12.3470],
          [45.4280, 12.3620],
          [45.4130, 12.3120],
        ],
        {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.6,
          fillColor: '#0284c7',
          fillOpacity: 0.08,
          dashArray: '5, 5',
        }
      ).addTo(layers.zones);

    }

    // 5. Waypoints Layer
    layers.waypoints.clearLayers();
    if (activeLayers.waypoints) {
      commandStore.waypoints.forEach((wp) => {
        const wpIcon = `
          <div class="w-5 h-5 rounded-full bg-slate-900 border border-sky-400 text-sky-700 flex items-center justify-center font-mono text-[11px] font-bold">
            ${wp.sequence}
          </div>
        `;
        L.marker([wp.latitude, wp.longitude], {
          icon: L.divIcon({ html: wpIcon, className: 'wp-marker', iconSize: [20, 20], iconAnchor: [10, 10] }),
        }).addTo(layers.waypoints);
      });

      // Connect waypoints with flight line
      const wpPoints = commandStore.waypoints.map((w) => [w.latitude, w.longitude] as [number, number]);
      if (wpPoints.length > 1) {
        L.polyline(wpPoints, {
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.5,
          dashArray: '4, 4',
        }).addTo(layers.waypoints);
      }
    }
  }, [activeLayers, selectedEntity]);

  return (
    <div className={`relative w-full ${heightClass} bg-shell overflow-hidden flex flex-col`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Map Control Overlay Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-panel/90 backdrop-blur-md border border-line p-1.5 rounded text-xs font-mono shadow-2xl">
        <span className="text-xs text-muted uppercase px-1 flex items-center gap-1 font-bold">
          <Layers className="w-3 h-3 text-red-700" />
          LAYERS:
        </span>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, rakshas: !p.rakshas }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.rakshas ? 'bg-hover border border-line-strong text-foreground font-bold' : 'bg-inset text-muted'
          }`}
        >
          ▲ Rakshas ({commandStore.rakshas.length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, survivors: !p.survivors }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.survivors ? 'bg-hover border border-line-strong text-green-700 font-bold' : 'bg-inset text-muted'
          }`}
        >
          👤 Survivors ({commandStore.survivors.length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, hazards: !p.hazards }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.hazards ? 'bg-hover border border-line-strong text-orange-700 font-bold' : 'bg-inset text-muted'
          }`}
        >
          ⚠️ Hazards ({commandStore.hazards.filter((h) => h.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, zones: !p.zones }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.zones ? 'bg-hover border border-line-strong text-red-700 font-bold' : 'bg-inset text-muted'
          }`}
        >
          Corridors
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              fitOperationalArea(mapInstanceRef.current);
            }
          }}
          className="p-1 rounded bg-inset hover:bg-hover text-muted hover:text-foreground transition-colors"
          title="Recenter Map"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      <section aria-label="Rescue route planning" className="absolute top-20 left-3 z-10 w-72 max-w-[calc(100%-1.5rem)] bg-panel border border-line rounded-lg p-3 space-y-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">HQ → Rescue route</h3>
          <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">Simulation</span>
        </div>
        <label htmlFor="rescue-route-target" className="block text-xs text-muted">Destination survivor</label>
        <select id="rescue-route-target" value={target ? routeTargetId : ''} onChange={event => setRouteTargetId(event.target.value)}
          className="w-full bg-inset border border-line rounded px-2 py-1.5 text-xs text-foreground">
          <option value="">Select a survivor</option>
          {commandStore.survivors.filter(s => s.rescueStatus !== 'Rescued').map(s =>
            <option key={s.survivorId} value={s.survivorId}>{s.survivorId} · {s.peopleCount} people · {s.priorityLevel}</option>
          )}
        </select>
        {route?.error ? <p role="status" className="text-xs text-red-700">{route.error}</p> : route && (
          <div className="text-xs text-foreground space-y-1">
            <p className="font-semibold text-green-800">{(route.distanceMeters / 1000).toFixed(2)} km · shortest modeled corridor</p>
            {route.approachMeters > 1 && <p className="text-amber-800">Stops {Math.round(route.approachMeters)} m from survivor. Final approach unverified.</p>}
            <button className="text-blue-700 underline underline-offset-2" onClick={() => {
              const points = route.path.map(p => [p.latitude, p.longitude] as [number, number]);
              if (points.length) mapInstanceRef.current?.fitBounds(L.latLngBounds(points), { padding: [70, 90], maxZoom: 16 });
            }}>Show entire route</button>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-muted">Drag HQ to relocate. Avoids modeled hazard buffers; roads, terrain and water access are not verified. Requires responder review.</p>
      </section>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-panel/90 backdrop-blur-md border border-line p-2.5 rounded text-xs font-mono text-secondary shadow-2xl space-y-1">
        <div className="font-bold text-muted uppercase border-b border-line pb-1 mb-1 tracking-wider">MAP LEGEND</div>
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-bold">🟢</span> <span>Survivor (Critical/High Priority)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-700 font-bold">🔴</span> <span>Active Fire / Thermal Anomaly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-bold">🔵</span> <span>Inundated Flood Surge Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-700 font-bold">🟠</span> <span>Damaged / Unstable Structure</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-700 font-bold">🟡</span> <span>Exposed 11kV Electrical Line</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-bold">---</span> <span>Proposed rescue corridor (simulation)</span>
        </div>
      </div>

      {/* Detailed Inspection Drawer / Modal for Survivor */}
      {inspectedSurvivor && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-panel/95 backdrop-blur-lg border border-line rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-foreground animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 font-mono font-bold text-xs">
                SURVIVOR {inspectedSurvivor.survivorId}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  inspectedSurvivor.priorityLevel === 'CRITICAL'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                }`}
              >
                {inspectedSurvivor.priorityLevel}
              </span>
            </div>
            <button
              onClick={() => setInspectedSurvivor(null)}
              className="p-1 text-muted hover:text-foreground rounded hover:bg-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dual Visual Evidence (RGB Camera + Thermal Heat Signature) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs font-mono text-muted mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-red-700" /> RGB CAM EVIDENCE
              </div>
              <img
                src={inspectedSurvivor.imageUrl}
                alt="Survivor RGB Recon"
                className="w-full h-28 object-cover rounded border border-line"
              />
            </div>
            <div>
              <div className="text-xs font-mono text-muted mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-700" /> THERMAL FLIR
              </div>
              <img
                src={inspectedSurvivor.thermalImageUrl}
                alt="Survivor Thermal FLIR"
                className="w-full h-28 object-cover rounded border border-line"
              />
            </div>
          </div>

          {/* AI Priority Scoring Breakdown */}
          <div className="bg-inset border border-line rounded p-2.5 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-secondary font-bold uppercase">
                AI-GENERATED PRIORITY SCORE
              </span>
              <span className="text-base font-mono font-black text-red-700">
                {inspectedSurvivor.priorityScore}/100
              </span>
            </div>
            <div className="w-full bg-hover h-1.5 rounded overflow-hidden mb-2">
              <div
                className="h-full bg-red-600"
                style={{ width: `${inspectedSurvivor.priorityScore}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono text-muted">
              <div>Confidence: <span className="text-foreground font-bold">{inspectedSurvivor.confidence}%</span></div>
              <div>Estimated People: <span className="text-foreground font-bold">{inspectedSurvivor.peopleCount}</span></div>
              <div>Detected By: <span className="text-secondary font-bold">{inspectedSurvivor.rakshaId}</span></div>
              <div>Time: <span className="text-secondary">{inspectedSurvivor.detectedAt}</span></div>
            </div>
          </div>

          {/* GPS Coordinates & Hazards */}
          <div className="space-y-2 text-xs font-mono mb-3">
            <div className="p-2 bg-inset rounded border border-line text-[13px]">
              <span className="text-muted">LAT:</span> {inspectedSurvivor.latitude.toFixed(5)}°N{' '}
              <span className="text-muted ml-2">LON:</span> {inspectedSurvivor.longitude.toFixed(5)}°E
            </div>

            <div>
              <div className="text-xs text-orange-700 font-bold mb-1 uppercase tracking-wider">PROXIMATE HAZARDS:</div>
              <div className="space-y-1">
                {inspectedSurvivor.nearbyHazards.map((hz, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[13px] text-secondary bg-inset px-2 py-1 rounded border border-line">
                    <AlertTriangle className="w-3 h-3 text-orange-700 shrink-0" />
                    <span>{hz}</span>
                  </div>
                ))}
              </div>
            </div>

            {inspectedSurvivor.notes && (
              <div className="text-[13px] text-secondary italic bg-inset p-2 rounded border border-line">
                "{inspectedSurvivor.notes}"
              </div>
            )}
          </div>

          {/* Human-in-the-loop Override Actions */}
          <div className="mt-auto pt-3 border-t border-line space-y-2">
            <div className="text-xs font-mono text-muted uppercase font-bold tracking-wider">
              Rescue Status Action:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Verified');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Verified' });
                }}
                className={`py-1.5 rounded border text-center font-bold transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Verified'
                    ? 'bg-hover text-foreground border-line-strong'
                    : 'bg-inset border-line text-secondary hover:text-foreground'
                }`}
              >
                Mark Verified
              </button>
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Rescue Assigned');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Rescue Assigned' });
                }}
                className={`py-1.5 rounded border text-center font-bold transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Rescue Assigned'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-inset border-line text-secondary hover:text-foreground'
                }`}
              >
                Assign Rescue
              </button>
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Rescued');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Rescued' });
                }}
                className={`py-1.5 rounded border text-center font-bold col-span-2 transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Rescued'
                    ? 'bg-green-600 text-foreground border-green-500'
                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Mark Rescued & Safe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Drawer for Hazard */}
      {inspectedHazard && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-panel/95 backdrop-blur-lg border border-line rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-foreground animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-mono font-bold text-xs">
                {inspectedHazard.hazardId}
              </span>
              <span className="text-xs font-bold text-foreground uppercase font-mono">{inspectedHazard.hazardType}</span>
            </div>
            <button
              onClick={() => setInspectedHazard(null)}
              className="p-1 text-muted hover:text-foreground rounded hover:bg-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <img
            src={inspectedHazard.imageUrl}
            alt={inspectedHazard.hazardType}
            className="w-full h-36 object-cover rounded border border-line mb-3"
          />

          <div className="space-y-2 text-xs font-mono mb-3">
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">Severity Level:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                inspectedHazard.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700'
              }`}>
                {inspectedHazard.severity}
              </span>
            </div>
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">AI Confidence:</span>
              <span className="font-bold text-red-700">{inspectedHazard.confidence}%</span>
            </div>
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">Detecting Raksha:</span>
              <span className="font-bold text-foreground">{inspectedHazard.rakshaId}</span>
            </div>
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">Hazard Danger Radius:</span>
              <span className="font-bold text-orange-700">{inspectedHazard.radiusMeters} meters</span>
            </div>

            <div className="p-2.5 bg-inset border-l-2 border-orange-500 rounded-r">
              <div className="text-xs text-orange-700 font-bold uppercase mb-1">Recommended Response:</div>
              <div className="text-[13px] text-secondary">{inspectedHazard.recommendedResponse}</div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-line flex gap-2">
            <button
              onClick={() => {
                commandStore.updateHazardStatus(inspectedHazard.hazardId, 'Human Verified');
                setInspectedHazard({ ...inspectedHazard, status: 'Human Verified' });
              }}
              className="flex-1 py-1.5 bg-hover hover:bg-hover border border-line-strong text-foreground rounded font-mono text-xs font-bold transition-colors"
            >
              Verify Hazard
            </button>
            <button
              onClick={() => {
                commandStore.updateHazardStatus(inspectedHazard.hazardId, 'Resolved');
                setInspectedHazard({ ...inspectedHazard, status: 'Resolved' });
              }}
              className="flex-1 py-1.5 bg-green-50 hover:bg-green-50 border border-green-200 text-green-700 rounded font-mono text-xs font-bold transition-colors"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* Inspection Drawer for Raksha */}
      {inspectedRaksha && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-panel/95 backdrop-blur-lg border border-line rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-foreground animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-hover border border-line-strong text-foreground font-mono font-bold text-xs">
                {inspectedRaksha.rakshaId}
              </span>
              <span className="text-xs font-bold text-foreground font-mono">{inspectedRaksha.name}</span>
            </div>
            <button
              onClick={() => setInspectedRaksha(null)}
              className="p-1 text-muted hover:text-foreground rounded hover:bg-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[13px] font-mono text-muted mb-2">{inspectedRaksha.model}</div>

          <div className="space-y-2 text-xs font-mono mb-4">
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">Status / Mode:</span>
              <span className="text-green-700 font-bold">{inspectedRaksha.status} • {inspectedRaksha.navMode}</span>
            </div>
            <div className="flex items-center justify-between bg-inset p-2 rounded border border-line">
              <span className="text-muted">Battery Level:</span>
              <span className={`font-bold ${inspectedRaksha.battery > 30 ? 'text-green-700' : 'text-red-700'}`}>
                {inspectedRaksha.battery}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-inset p-2 rounded border border-line">
                <div className="text-muted text-xs">ALTITUDE</div>
                <div className="text-foreground font-bold text-sm">{inspectedRaksha.altitude} m</div>
              </div>
              <div className="bg-inset p-2 rounded border border-line">
                <div className="text-muted text-xs">SPEED</div>
                <div className="text-foreground font-bold text-sm">{inspectedRaksha.speed} m/s</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-inset p-2 rounded border border-line">
                <div className="text-muted text-xs">GPS FIX</div>
                <div className="text-green-700 font-bold text-xs">{inspectedRaksha.gpsStatus}</div>
              </div>
              <div className="bg-inset p-2 rounded border border-line">
                <div className="text-muted text-xs">IMU STATUS</div>
                <div className="text-green-700 font-bold text-xs">{inspectedRaksha.imuStatus}</div>
              </div>
            </div>
            <div className="bg-inset p-2 rounded border border-line text-[13px]">
              <div className="text-muted text-xs">ASSIGNED ZONE</div>
              <div className="text-foreground">{inspectedRaksha.zone}</div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-line flex gap-2">
            <button
              onClick={() => {
                commandStore.setRakshaStatus(inspectedRaksha.rakshaId, 'RETURNING');
                commandStore.setRakshaNavMode(inspectedRaksha.rakshaId, 'RETURN_TO_HOME');
                setInspectedRaksha({ ...inspectedRaksha, status: 'RETURNING', navMode: 'RETURN_TO_HOME' });
              }}
              className="flex-1 py-1.5 bg-orange-50 hover:bg-orange-50 border border-orange-200 text-orange-700 rounded font-mono text-xs font-bold transition-colors"
            >
              Return Home (RTH)
            </button>
            <button
              onClick={() => {
                const nextStatus = inspectedRaksha.status === 'ACTIVE' ? 'STANDBY' : 'ACTIVE';
                commandStore.setRakshaStatus(inspectedRaksha.rakshaId, nextStatus);
                setInspectedRaksha({ ...inspectedRaksha, status: nextStatus });
              }}
              className="flex-1 py-1.5 bg-hover hover:bg-hover border border-line-strong text-foreground rounded font-mono text-xs font-bold transition-colors"
            >
              {inspectedRaksha.status === 'ACTIVE' ? 'Pause Mission' : 'Resume Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
