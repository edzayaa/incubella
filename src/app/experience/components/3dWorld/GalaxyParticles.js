import {
  BufferAttribute,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { BaseParticle } from "../../effects/BaseParticle";

//custom shader
import v_Particles from "../../scenes/shaders/v_Particles.glsl";
import f_Particles from "../../scenes/shaders/f_Particles.glsl";
import { log } from "three/examples/jsm/nodes/Nodes.js";

export class GalaxyParticles extends BaseParticle {
  constructor(particleCount, colors, isAnimated) {
    //
    super(particleCount, isAnimated);
    //agignar custom shader
    this.vertex = v_Particles;
    this.fragment = f_Particles;

    this._raycaster = new Raycaster();
    this._camera = null;
    this._mousePos = new Vector2();
    this._hitPoint = new Vector2();
    this._raycastArea = null;
    this.isHover = 1;
    this.ignoreMouse = false;

    this.arrayFrames = {
      start: [],
      frame_1: [],
      frame_2: [],
      final: [],
    };
    //propiedades
    this.props = {
      arrayColors: colors,
      area: 1.5,
      centerSize: 1.1,
      divisiones: 20,
      twoPI: Math.PI * 2,
      ringFrecuency: 7,
      ringSmooth: 8,
      ringNoise: 0.1,
      ringAperture: 1,
      noiseAmplitude: 1,
      noiseIntensity: 0.08,
    };
    //asignar propiedades
    this.init(this.props);

    //crear particulas
    this.setupMaterial();
    this.createObject();
  }
  //override
  setupParticles(colors, positions, sizes, props, frames) {
    let counter = 0;
    let amount = 0;
    let fixedIndex = 0;

    //frames.start = G_ARRAY

    for (let ringIndex = props.divisiones; ringIndex > 0; ringIndex--) {
      fixedIndex++;
      const random = Math.random() * ringIndex + props.centerSize;
      const insideRadius = random * 5;
      //cantidad de particulas por anillo
      const distRandom = Math.random() - 0.1;
      const ringAmount = (this.count / props.divisiones) * ringIndex;
      //calcula el radio
      const radius = Math.random() * ringIndex + props.centerSize;
      //asignar la posicion por cada anillo

      for (let index = 0; index < ringAmount; index++) {
        counter = amount + index;
        // Genera un ángulo aleatorio en radianes (0 a 2π).
        let x, y, z;
        let xEquat, zEquat;

        //randoms
        const random =
          Math.random() -
          0.5 * Math.random() * props.noiseIntensity +
          props.noiseAmplitude;
        const phiRandom = Math.PI * (Math.random() * 2);
        const ringDistance = ringIndex - Math.random() + ringIndex * distRandom;

        //angles
        const theta = Math.acos(MathUtils.randFloatSpread(2));
        const phi = MathUtils.randFloatSpread(360);
        const angle = (props.twoPI / ringAmount) * index;
        let waves =
          1 +
          props.ringAperture * Math.sin(angle * props.ringFrecuency) +
          props.ringSmooth;
        const wVes = 0.14 * Math.sin(theta * props.ringFrecuency) + 2.1;

        // FRAMES
        //ajustar area

        //FRAME DEFAULT
        xEquat = waves * (Math.sin(theta) * Math.cos(phi));
        zEquat = waves * (Math.sin(theta) * Math.sin(phi));

        x = Math.sin(angle);
        z = Math.cos(angle);
        y = wVes;

        //asignar ejes
        frames.start.push(x, y, z);

        //FRAME 1
        waves = 1.1 * Math.sin(angle * 5) + 5 + 0.3 * Math.tan(index);
        xEquat = waves * Math.cos(angle + props.ringNoise * Math.cos(index));
        zEquat = waves * Math.sin(angle + props.ringNoise * Math.sin(index));
        //ajustar area
        x = xEquat * 0.1 * random * props.area * ringDistance;
        z = zEquat * 0.1 * random * props.area * ringDistance;
        y = Math.tan(waves);
        //asignar ejes
        frames.frame_1.push(x, y, z);

        //FRAME 2
        waves = 1.1 * Math.sin(angle * 7) + 2 + 0.3 * Math.tan(index);
        xEquat =
          waves * Math.cos(angle + props.ringNoise * Math.cos(index + random));
        zEquat =
          waves * Math.sin(angle + props.ringNoise * Math.sin(index + random));
        //ajustar area
        x = xEquat * 0.05 * random * props.area * ringDistance;
        z = zEquat * 0.05 * random * props.area * ringDistance;
        y = Math.random() + -Math.sin(index);
        //asignar ejes
        frames.frame_2.push(x, y, z);

        //FRAME 2

        //noise
        let noiseIntensity = 0.1;
        let noiseAmplitude = 10;

        if (ringIndex > props.divisiones - 5) {
          noiseIntensity = noiseIntensity + 8;
          noiseIntensity = noiseAmplitude + 5;
          props.ringFrecuency = props.ringFrecuency + 0.5;
        }

        waves =
          1 +
          props.ringAperture * Math.sin(angle * props.ringFrecuency) +
          props.ringSmooth;
        xEquat = Math.cos(index * 0.1) * (1 + 0.1 * Math.sin(index));
        zEquat = Math.sin(index * 0.1) * (1 + 0.1 * Math.sin(index));
        //ajustar area
        x =
          insideRadius *
          xEquat *
          (Math.random() -
            0.5 * (Math.random() * noiseIntensity + noiseAmplitude));
        z =
          insideRadius *
          zEquat *
          (Math.random() -
            0.5 * (Math.random() * noiseIntensity + noiseAmplitude));
        y = Math.min(
          Math.tan(angle + Math.random() * 15 + ringIndex),
          (Math.random() - 0.5) * 5
        );
        //asignar ejes
        frames.final.push(x, y, z);

        //FIN POSICIONES

        //COLORES
        const colorIndex = ringIndex % props.arrayColors.length;
        const actualColor = props.arrayColors[colorIndex];
        const color = new Color(actualColor);
        //asginar colores
        colors.push(color.r, color.g, color.b);
        //FIN COLORES

        //TAMANOS
        const sizeMaxRandom = Math.random() * 15;
        const log =
          Math.abs(Math.tan(index + 1) * Math.tan(ringIndex + sizeMaxRandom)) *
          sizeMaxRandom;
        //asignar tamanos
        sizes[counter] = Math.min(Math.max(log, sizeMaxRandom), sizeMaxRandom);
        //FIN TAMANOS
      }
      amount += ringAmount;
    }
  }
  disposeArray() {
    this.array = null;
  }

  setAttributes(colors, positions, sizes) {
    // Luego, puedes usar particlePositions para configurar la geometría de las partículas
    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    this.geometry.setAttribute(
      "particleSize",
      new Float32BufferAttribute(sizes, 1)
    );

    this.geometry.computeBoundingSphere();
  }

  setupRaycaster(plane, camera) {
    this._camera = camera;
    this._raycastArea = plane;

    const handleMouseMove = (event) => {
      // Normaliza las coordenadas del mouse al rango [-1, 1]
      this._mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
      this._mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

      
      // Actualiza el raycaster con la posición del mouse
      this._raycaster.setFromCamera(this._mousePos, this._camera);
      //console.log(this._mousePos)
    };

    window.addEventListener("pointermove", handleMouseMove);
  }
  update(time, props, delta) {

    if(this.ignoreMouse) return;

    const hitPoint = rayCastUpdate(this._raycaster, this._raycastArea);

    // Ajuste de hitPoint
    hitPoint.z += 0;
    //console.log(hitPoint.z)

    // Asignar el nuevo valor a _hitPoint
    // Supongamos que u_mouse es un objeto Vector2
    const a = this.shaderMaterial.uniforms.u_mouse.value.clone(); // Clonar para evitar modificaciones directas
    const b = new Vector2(hitPoint.x, hitPoint.z);

    const c = 8 * delta; // Factor de interpolación

    // Interpolación lineal usando funciones de Three.js
    const interpolatedMouse = a.clone().lerp(b, c);

    //console.log(this._hitPoint);

    //
    this.shaderMaterial.uniforms.time.value = time;
    this.shaderMaterial.uniforms.opacityFactor.value = props.opacity;

    this.shaderMaterial.uniforms.time.needsUpdate = true;
    this.shaderMaterial.uniforms.opacityFactor.needsUpdate = true;

    this.shaderMaterial.uniforms.isHover.value = this.isHover;
    this.shaderMaterial.uniforms.isHover.needsUpdate = true;

    this.shaderMaterial.uniforms.u_mouse.value.copy(interpolatedMouse);
    this.shaderMaterial.uniforms.u_mouse.needsUpdate = true;
  }
}

function rayCastUpdate(ray, area) {
  // Usa this.raycaster en función de tus necesidades
  // Por ejemplo, puedes obtener información sobre los objetos intersectados:
  const intersect = ray.intersectObject(area);
  if (intersect.length > 0) {
    // El mouse está sobre un objeto en la escena
    const intersectedObject = intersect[0].point;
    return intersectedObject;
    // Realiza las acciones necesarias
  } else return new Vector3(0, 0, 0);
}
