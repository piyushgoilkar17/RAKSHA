import type { Hazard } from '../types';

export type RoutePoint = { latitude: number; longitude: number };
type XY = { x: number; y: number };
type Box = { left: number; right: number; bottom: number; top: number };
export type RescueRoute = {
  path: RoutePoint[];
  distanceMeters: number;
  approachMeters: number;
  buffers: { bounds: [RoutePoint, RoutePoint]; hazardId: string }[];
  error?: string;
};

// Demo-only exclusion margins, not validated emergency-response distances.
const margins = { CRITICAL: 150, HIGH: 100, MEDIUM: 60, LOW: 30 };
const inside = (p: XY, b: Box) => p.x >= b.left && p.x <= b.right && p.y >= b.bottom && p.y <= b.top;
const distance = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y);

// Liang–Barsky clipping: touching a closed exclusion box counts as blocked.
function intersects(a: XY, b: XY, box: Box) {
  let enter = 0;
  let exit = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const [p, q] of [[-dx, a.x - box.left], [dx, box.right - a.x], [-dy, a.y - box.bottom], [dy, box.top - a.y]]) {
    if (p === 0) { if (q < 0) return false; }
    else {
      const ratio = q / p;
      if (p < 0) enter = Math.max(enter, ratio);
      else exit = Math.min(exit, ratio);
      if (enter > exit) return false;
    }
  }
  return true;
}

export function calculateRescueRoute(hq: RoutePoint, target: RoutePoint, hazards: Hazard[]): RescueRoute {
  const scaleX = 111320 * Math.cos(hq.latitude * Math.PI / 180);
  const project = (p: RoutePoint): XY => ({ x: (p.longitude - hq.longitude) * scaleX, y: (p.latitude - hq.latitude) * 111320 });
  const unproject = (p: XY): RoutePoint => ({ latitude: hq.latitude + p.y / 111320, longitude: hq.longitude + p.x / scaleX });
  const active = hazards.filter(h => h.status !== 'Resolved' && h.status !== 'False Positive');
  const boxes = active.map(h => {
    const p = project(h);
    const radius = Math.max(0, h.radiusMeters) + margins[h.severity];
    return { left: p.x - radius, right: p.x + radius, bottom: p.y - radius, top: p.y + radius };
  });
  const buffers = boxes.map((b, i) => ({ hazardId: active[i].hazardId, bounds: [unproject({ x: b.left, y: b.bottom }), unproject({ x: b.right, y: b.top })] as [RoutePoint, RoutePoint] }));
  const empty = { path: [], distanceMeters: 0, approachMeters: 0, buffers };
  const start = project(hq), destination = project(target);
  if (boxes.some(b => inside(start, b))) return { ...empty, error: 'HQ is inside a hazard buffer. Drag HQ outside the shaded areas.' };
  const corners = boxes.flatMap(b => [
    { x: b.left - 2, y: b.bottom - 2 }, { x: b.left - 2, y: b.top + 2 },
    { x: b.right + 2, y: b.bottom - 2 }, { x: b.right + 2, y: b.top + 2 },
  ]).filter(p => !boxes.some(b => inside(p, b)));
  let end = destination;
  if (boxes.some(b => inside(destination, b))) {
    // Stop outside the hazard rather than label a hazardous final leg safe.
    const candidates = [...corners];
    for (const b of boxes) {
      candidates.push(
        { x: b.left - 2, y: Math.max(b.bottom, Math.min(b.top, destination.y)) },
        { x: b.right + 2, y: Math.max(b.bottom, Math.min(b.top, destination.y)) },
        { x: Math.max(b.left, Math.min(b.right, destination.x)), y: b.bottom - 2 },
        { x: Math.max(b.left, Math.min(b.right, destination.x)), y: b.top + 2 },
      );
    }
    const reachable = candidates.filter(p => !boxes.some(b => inside(p, b))).sort((a,b) => distance(a,destination) - distance(b,destination));
    if (!reachable.length) return { ...empty, error: 'No staging point found outside the hazard buffers.' };
    end = reachable[0];
  }
  const nodes = [start, end, ...corners];
  const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1), visited = new Set<number>();
  costs[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (current < 0 || costs[i] < costs[current])) current = i;
    if (current < 0 || !Number.isFinite(costs[current])) break;
    if (current === 1) break;
    visited.add(current);
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i) || i === current || boxes.some(b => intersects(nodes[current], nodes[i], b))) continue;
      const cost = costs[current] + distance(nodes[current], nodes[i]);
      if (cost < costs[i]) { costs[i] = cost; previous[i] = current; }
    }
  }
  if (!Number.isFinite(costs[1])) return { ...empty, error: 'No corridor found around the current hazard buffers.' };
  const path: RoutePoint[] = [];
  for (let i = 1; i >= 0; i = previous[i]) path.unshift(unproject(nodes[i]));
  return { path, distanceMeters: costs[1], approachMeters: distance(end, destination), buffers };
}
