import type ThreeGlobe from "three-globe";
import Animation from "./Animation";

export type Coordinate = {
  lat: number;
  lng: number;
};

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export default class GlobeAnimation extends Animation {
  constructor(
    globe: ThreeGlobe,
    render: () => void,
    from: Coordinate,
    to: Coordinate,
  ) {
    const deltaLat = to.lat - from.lat;
    const deltaLng = to.lng - from.lng;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(from.lat) *
        Math.cos(to.lat) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const percentAroundTheWorld = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) / Math.PI;

    const durationMs = percentAroundTheWorld * 4000;

    super((progress) => {
      const lat = from.lat + deltaLat * progress;
      const lng = from.lng + deltaLng * progress;
      globe.rotation.x = lat;
      globe.rotation.y = -lng;
      globe.position.z = 400 * percentAroundTheWorld * progress * (progress - 1);
      render();
    }, durationMs, easeOutCubic);
  }
}
