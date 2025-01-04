import type ThreeGlobe from "three-globe";
import type { Coordinate } from "./GlobeAnimation";
import GlobeAnimation from "./GlobeAnimation";

export default class GlobeAnimationManager {
  constructor(private globe: ThreeGlobe, private render: () => void) {
  }
  animate(to: Coordinate) {
    new GlobeAnimation(this.globe, this.render, {lat: this.globe.rotation.x, lng: -this.globe.rotation.y}, to).play();
  }
}