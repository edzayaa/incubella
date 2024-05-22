import { Vector2 } from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const renderWidth = window.innerWidth;
const renderHeight = window.innerHeight;

const unrealBloom = new UnrealBloomPass(
  new Vector2(renderWidth, renderHeight),
  1.5, // Strength
  1, // Radius
  0.1 // Threshold
);
unrealBloom.renderTargetResolution = new Vector2(0.5, 0.5); // Reducción de la resolución del render target

const BLOOM = {
  intensity: unrealBloom.strength,
  radius: unrealBloom.radius,
  threshold: unrealBloom.threshold,
  pass: unrealBloom,
};

export default PostProcesing = {
  bloomPass: BLOOM.pass,
};
/*
// Crea una instancia de dat.GUI
const gui = new dat.GUI();

// Agrega los controles para los parámetros del Bloom
const bloomFolder = gui.addFolder("Bloom");
bloomFolder.add(BLOOM, "intensity", 0, 10).onChange((value) => {
  unrealBloom.strength = value;
});
bloomFolder.add(BLOOM, "radius", 0, 10).onChange((value) => {
  unrealBloom.radius = value;
});
bloomFolder.add(BLOOM, "threshold", 0, 1).onChange((value) => {
  unrealBloom.threshold = value;
});
*/