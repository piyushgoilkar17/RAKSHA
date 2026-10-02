import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { WifiOff, ChevronDown } from 'lucide-react';
import { commandStore } from '../../services/store';
import { ConnectivityStatus } from '../../types';

interface HeaderProps {
  onNavigateToAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToAlerts }) => {
  const [timeStr, setTimeStr] = useState('');
  const [showConnMenu, setShowConnMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC') + ' | ' + now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlertsCount = commandStore.alerts.filter(
    (a) => a.severity === 'CRITICAL' && (a.status === 'NEW' || a.status === 'ASSIGNED')
  ).length;



  return (
    <header className="min-h-20 border-b border-line bg-panel text-foreground sticky top-0 z-50 flex flex-col justify-center px-4 py-3 md:px-6 shrink-0">
      {/* Offline Alert Warning Banner */}
      {commandStore.connectivity === 'OFFLINE' && (
        <div className="absolute top-full left-0 right-0 bg-red-50/95 border-b border-red-200 text-red-700 px-6 py-1 text-[13px] font-mono flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-red-700 animate-pulse" />
            <span className="font-bold">OFFLINE MODE:</span>
            <span>Uplink disconnected. Edge AI continues onboard. ({commandStore.offlineQueue.length} actions queued).</span>
          </div>
          <button 
            onClick={() => commandStore.setConnectivity('ONLINE')}
            className="text-xs bg-red-600 hover:bg-red-500 text-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider"
          >
            Reconnect
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {/* Left: Brand & Geometric Logo */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-foreground italic shrink-0">
            R
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none text-foreground">
              <Link to="/" aria-label="RakshaAI home">RAKSHA AI</Link>
            </h1>
            <p className="text-[11px] md:text-xs text-secondary uppercase tracking-wide leading-tight mt-0.5">
              Autonomous Disaster Command Center
            </p>
          </div>

          <div className="hidden xl:block h-8 w-[1px] bg-hover mx-2" />

          {/* System Status Display (Geometric balance style) */}
          <div className="hidden xl:flex flex-col items-start">
            <span className="text-xs text-muted uppercase font-bold tracking-wider">System Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-mono text-green-700 font-bold">EDGE-AI ENABLED</span>
            </div>
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-hover mx-1" />

          {/* Active Mission */}
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-xs text-muted uppercase font-bold tracking-wider">Active Mission</span>
            <span className="text-xs font-mono text-orange-700 font-medium truncate max-w-[200px]">
              {commandStore.missions.find((m) => m.status === 'ACTIVE')?.missionName || 'VENICE_FLOOD_S&R_04'}
            </span>
          </div>
        </div>

        {/* Critical alerts and connectivity */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Critical Alerts Badge */}
          <button
            onClick={onNavigateToAlerts}
            className={`px-3 py-1 rounded text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              criticalAlertsCount > 0
                ? 'bg-red-50 border border-red-200 text-red-700 animate-pulse hover:bg-red-50'
                : 'bg-inset border border-line text-secondary hover:text-foreground'
            }`}
            title="Emergency Alerts Feed"
          >
            <span>🚨</span>
            <span>{criticalAlertsCount} CRITICAL ALERTS</span>
          </button>

          {/* Connectivity Mode Pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowConnMenu(!showConnMenu)}
              className="flex items-center gap-1.5 bg-inset hover:bg-hover border border-line px-2.5 py-1 rounded text-xs font-mono transition-colors"
            >
              {commandStore.connectivity === 'ONLINE' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-green-700 text-[13px] font-bold">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-red-700 text-[13px] font-bold">OFFLINE</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-muted" />
            </button>

            {showConnMenu && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-panel border border-line rounded shadow-2xl py-1 z-50 text-xs font-mono">
                <div className="px-2 py-1 text-xs text-muted border-b border-line uppercase font-bold">CONNECTIVITY MODE</div>
                {(['ONLINE', 'LIMITED', 'OFFLINE'] as ConnectivityStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      commandStore.setConnectivity(st);
                      setShowConnMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-hover ${
                      commandStore.connectivity === st ? 'text-foreground font-bold bg-hover' : 'text-secondary'
                    }`}
                  >
                    <span>{st}</span>
                    {st === 'ONLINE' && <span className="text-green-700">●</span>}
                    {st === 'LIMITED' && <span className="text-orange-700">●</span>}
                    {st === 'OFFLINE' && <span className="text-red-700">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </header>
  );
};
