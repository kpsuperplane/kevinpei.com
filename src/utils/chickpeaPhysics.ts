export type NormalizedRoundedRectCollider = {
  shape: 'rounded-rect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  label?: string;
};

export type NormalizedCircleCollider = {
  shape: 'circle';
  cx: number;
  cy: number;
  radius: number;
  label?: string;
};

export type NormalizedCollider = NormalizedRoundedRectCollider | NormalizedCircleCollider;

export type RoundedRectCollider = {
  shape: 'rounded-rect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  label?: string;
};

export type CircleCollider = {
  shape: 'circle';
  cx: number;
  cy: number;
  radius: number;
  label?: string;
  interactive?: boolean;
  wakeSettled?: boolean;
  velocityX?: number;
  velocityY?: number;
};

export type Collider = RoundedRectCollider | CircleCollider;

export type SimulationBounds = {
  width: number;
  height: number;
};

export type ChickpeaParticle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  angularVelocity: number;
  spawnAt: number;
  active: boolean;
  alive: boolean;
  settled: boolean;
  settleFrames: number;
  variant: number;
};

const OBSTACLE_RESTITUTION = 0.22;
const PARTICLE_RESTITUTION = 0.18;
const GRAVITY = 1_350;
const SETTLE_SPEED = 8;
const SETTLE_FRAMES = 42;
const SOLVER_ITERATIONS = 3;
const CONTAINER_WALL_INSET = 1.5;
const CONTACT_ANGULAR_DAMPING = 0.96;
const FLOOR_LINEAR_DAMPING = 0.975;
const ANGULAR_STOP_THRESHOLD = 0.06;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function percent(value: number): number {
  return value / 100;
}

