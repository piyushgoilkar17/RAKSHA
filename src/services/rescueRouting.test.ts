import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateRescueRoute } from './rescueRouting';
import type { Hazard } from '../types';

const hq = { latitude: 45.44, longitude: 12.30 };
const destination = { latitude: 45.44, longitude: 12.32 };
const hazard: Hazard = {
  hazardId: 'test-hazard', droneId: 'test-drone', missionId: 'test-mission',
  hazardType: 'Fire', severity: 'HIGH', confidence: 95, status: 'Human Verified',
  latitude: 45.44, longitude: 12.31, radiusMeters: 100,
  recommendedResponse: '', imageUrl: '', detectedAt: '',
};

test('without hazards the shortest route is a direct line', () => {
  const route = calculateRescueRoute(hq, destination, []);
  assert.equal(route.error, undefined);
  assert.equal(route.path.length, 2);
  assert.equal(route.approachMeters, 0);
  assert.ok(route.distanceMeters > 1500 && route.distanceMeters < 1600);
});

test('detours stay outside every exclusion buffer, including overlapping hazards', () => {
  const route = calculateRescueRoute(hq, destination, [hazard, { ...hazard, hazardId: 'overlapping', longitude: 12.312 }]);
  assert.equal(route.error, undefined);
  assert.ok(route.path.length > 2);
  assert.ok(route.distanceMeters > calculateRescueRoute(hq, destination, []).distanceMeters);
  for (let i = 1; i < route.path.length; i++) {
    for (let step = 0; step <= 1000; step++) {
      const t = step / 1000;
      const latitude = route.path[i - 1].latitude * (1 - t) + route.path[i].latitude * t;
      const longitude = route.path[i - 1].longitude * (1 - t) + route.path[i].longitude * t;
      for (const { bounds: [sw, ne] } of route.buffers) {
        assert.ok(latitude < sw.latitude || latitude > ne.latitude || longitude < sw.longitude || longitude > ne.longitude);
      }
    }
  }
});

test('HQ inside a hazard is rejected', () => {
  const route = calculateRescueRoute(hazard, destination, [hazard]);
  assert.match(route.error!, /HQ is inside/);
  assert.equal(route.path.length, 0);
});

test('a destination inside a hazard routes to a staging point, not through the hazard', () => {
  const route = calculateRescueRoute(hq, hazard, [hazard]);
  assert.equal(route.error, undefined);
  assert.ok(route.approachMeters >= 200);
  assert.notDeepEqual(route.path.at(-1), { latitude: hazard.latitude, longitude: hazard.longitude });
});

test('resolved and false-positive hazards do not block a route', () => {
  for (const status of ['Resolved', 'False Positive'] as const) {
    const route = calculateRescueRoute(hq, destination, [{ ...hazard, status }]);
    assert.equal(route.path.length, 2);
    assert.equal(route.buffers.length, 0);
  }
});
