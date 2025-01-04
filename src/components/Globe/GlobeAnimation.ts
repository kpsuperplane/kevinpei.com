import type ThreeGlobe from "three-globe";
import Animation from "./Animation";

export type Coordinate = {
  lat: number;
  lng: number;
};
function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
function getDelta(
  from: Coordinate,
  to: Coordinate
): { deltaLat: number; deltaLng: number } {
  const deltaLat = to.lat - from.lat;
  const deltaLng = to.lng - from.lng;
  return { deltaLat, deltaLng };
}

function haversine(from: Coordinate, to: Coordinate): number {
  const { deltaLat, deltaLng } = getDelta(from, to);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(from.lat) *
      Math.cos(to.lat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPosition(
  from: Coordinate,
  to: Coordinate,
  progress: number
): Coordinate {
  const { deltaLat, deltaLng } = getDelta(from, to);
  const lat = from.lat + deltaLat * progress;
  const lng = from.lng + deltaLng * progress;
  return { lat, lng };
}

export default class GlobeAnimation extends Animation {
  constructor(
    globe: ThreeGlobe,
    render: () => void,
    from: Coordinate,
    to: Coordinate,
    extraSetValue?: (progress: number) => void
  ) {
    const percentAroundTheWorld = haversine(from, to) / Math.PI;

    const durationMs = 1000 + percentAroundTheWorld * 2000;

    super(
      (progress) => {
        const { lat, lng } = getPosition(from, to, progress);
        globe.rotation.x = lat;
        globe.rotation.y = -lng;
        globe.position.z =
          400 * percentAroundTheWorld * progress * (progress - 1);
        extraSetValue?.(progress);
        render();
      },
      durationMs,
      easeInOutQuad
    );
  }
}
