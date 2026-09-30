import React, { useState } from 'react';
import { 
  Bell, ShieldAlert, AlertTriangle, Info, 
  CheckCircle2, Check, Radio, Filter
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { EmergencyAlert, AlertSeverity, AlertStatus } from '../../types';

export const AlertsView: React.FC = () => {
  const alerts = commandStore.alerts;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = (alertId: string, status: AlertStatus) => {
    commandStore.updateAlertStatus(alertId, status);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-foreground font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-700" />
            <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
              REAL-TIME EMERGENCY ALERTS DISPATCH
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-bold">
              {alerts.filter((a) => a.status === 'NEW').length} UNACKNOWLEDGED
            </span>
          </div>
          <p className="text-xs text-muted font-mono mt-0.5 font-sans">
            High-priority trigger feed for critical survivors, thermal anomalies, low-battery recalls, and structural breach
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-inset border border-line text-secondary py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-inset border border-line text-secondary py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.alertId}
              className={`p-4 rounded border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                alert.status === 'RESOLVED'
                  ? 'bg-shell border-line opacity-50'
                  : isCritical
                  ? 'bg-red-50 border-red-200/60'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200/50'
                  : 'bg-panel border-line'
              }`}
            >
              {/* Left Column: Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-red-600 text-foreground'
                        : isWarning
                        ? 'bg-orange-600 text-foreground'
                        : 'bg-hover text-foreground'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-bold text-foreground text-sm">{alert.alertId}</span>
                  <span className="text-muted">|</span>
                  <span className="text-red-700 font-bold">{alert.droneId}</span>
                  <span className="text-muted text-xs">{alert.createdAt}</span>
                </div>

                <p className="text-sm font-sans font-medium text-foreground leading-snug">
                  {alert.message}
                </p>

                <div className="p-2 bg-inset rounded border border-line text-[13px] text-secondary">
                  <strong className="text-red-700">RECOMMENDED ACTION:</strong> {alert.recommendation}
                </div>
              </div>

              {/* Right Column: Status & Operational Controls */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase border ${
                    alert.status === 'NEW'
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : alert.status === 'ACKNOWLEDGED'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : alert.status === 'ASSIGNED'
                      ? 'bg-hover text-foreground border-line-strong'
                      : 'bg-inset text-muted border-line'
                  }`}
                >
                  STATUS: {alert.status}
                </span>

                <div className="flex items-center gap-1.5">
                  {alert.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'ACKNOWLEDGED')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'ASSIGNED')}
                      className="px-3 py-1.5 bg-hover hover:bg-hover border border-line-strong text-foreground font-bold rounded transition-colors"
                    >
                      Assign Team
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'RESOLVED')}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-50 border border-green-200 text-green-700 font-bold rounded flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve
                    </button>
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
