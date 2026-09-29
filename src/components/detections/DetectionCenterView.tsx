import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Search,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Activity,
  Loader2,
} from 'lucide-react';

import { commandStore } from '../../services/store';
import { Detection } from '../../types';
import { analyzeImage, checkHealth } from '../../services/api';

export const DetectionCenterView: React.FC = () => {
  const detections = commandStore.detections;

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'People' | 'Hazards'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [droneFilter, setDroneFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const verifyBackend = async () => {
      const online = await checkHealth();
      setIsBackendOnline(online);
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await analyzeImage(file);

      let boundingBox:
        | { x: number; y: number; w: number; h: number; label: string }
        | undefined = undefined;

      if (result.boundingBox) {
        const imageObjectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageObjectUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Unable to read uploaded image'));
        });

        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        if (imageWidth > 0 && imageHeight > 0) {
          boundingBox = {
            x: (result.boundingBox.x / imageWidth) * 100,
            y: (result.boundingBox.y / imageHeight) * 100,
            w: (result.boundingBox.w / imageWidth) * 100,
            h: (result.boundingBox.h / imageHeight) * 100,
            label: result.boundingBox.label,
          };
        }

        URL.revokeObjectURL(imageObjectUrl);
      }

      const newDetection: Detection = {
        detectionId: 'DET-' + Math.floor(1000 + Math.random() * 9000),
        droneId: 'RAKSHA-01',
        category: result.category === 'Survivor' ? 'People' : 'Hazards',
        detectionType: result.label,
        severity: result.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
        confidence: Math.round(result.confidence * 100),
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        imageUrl: result.imageUrl || URL.createObjectURL(file),
        thermalImageUrl: result.imageUrl || URL.createObjectURL(file),
        timestamp: new Date().toISOString(),
        verificationStatus: 'AI Detected',
        boundingBox: boundingBox,
      };

      commandStore.addDetection(newDetection);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image with backend';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredDetections = detections.filter((det) => {
    if (categoryFilter !== 'ALL' && det.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && det.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && det.verificationStatus !== statusFilter) return false;
    if (droneFilter !== 'ALL' && det.droneId !== droneFilter) return false;
    if (det.confidence < minConfidence) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        det.detectionId.toLowerCase().includes(q) ||
        det.detectionType.toLowerCase().includes(q) ||
        det.droneId.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleVerify = (detectionId: string) => {
    commandStore.detections = commandStore.detections.map((d) =>
      d.detectionId === detectionId ? { ...d, verificationStatus: 'Human Verified' } : d
    );

    commandStore.survivors = commandStore.survivors.map((s) =>
      s.detectionId === detectionId ? { ...s, rescueStatus: 'Verified' } : s
    );

    commandStore.hazards = commandStore.hazards.map((h) =>
      h.detectionId === detectionId ? { ...h, status: 'Human Verified' } : h
    );
  };

  const handleFalsePositive = (detectionId: string) => {
    commandStore.detections = commandStore.detections.map((d) =>
      d.detectionId === detectionId ? { ...d, verificationStatus: 'False Positive' } : d
    );

    commandStore.hazards = commandStore.hazards.map((h) =>
      h.detectionId === detectionId ? { ...h, status: 'False Positive' } : h
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold font-mono tracking-wide text-foreground uppercase">
              AI DETECTION CENTER AND STREAM
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-hover border border-line-strong text-foreground font-mono font-bold">
              {filteredDetections.length} RECORDED
            </span>
          </div>
          <p className="text-xs text-muted font-mono mt-0.5">
            Real-time inference stream from onboard edge YOLOv8 and FLIR models. Human-in-the-loop verification required.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-inset border border-line text-xs font-mono">
            <Activity className={'w-3.5 h-3.5 ' + (isBackendOnline ? 'text-green-700 animate-pulse' : 'text-red-700')} />
            <span className={isBackendOnline ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
              {isBackendOnline ? 'BACKEND ONLINE :8001' : 'BACKEND OFFLINE'}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 disabled:bg-red-50 disabled:text-gray-500 text-foreground font-mono font-bold text-xs transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD IMAGE FOR AI ANALYSIS</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-inset border border-line text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-green-700" />
            <span className="text-secondary">
              CONFIDENCE BADGE: <strong className="text-foreground">AI ESTIMATE</strong>
            </span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50/50 border border-red-200 rounded text-red-700 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Upload Error: {uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-red-700 hover:text-foreground font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-panel border border-line p-3 rounded font-mono text-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by ID, type, or drone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-inset border border-line rounded text-foreground focus:outline-none focus:border-red-500 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-inset p-1 rounded border border-line">
            {(['ALL', 'People', 'Hazards'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={
                  'px-2.5 py-1 rounded font-bold transition-colors ' +
                  (categoryFilter === cat ? 'bg-red-600 text-foreground' : 'text-muted hover:text-foreground')
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-inset border border-line text-secondary py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-inset border border-line text-secondary py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="AI Detected">AI Detected</option>
            <option value="Human Verified">Human Verified</option>
            <option value="False Positive">False Positive</option>
          </select>

          <select
            value={droneFilter}
            onChange={(e) => setDroneFilter(e.target.value)}
            className="bg-inset border border-line text-secondary py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Drones</option>
            {commandStore.drones.map((d) => {
              return (
                <option key={d.droneId} value={d.droneId}>
                  {d.droneId}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-line text-[13px] text-muted">
          <span className="font-bold uppercase tracking-wider text-secondary">MIN CONFIDENCE THRESHOLD:</span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-40 accent-red-500"
          />
          <span className="font-bold text-red-700">{minConfidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDetections.map((det) => {
          const cardImage = det.detectionId === 'DET-9921'
            ? { src: '/assets/flood-survivors.png', alt: 'Flood scene with annotated survivor locations' }
            : det.detectionId === 'DET-H103'
              ? { src: '/assets/landslide-survivors.png', alt: 'Landslide scene with annotated survivor locations' }
              : null;
          const isHighConf = det.confidence >= 90;
          const isMediumConf = det.confidence >= 75 && det.confidence < 90;

          return (
            <div
              key={det.detectionId}
              className="bg-panel border border-line rounded overflow-hidden flex flex-col hover:border-line-strong transition-all"
            >
              <div className="p-3 bg-inset border-b border-line flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-foreground">{det.detectionId}</span>
                  <span
                    className={
                      'text-[11px] px-1.5 py-0.5 rounded font-bold uppercase ' +
                      (det.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200')
                    }
                  >
                    {det.severity}
                  </span>
                </div>
                <span className="text-xs text-muted font-mono">{det.droneId}</span>
              </div>

              {cardImage ? (
                <img
                  src={cardImage.src}
                  alt={cardImage.alt}
                  width={1672}
                  height={941}
                  className="block w-full h-auto border-b border-line"
                  decoding="async"
                />
              ) : (
              <div className="grid grid-cols-2 gap-1 bg-black p-1 border-b border-line">
                <div className="relative aspect-video overflow-hidden rounded">
                  <img src={det.imageUrl} alt="RGB Detection" className="w-full h-full object-cover" />
                  {det.boundingBox && (
                    <div
                      className="absolute border-2 border-red-500 pointer-events-none"
                      style={{
                        left: det.boundingBox.x + '%',
                        top: det.boundingBox.y + '%',
                        width: det.boundingBox.w + '%',
                        height: det.boundingBox.h + '%',
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-red-600 text-foreground text-[11px] font-bold font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                        {det.boundingBox.label}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-black/80 text-secondary font-mono text-[11px] px-1 rounded border border-line">
                    RGB
                  </div>
                </div>

                <div className="relative aspect-video overflow-hidden rounded">
                  <img
                    src={det.thermalImageUrl || det.imageUrl}
                    alt="Thermal Detection"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 text-orange-700 font-mono text-[11px] px-1 rounded border border-line">
                    FLIR
                  </div>
                </div>
              </div>
              )}

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 font-mono text-xs">
                <div>
                  <div className="text-sm font-sans font-bold text-foreground mb-1">{det.detectionType}</div>
                  <div className="text-[13px] text-muted">
                    LAT: {det.latitude.toFixed(5)} deg  LON: {det.longitude.toFixed(5)} deg
                  </div>
                </div>

                <div className="bg-inset p-2 rounded border border-line">
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-muted flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-700" />
                      AI Confidence:
                    </span>
                    <span
                      className={
                        'font-bold ' +
                        (isHighConf ? 'text-green-700' : isMediumConf ? 'text-orange-700' : 'text-secondary')
                      }
                    >
                      {det.confidence}% - {isHighConf ? 'Very High' : isMediumConf ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-hover h-1.5 rounded-full overflow-hidden">
                    <div
                      className={
                        'h-full ' +
                        (isHighConf ? 'bg-green-500' : isMediumConf ? 'bg-orange-500' : 'bg-[#555]')
                      }
                      style={{ width: det.confidence + '%' }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-line flex items-center justify-between">
                  <span
                    className={
                      'text-[11px] px-2 py-0.5 rounded border font-bold uppercase ' +
                      (det.verificationStatus === 'Human Verified'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : det.verificationStatus === 'False Positive'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-hover text-secondary border-line-strong')
                    }
                  >
                    {det.verificationStatus}
                  </span>

                  {det.verificationStatus === 'AI Detected' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVerify(det.detectionId)}
                        className="p-1 px-2 bg-green-50 hover:bg-green-50 border border-green-200 text-green-700 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verify
                      </button>

                      <button
                        onClick={() => handleFalsePositive(det.detectionId)}
                        className="p-1 px-2 bg-hover hover:bg-hover border border-line-strong text-muted hover:text-red-700 rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