/** Mulberry32 gives the visual effect a stable layout for a given integer seed. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function particleCountForWidth(width: number, maxPeas: number): number {
  return Math.min(Math.max(0, Math.floor(maxPeas)), Math.max(8, Math.round(width / 20)));
}

export function normalizedColliderToBounds(
  collider: NormalizedCollider,
  bounds: SimulationBounds,
): Collider {
  const shortSide = Math.min(bounds.width, bounds.height);

  if (collider.shape === 'circle') {
    return {
      shape: 'circle',
      cx: percent(collider.cx) * bounds.width,
      cy: percent(collider.cy) * bounds.height,
      radius: percent(collider.radius) * shortSide,
      label: collider.label,
    };
  }

  const width = percent(collider.width) * bounds.width;
  const height = percent(collider.height) * bounds.height;

  return {
    shape: 'rounded-rect',
    x: percent(collider.x) * bounds.width,
    y: percent(collider.y) * bounds.height,
    width,
    height,
    radius: Math.min(percent(collider.radius) * shortSide, width / 2, height / 2),
    label: collider.label,
  };
}

export function normalizedColliderToSvg(
  collider: NormalizedCollider,
  aspectRatio: number,
): Collider {
  return normalizedColliderToBounds(collider, { width: aspectRatio, height: 1 });
}

export function createParticles(width: number, maxPeas: number, seed: number): ChickpeaParticle[] {
  const random = createSeededRandom(seed);
  const count = particleCountForWidth(width, maxPeas);
  const baseRadius = clamp(width * 0.016, 7.5, 12.5);

  return Array.from({ length: count }, (_, index) => {
    const radius = baseRadius * (0.86 + random() * 0.25);
    const horizontalPadding = radius * 1.15;

    return {
      id: index,
      x: horizontalPadding + random() * Math.max(0, width - horizontalPadding * 2),
      y: -radius * (1.2 + random()),
      vx: (random() - 0.5) * 82,
      vy: 8 + random() * 30,
      radius,
      rotation: random() * Math.PI * 2,
      angularVelocity: (random() - 0.5) * 4,
      spawnAt: index * 0.055 + random() * 0.025,
      active: false,
      alive: true,
      settled: false,
      settleFrames: 0,
      variant: Math.floor(random() * 3),
    };
  });
}

export function lastSpawnTime(particles: ChickpeaParticle[]): number {
  return particles.reduce((latest, particle) => Math.max(latest, particle.spawnAt), 0);
}

function signOrOne(value: number): number {
  return value < 0 ? -1 : 1;
}

export function roundedRectSignedDistance(
  x: number,
  y: number,
  collider: RoundedRectCollider,
): { distance: number; nx: number; ny: number } {
  const radius = Math.min(collider.radius, collider.width / 2, collider.height / 2);
  const centerX = collider.x + collider.width / 2;
  const centerY = collider.y + collider.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const qx = Math.abs(dx) - (collider.width / 2 - radius);
  const qy = Math.abs(dy) - (collider.height / 2 - radius);
  const outsideX = Math.max(qx, 0);
  const outsideY = Math.max(qy, 0);
  const outsideLength = Math.hypot(outsideX, outsideY);
  const distance = outsideLength + Math.min(Math.max(qx, qy), 0) - radius;

  if (outsideLength > 0.0001) {
    return {
      distance,
      nx: signOrOne(dx) * outsideX / outsideLength,
      ny: signOrOne(dy) * outsideY / outsideLength,
    };
  }

  if (qx > qy) {
    return { distance, nx: signOrOne(dx), ny: 0 };
  }

  return { distance, nx: 0, ny: signOrOne(dy) };
}

function applySurfaceResponse(
  particle: ChickpeaParticle,
  nx: number,
  ny: number,
  surfaceVelocityX = 0,
  surfaceVelocityY = 0,
): void {
  const relativeVelocityX = particle.vx - surfaceVelocityX;
  const relativeVelocityY = particle.vy - surfaceVelocityY;
  const normalVelocity = relativeVelocityX * nx + relativeVelocityY * ny;
  if (normalVelocity < 0) {
    particle.vx -= (1 + OBSTACLE_RESTITUTION) * normalVelocity * nx;
    particle.vy -= (1 + OBSTACLE_RESTITUTION) * normalVelocity * ny;

    const tangentX = -ny;
    const tangentY = nx;
    const tangentVelocity = (particle.vx - surfaceVelocityX) * tangentX
      + (particle.vy - surfaceVelocityY) * tangentY;
    particle.vx -= tangentVelocity * tangentX * 0.075;
    particle.vy -= tangentVelocity * tangentY * 0.075;
    particle.angularVelocity += tangentVelocity / Math.max(particle.radius, 1) * 0.012;
  }

  particle.angularVelocity *= CONTACT_ANGULAR_DAMPING;
  if (Math.abs(particle.angularVelocity) < ANGULAR_STOP_THRESHOLD) {
    particle.angularVelocity = 0;
  }
}

export function resolveParticleAgainstCollider(
  particle: ChickpeaParticle,
  collider: Collider,
): boolean {
  if (!particle.active || !particle.alive) return false;
  if (
    particle.settled
    && (collider.shape !== 'circle' || !collider.interactive || !collider.wakeSettled)
  ) return false;

  if (collider.shape === 'circle') {
    const dx = particle.x - collider.cx;
    const dy = particle.y - collider.cy;
    const distance = Math.hypot(dx, dy);
    const minimumDistance = particle.radius + collider.radius;
    if (distance >= minimumDistance) return false;

    const nx = distance > 0.0001 ? dx / distance : 0;
    const ny = distance > 0.0001 ? dy / distance : -1;
    const penetration = minimumDistance - distance;
    particle.x += nx * penetration;
    particle.y += ny * penetration;
    if (collider.interactive && particle.settled) {
      particle.settled = false;
      particle.settleFrames = 0;
    }
    applySurfaceResponse(
      particle,
      nx,
      ny,
      collider.velocityX ?? 0,
      collider.velocityY ?? 0,
    );
    return true;
  }

  const contact = roundedRectSignedDistance(particle.x, particle.y, collider);
  if (contact.distance >= particle.radius) return false;

  const penetration = particle.radius - contact.distance;
  particle.x += contact.nx * penetration;
  particle.y += contact.ny * penetration;
  applySurfaceResponse(particle, contact.nx, contact.ny);
  return true;
}

export function resolveParticlePair(a: ChickpeaParticle, b: ChickpeaParticle): boolean {
  if (!a.active || !a.alive || !b.active || !b.alive || (a.settled && b.settled)) return false;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const minimumDistance = a.radius + b.radius;
  if (distance >= minimumDistance) return false;

  const nx = distance > 0.0001 ? dx / distance : 1;
  const ny = distance > 0.0001 ? dy / distance : 0;
  const penetration = minimumDistance - distance;
  const inverseMassA = a.settled ? 0 : 1;
  const inverseMassB = b.settled ? 0 : 1;
  const inverseMassTotal = inverseMassA + inverseMassB;
  if (inverseMassTotal === 0) return false;

  a.x -= nx * penetration * (inverseMassA / inverseMassTotal);
  a.y -= ny * penetration * (inverseMassA / inverseMassTotal);
  b.x += nx * penetration * (inverseMassB / inverseMassTotal);
  b.y += ny * penetration * (inverseMassB / inverseMassTotal);

  const relativeVelocityX = b.vx - a.vx;
  const relativeVelocityY = b.vy - a.vy;
  const normalVelocity = relativeVelocityX * nx + relativeVelocityY * ny;
  if (normalVelocity < 0) {
    const impulse = -(1 + PARTICLE_RESTITUTION) * normalVelocity / inverseMassTotal;
    a.vx -= impulse * nx * inverseMassA;
    a.vy -= impulse * ny * inverseMassA;
    b.vx += impulse * nx * inverseMassB;
    b.vy += impulse * ny * inverseMassB;

    const tangentX = -ny;
    const tangentY = nx;
    const tangentVelocity = relativeVelocityX * tangentX + relativeVelocityY * tangentY;
    const frictionImpulse = tangentVelocity * 0.035 / inverseMassTotal;
    a.vx += frictionImpulse * tangentX * inverseMassA;
    a.vy += frictionImpulse * tangentY * inverseMassA;
    b.vx -= frictionImpulse * tangentX * inverseMassB;
    b.vy -= frictionImpulse * tangentY * inverseMassB;
  }

  a.angularVelocity *= CONTACT_ANGULAR_DAMPING;
  b.angularVelocity *= CONTACT_ANGULAR_DAMPING;
  if (Math.abs(a.angularVelocity) < ANGULAR_STOP_THRESHOLD) a.angularVelocity = 0;
  if (Math.abs(b.angularVelocity) < ANGULAR_STOP_THRESHOLD) b.angularVelocity = 0;

  return true;
}

function resolveContainerWalls(
  particle: ChickpeaParticle,
  bounds: SimulationBounds,
): void {
  const leftEdge = CONTAINER_WALL_INSET;
  const rightEdge = bounds.width - CONTAINER_WALL_INSET;
  const bottomEdge = bounds.height - CONTAINER_WALL_INSET;

  if (particle.x - particle.radius < leftEdge) {
    particle.x = leftEdge + particle.radius;
    if (particle.vx < 0) particle.vx *= -0.28;
  }

  if (particle.x + particle.radius > rightEdge) {
    particle.x = rightEdge - particle.radius;
    if (particle.vx > 0) particle.vx *= -0.28;
  }

  if (particle.y + particle.radius > bottomEdge) {
    particle.y = bottomEdge - particle.radius;
    if (particle.vy > 0) particle.vy *= -0.2;
    particle.vx *= FLOOR_LINEAR_DAMPING;
    particle.angularVelocity *= CONTACT_ANGULAR_DAMPING;
    if (Math.abs(particle.angularVelocity) < ANGULAR_STOP_THRESHOLD) {
      particle.angularVelocity = 0;
    }
  }
}

function resolveParticleBuckets(particles: ChickpeaParticle[]): void {
  const activeParticles = particles.filter((particle) => particle.active && particle.alive);
  if (activeParticles.length < 2) return;

  const maxRadius = activeParticles.reduce((largest, particle) => Math.max(largest, particle.radius), 1);
  const cellSize = maxRadius * 2.4;
  const buckets = new Map<string, ChickpeaParticle[]>();

  activeParticles.forEach((particle) => {
    const column = Math.floor(particle.x / cellSize);
    const row = Math.floor(particle.y / cellSize);
    const key = `${column}:${row}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(particle);
    else buckets.set(key, [particle]);
  });

  activeParticles.forEach((particle) => {
    const column = Math.floor(particle.x / cellSize);
    const row = Math.floor(particle.y / cellSize);

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const bucket = buckets.get(`${column + offsetX}:${row + offsetY}`);
        bucket?.forEach((other) => {
          if (other.id > particle.id) resolveParticlePair(particle, other);
        });
      }
    }
  });
}

export function stepSimulation(
  particles: ChickpeaParticle[],
  colliders: Collider[],
  bounds: SimulationBounds,
  deltaSeconds: number,
  elapsedSeconds: number,
): void {
  const interactiveColliders = colliders.filter(
    (collider) => collider.shape === 'circle' && collider.interactive,
  );
  const internalColliders = colliders.filter(
    (collider) => collider.shape !== 'circle' || !collider.interactive,
  );

  particles.forEach((particle) => {
    if (!particle.alive || particle.settled) return;
    if (!particle.active) {
      if (elapsedSeconds < particle.spawnAt) return;
      particle.active = true;
    }

    particle.vy += GRAVITY * deltaSeconds;
    const airDamping = Math.pow(0.997, deltaSeconds * 60);
    particle.vx *= airDamping;
    particle.angularVelocity *= Math.pow(0.992, deltaSeconds * 60);
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    particle.rotation += particle.angularVelocity * deltaSeconds;
  });

  for (let iteration = 0; iteration < SOLVER_ITERATIONS; iteration += 1) {
    particles.forEach((particle) => {
      if (!particle.active || !particle.alive) return;
      if (!particle.settled) resolveContainerWalls(particle, bounds);
      interactiveColliders.forEach(
        (collider) => resolveParticleAgainstCollider(particle, collider),
      );
      internalColliders.forEach(
        (collider) => resolveParticleAgainstCollider(particle, collider),
      );
    });
    resolveParticleBuckets(particles);

    // Authored shapes are hard constraints: pointer and particle impulses cannot
    // win the final solver pass and leave a chickpea embedded inside them.
    particles.forEach((particle) => {
      if (!particle.active || !particle.alive || particle.settled) return;
      internalColliders.forEach(
        (collider) => resolveParticleAgainstCollider(particle, collider),
      );
    });
  }

  particles.forEach((particle) => {
    if (!particle.active || !particle.alive || particle.settled) return;

    if (particle.y - particle.radius > bounds.height + 40) {
      particle.alive = false;
      return;
    }

    const speed = Math.hypot(particle.vx, particle.vy);
    if (speed < SETTLE_SPEED && Math.abs(particle.angularVelocity) < 0.35) {
      particle.settleFrames += 1;
      if (particle.settleFrames >= SETTLE_FRAMES) {
        particle.settled = true;
        particle.vx = 0;
        particle.vy = 0;
        particle.angularVelocity = 0;
      }
    } else {
      particle.settleFrames = 0;
    }
  });
}

export function simulationIsSettled(particles: ChickpeaParticle[], elapsedSeconds: number): boolean {
  if (particles.length === 0 || elapsedSeconds < lastSpawnTime(particles)) return false;
  return particles.every((particle) => !particle.alive || (particle.active && particle.settled));
}

export function scaleParticles(
  particles: ChickpeaParticle[],
  scaleX: number,
  scaleY: number,
): void {
  const radiusScale = Math.min(scaleX, scaleY);
  particles.forEach((particle) => {
    particle.x *= scaleX;
    particle.y *= scaleY;
    particle.vx *= scaleX;
    particle.vy *= scaleY;
    particle.radius *= radiusScale;
  });
}
