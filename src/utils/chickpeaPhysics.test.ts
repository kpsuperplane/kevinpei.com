import { describe, expect, test } from 'bun:test';
import {
  createParticles,
  normalizedColliderToBounds,
  normalizedColliderToSvg,
  particleCountForWidth,
  resolveParticleAgainstCollider,
  resolveParticlePair,
  roundedRectSignedDistance,
  scaleParticles,
  simulationIsSettled,
  stepSimulation,
  type ChickpeaParticle,
  type Collider,
} from './chickpeaPhysics';

function particle(overrides: Partial<ChickpeaParticle> = {}): ChickpeaParticle {
  return {
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 10,
    rotation: 0,
    angularVelocity: 0,
    spawnAt: 0,
    active: true,
    alive: true,
    settled: false,
    settleFrames: 0,
    variant: 0,
    ...overrides,
  };
}

describe('normalized collider geometry', () => {
  test('maps percentages into responsive pixel bounds', () => {
    const collider = normalizedColliderToBounds({
      shape: 'rounded-rect',
      x: 10,
      y: 20,
      width: 50,
      height: 40,
      radius: 10,
    }, { width: 400, height: 200 });

    expect(collider).toEqual({
      shape: 'rounded-rect',
      x: 40,
      y: 40,
      width: 200,
      height: 80,
      radius: 20,
      label: undefined,
    });
  });

  test('uses the numeric aspect ratio as the SVG view-box width', () => {
    const collider = normalizedColliderToSvg({
      shape: 'circle',
      cx: 25,
      cy: 40,
      radius: 5,
    }, 2);

    expect(collider).toEqual({
      shape: 'circle',
      cx: 0.5,
      cy: 0.4,
      radius: 0.05,
      label: undefined,
    });
  });
});

describe('particle generation', () => {
  test('scales particle count by width without exceeding the configured maximum', () => {
    expect(particleCountForWidth(700, 36)).toBe(35);
    expect(particleCountForWidth(320, 36)).toBe(16);
    expect(particleCountForWidth(700, 12)).toBe(12);
  });

  test('produces stable particles from the same seed', () => {
    expect(createParticles(600, 12, 14)).toEqual(createParticles(600, 12, 14));
    expect(createParticles(600, 12, 14)).not.toEqual(createParticles(600, 12, 15));
  });
});

describe('collision resolution', () => {
  test('pushes a particle out of a circular obstacle', () => {
    const chickpea = particle({ x: 50, y: 50, vy: 20 });
    const collider: Collider = { shape: 'circle', cx: 50, cy: 50, radius: 12 };

    expect(resolveParticleAgainstCollider(chickpea, collider)).toBe(true);
    expect(Math.hypot(chickpea.x - collider.cx, chickpea.y - collider.cy))
      .toBeCloseTo(chickpea.radius + collider.radius, 5);
  });

  test('a moving interactive collider wakes and pushes a settled particle', () => {
    const chickpea = particle({ x: 62, y: 50, settled: true });
    const collider: Collider = {
      shape: 'circle',
      cx: 50,
      cy: 50,
      radius: 8,
      interactive: true,
      wakeSettled: true,
      velocityX: 120,
      velocityY: 0,
    };

    expect(resolveParticleAgainstCollider(chickpea, collider)).toBe(true);
    expect(chickpea.settled).toBe(false);
    expect(chickpea.settleFrames).toBe(0);
    expect(chickpea.vx).toBeGreaterThan(0);
  });

  test('does not let the cursor push a particle into an internal circle', () => {
    const chickpea = particle({ x: 65, y: 50 });
    const internalCircle: Collider = {
      shape: 'circle',
      cx: 100,
      cy: 50,
      radius: 25,
    };
    const cursor: Collider = {
      shape: 'circle',
      cx: 45,
      cy: 50,
      radius: 25,
      interactive: true,
      wakeSettled: true,
      velocityX: 150,
    };

    stepSimulation([chickpea], [internalCircle, cursor], { width: 240, height: 140 }, 1 / 120, 1);

    expect(Math.hypot(chickpea.x - internalCircle.cx, chickpea.y - internalCircle.cy))
      .toBeGreaterThanOrEqual(chickpea.radius + internalCircle.radius - 0.00001);
  });

  test('does not let the cursor push a particle into an internal rounded rectangle', () => {
    const chickpea = particle({ x: 90, y: 50 });
    const internalRectangle: Collider = {
      shape: 'rounded-rect',
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      radius: 12,
    };
    const cursor: Collider = {
      shape: 'circle',
      cx: 70,
      cy: 50,
      radius: 25,
      interactive: true,
      wakeSettled: true,
      velocityX: 150,
    };

    stepSimulation(
      [chickpea],
      [internalRectangle, cursor],
      { width: 240, height: 140 },
      1 / 120,
      1,
    );

    expect(roundedRectSignedDistance(chickpea.x, chickpea.y, internalRectangle).distance)
      .toBeGreaterThanOrEqual(chickpea.radius - 0.00001);
  });

  test('resolves contact against a rounded corner', () => {
    const chickpea = particle({ x: 100, y: 100, vx: 30, vy: 30 });
    const collider: Collider = {
      shape: 'rounded-rect',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      radius: 20,
    };

    expect(resolveParticleAgainstCollider(chickpea, collider)).toBe(true);
    expect(roundedRectSignedDistance(chickpea.x, chickpea.y, collider).distance)
      .toBeCloseTo(chickpea.radius, 5);
  });

  test('separates overlapping chickpeas', () => {
    const first = particle({ id: 1, x: 0 });
    const second = particle({ id: 2, x: 15 });

    expect(resolveParticlePair(first, second)).toBe(true);
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeCloseTo(20, 5);
  });
});

describe('simulation lifecycle', () => {
  test('collects falling chickpeas on the component floor', () => {
    const chickpea = particle({ y: 195, vx: 20, vy: 80, angularVelocity: 3 });
    stepSimulation([chickpea], [], { width: 200, height: 200 }, 1 / 120, 1);

    expect(chickpea.alive).toBe(true);
    expect(chickpea.y + chickpea.radius).toBeCloseTo(198.5, 5);
    expect(chickpea.vy).toBeLessThanOrEqual(0);
    expect(chickpea.vx).toBeLessThan(20);
    expect(chickpea.angularVelocity).toBeLessThan(3);
  });

  test('settles residual rotation while resting on the floor', () => {
    const chickpea = particle({ y: 188.5, vx: 2, angularVelocity: 3 });

    for (let step = 0; step < 360; step += 1) {
      stepSimulation([chickpea], [], { width: 200, height: 200 }, 1 / 120, step / 120);
    }

    expect(chickpea.angularVelocity).toBe(0);
    expect(chickpea.settled).toBe(true);
  });

  test('scales positions, velocities, and radii after a resize', () => {
    const chickpea = particle({ x: 20, y: 30, vx: 4, vy: 6, radius: 8 });
    scaleParticles([chickpea], 2, 1.5);

    expect(chickpea).toMatchObject({ x: 40, y: 45, vx: 8, vy: 9, radius: 12 });
  });

  test('finishes only after every spawned particle is settled or gone', () => {
    const settled = particle({ settled: true });
    const gone = particle({ id: 1, alive: false });
    const falling = particle({ id: 2 });

    expect(simulationIsSettled([settled, gone], 1)).toBe(true);
    expect(simulationIsSettled([settled, falling], 1)).toBe(false);
  });
});
