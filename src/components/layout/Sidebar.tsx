import React from 'react';
import { 
  LayoutDashboard, Map, Plane, Eye, Users, AlertOctagon, 
  Navigation, Bell, FileText, BarChart3, Settings,
  Activity, Radio
} from 'lucide-react';
import { commandStore } from '../../services/store';

export type NavigationPage = 
  | 'overview'
  | 'map'
  | 'drones'
  | 'detections'
  | 'survivors'
  | 'hazards'
  | 'navigation'
  | 'alerts'
  | 'reports'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}) => {
  const activeDronesCount = commandStore.drones.filter((d) => d.status === 'ACTIVE').length;
  const criticalSurvivorsCount = commandStore.survivors.filter(
    (s) => s.priorityLevel === 'CRITICAL' && s.rescueStatus !== 'Rescued'
  ).length;
  const newAlertsCount = commandStore.alerts.filter((a) => a.status === 'NEW').length;
  const criticalHazardsCount = commandStore.hazards.filter(
    (h) => h.severity === 'CRITICAL' && h.status !== 'Resolved'
  ).length;

  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Disaster Map', icon: Map },
    { id: 'drones', label: 'Drone Fleet', icon: Plane, badge: `${activeDronesCount} Live`, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
    { id: 'detections', label: 'AI Detection Center', icon: Eye, badge: commandStore.detections.length, badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'survivors', label: 'Survivors', icon: Users, badge: criticalSurvivorsCount > 0 ? `${criticalSurvivorsCount} Crit` : undefined, badgeColor: 'bg-rose-50 text-rose-700 border-rose-600' },
    { id: 'hazards', label: 'Hazard Intelligence', icon: AlertOctagon, badge: criticalHazardsCount > 0 ? criticalHazardsCount : undefined, badgeColor: 'bg-amber-50 text-amber-700 border-amber-600' },
    { id: 'navigation', label: 'Autonomous Nav', icon: Navigation },
    { id: 'alerts', label: 'Emergency Alerts', icon: Bell, badge: newAlertsCount > 0 ? newAlertsCount : undefined, badgeColor: 'bg-rose-600 text-foreground font-bold' },
    { id: 'reports', label: 'SITREP Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Edge AI Gateway', icon: Settings },
  ];

  return (
    <aside
      className={`bg-shell border-r border-line flex flex-col justify-between transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16 p-2' : 'w-full md:w-64 p-3.5'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {!collapsed && (
          <div className="text-xs text-muted uppercase font-bold tracking-wide px-2">
            Navigation
          </div>
        )}
        <nav className="grid grid-cols-2 gap-1 md:block md:space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-hover text-foreground border border-line-strong shadow-inner font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-hover border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-red-700' : 'text-muted'
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1 font-bold ${
                          isActive
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-hover text-secondary border border-line-strong'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Stats Box (Geometric Balance design) */}
      {!collapsed && (
        <div className="mt-3 p-3.5 bg-panel border border-line rounded-lg">
          <div className="text-xs text-muted uppercase font-bold mb-2 tracking-tight">
            MISSION STATS
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[13px] text-secondary">Survivors Detected</div>
              <div className="text-base font-mono font-bold text-foreground leading-none mt-0.5">
                {commandStore.survivors.length}{' '}
                <span className="text-xs text-red-700 font-bold tracking-wider">
                  +{criticalSurvivorsCount} PRIORITY
                </span>
              </div>
            </div>
            <div>
              <div className="text-[13px] text-secondary">Area Surveyed</div>
              <div className="text-base font-mono font-bold text-foreground leading-none mt-0.5">
                12.6 <span className="text-xs font-normal text-muted">KM²</span>
              </div>
            </div>
            <div>
              <div className="text-[13px] text-secondary">Drones Active</div>
              <div className="text-base font-mono font-bold text-foreground leading-none mt-0.5">
                0{activeDronesCount}{' '}
                <span className="text-xs text-green-700 font-bold tracking-wider">
                  NOMINAL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse/Expand button */}
      <div className="pt-2 mt-2 border-t border-line">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1 rounded hover:bg-hover text-muted hover:text-secondary text-xs font-mono transition-colors tracking-wide uppercase"
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </aside>
  );
};
