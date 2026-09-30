/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationPage } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { DisasterMap } from './components/map/DisasterMap';
import { DroneFleetView } from './components/drones/DroneFleetView';
import { LiveVisionView } from './components/vision/LiveVisionView';
import { DetectionCenterView } from './components/detections/DetectionCenterView';
import { SurvivorsView } from './components/survivors/SurvivorsView';
import { HazardsView } from './components/hazards/HazardsView';
import { AutonomousNavView } from './components/navigation/AutonomousNavView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsGatewayView } from './components/settings/SettingsGatewayView';
import { commandStore } from './services/store';
import { Survivor, Hazard, Drone } from './types';

export default function App() {
  const [, setTick] = useState(0);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeVisionDroneId, setActiveVisionDroneId] = useState<string>('RAKSHA-01');

  // Selected entities for drilldown on map
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'survivor' | 'hazard' | 'drone';
    id: string;
  } | null>(null);

  // Subscribe to real-time reactive commandStore updates (like Firestore snapshot)
  useEffect(() => {
    const unsubscribe = commandStore.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const handleSelectSurvivor = (survivor: Survivor) => {
    setSelectedEntity({ type: 'survivor', id: survivor.survivorId });
  };

  const handleSelectHazard = (hazard: Hazard) => {
    setSelectedEntity({ type: 'hazard', id: hazard.hazardId });
  };

  const handleSelectDrone = (drone: Drone) => {
    setSelectedEntity({ type: 'drone', id: drone.droneId });
  };

  const handleOpenLiveVision = (droneId: string) => {
    setActiveVisionDroneId(droneId);
    setCurrentPage('detections');
  };

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col font-sans bg-geometric-grid selection:bg-red-600 selection:text-foreground">
      {/* Top Mission-Control Header */}
      <Header />

      {/* Main Workspace Layout (Sidebar + Dynamic View Container) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => {
            setCurrentPage(page);
            setSelectedEntity(null);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Main Stage View */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-canvas/95 relative">
          {currentPage === 'overview' && (
            <OverviewDashboard
              onNavigate={(page) => setCurrentPage(page)}
              onSelectSurvivor={handleSelectSurvivor}
              onSelectHazard={handleSelectHazard}
            />
          )}

          {currentPage === 'map' && (
            <div className="h-full flex flex-col">
              <div className="p-2.5 bg-panel border-b border-line flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold text-foreground uppercase tracking-wider text-[13px]">
                    TACTICAL GEOSPATIAL MAP — FULL MISSION CORRIDOR VIEW
                  </span>
                </div>
                <div className="text-muted text-xs">
                  SECTOR: VENICE FLOOD DEMO
                </div>
              </div>
              <div className="flex-1 relative">
                <DisasterMap
                  onSelectSurvivor={handleSelectSurvivor}
                  onSelectHazard={handleSelectHazard}
                  onSelectDrone={handleSelectDrone}
                  selectedEntity={selectedEntity}
                  heightClass="h-[calc(100dvh-12rem)] min-h-[500px]"
                />
              </div>
            </div>
          )}

          {currentPage === 'drones' && (
            <DroneFleetView
              onOpenLiveVision={(droneId) => {
                setActiveVisionDroneId(droneId);
                setCurrentPage('navigation');
              }}
            />
          )}

          {currentPage === 'detections' && <DetectionCenterView />}

          {currentPage === 'survivors' && (
            <SurvivorsView
              onFocusOnMap={(surv) => {
                handleSelectSurvivor(surv);
                setCurrentPage('map');
              }}
            />
          )}

          {currentPage === 'hazards' && <HazardsView />}


          {currentPage === 'navigation' && <AutonomousNavView />}

          {currentPage === 'alerts' && <AlertsView />}

          {currentPage === 'reports' && <ReportsView />}

          {currentPage === 'analytics' && <AnalyticsView />}

          {currentPage === 'settings' && <SettingsGatewayView />}
        </main>
      </div>

      {/* Geometric Balance Tactical Status Bar Footer */}
      <footer className="min-h-8 bg-panel border-t border-line flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-mono text-muted shrink-0">
        <div>LAT: 12.9716 LONG: 12.3474 ALT: 120.4M</div>
        <div className="flex items-center gap-4">
          <span className="text-green-700 font-bold">● DATALINK SECURE</span>
          <span>UPTIME: 04:12:44</span>
          <span className="text-secondary">MODE: EDGE_SWARM_V4.2</span>
        </div>
      </footer>
    </div>
  );
}

