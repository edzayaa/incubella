import {
  AdditiveBlending,
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  IcosahedronGeometry,
  ImageUtils,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  Group,
} from "three";

import * as dat from "dat.gui";

import { WebManager } from "./scenes/utils/WebManager";
import { CameraManager } from "./scenes/utils/CameraManager";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import TWEEN from "@tweenjs/tween.js";

//shaders
import f_Particles from "./scenes/shaders/f_Particles.glsl";
import v_Particles from "./scenes/shaders/v_Particles.glsl";

import f_relleno from "./scenes/shaders/f_relleno.glsl";
import v_relleno from "./scenes/shaders/v_relleno.glsl";

import f_mainSphere from "./scenes/shaders/f_mainSphere.glsl";
import v_mainSphere from "./scenes/shaders/v_mainSphere.glsl";

import f_pSphere from "./scenes/shaders/f_pSphere.glsl";
import v_pSphere from "./scenes/shaders/v_pSphere.glsl";
import { HoloSphere } from "./components/UI/HoloSphere";
import { BackGroundParticles } from "./components/3dWorld/BackGroundParticles";
import { GalaxyParticles } from "./components/3dWorld/GalaxyParticles";

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);

const primeraPantalla = new Vector3(0, 100, 100);
const segundaPantalla = new Vector3(0, 30, 30);
const debugPantalla = new Vector3(0, 500, 500);

let isSecondScreen = false;
let isInScreen = false;

const CAM_MANAGER = new CameraManager(camera);
CAM_MANAGER.container.position.copy(primeraPantalla);
//CAM_MANAGER.container.position.set(0, 100, 100);

const webManager = new WebManager("Main", CAM_MANAGER);

let domItems = [];
let domItemsSecond = [];
let target = null;

let axisHelper = null;

// Variables
const colors = [
  0x0dd5fd, //azul
  0x0dd5fd, //azul
  0x0c94fc, // Celeste claro
  0x0c94fc, // Celeste claro
  0xa133d7, // morado
  0x2573b0, // azul bandera
  0x2573b0, // azul bandera

  // Puedes agregar más colores aquí...
];



//valor de factor de las particulas
const particleProps = {
  opacity: 1.0,
};

//COMPONENTES
const holoSphere = new HoloSphere(1200, 12);

//PARTICULAS
const backgroundParticles = new BackGroundParticles(2000, colors);


const galaxyCout = 4000;
const galaxyParticles = new GalaxyParticles(galaxyCout, colors, true);



//la escena web
webManager.setEnviroment(webManager.web3d, (web) => {
  //START NUEVO
  //3d enviroment
  const ambientLight = new AmbientLight();
  ambientLight.intensity = 2;
  axisHelper = new AxesHelper(20);
  axisHelper.position.copy(new Vector3(0, 32, 0));

  //componentes UI
  web.add(holoSphere.self);

  //particulas
  web.add(galaxyParticles.self);
  console.log(backgroundParticles)
  web.add(backgroundParticles.self);

  //raycaster
  const plane = new Mesh(
    new PlaneGeometry(300, 300, 10),
    new MeshBasicMaterial({ wireframe: true })
  );
  CAM_MANAGER.plane = plane;
  plane.rotation.x = -Math.PI / 2;
  web.add(plane);
  plane.visible = false;
  axisHelper.visible = false;
  web.add(axisHelper);
});

const segundaVista = new Vector3(0, 30, 0);
target = new Vector3(0, 15, 0);

const screenAnim = animatePosition(
  CAM_MANAGER.container.position,
  segundaPantalla,
  4500
);
const viewAnim = animatePosition(target, segundaVista, 4200);

const opacityAnim = animateValue(particleProps, "opacity", 0.05, 4500);
//opacityFactor = 0.1;

const handlreClick = (event) => {
  console.log(event.target);
  isSecondScreen = true;
  console.log("viajar", isSecondScreen);
  screenAnim.start();
  viewAnim.start();
  opacityAnim.start();
};
//la escena html

let grupoDotsContainer = null;
const grupoDots = new Group();

let displayBContainer = new Group();

webManager.setEnviroment(webManager.webHtml, (html) => {
  //agregar primera pantalla
  const dots = {
    chat: {
      title: "Token-gated chat",
      link: "https://img.icons8.com/material-rounded/24/filled-chat.png",
    },
    ntf: {
      title: "NFT ticketing",
      link: "https://img.icons8.com/ios-filled/50/image-file.png",
    },
    chain: {
      title: "On-chain Memberships",
      link: "https://img.icons8.com/external-obvious-glyph-kerismaker/48/external-block-chain-digital-service-glyph-obvious-glyph-kerismaker.png",
    },
    card: {
      title: "Access cards",
      link: "https://img.icons8.com/material-rounded/24/tab.png",
    },
  };
  grupoDotsContainer = new Group();
  for (const key in dots) {
    if (dots.hasOwnProperty(key)) {
      const dot = dots[key];
      const elementContainer = document.createElement("div");
      const element = document.createElement("div");
      const img = document.createElement("img");
      const span = document.createElement("span");
      const text = document.createElement("h2");

      element.classList.add("element");
      img.srcset = dot.link;
      text.innerHTML = dot.title;

      element.appendChild(span);
      element.appendChild(text);
      element.appendChild(img);

      elementContainer.addEventListener("pointerdown", handlreClick);

      elementContainer.appendChild(element);

      const header = new CSS3DObject(elementContainer);
      const scale = 0.1;

      header.scale.set(scale, scale, scale);
      header.position.set(1, 0, 0);

      grupoDots.add(header);
      domItems.push(header);
    }
  }

  //configurar centro

  grupoDots.position.set(0, 0, -15);
  grupoDotsContainer.position.set(0, 15, 0);
  grupoDotsContainer.add(grupoDots);
  html.add(grupoDotsContainer);

  //segunda pantalla

  for (let index = 0; index < 5; index++) {
    const element = document.createElement("div");
    const elementContainer = document.createElement("div");
    element.innerHTML = "Lorem" + index;
    element.classList.add("element-b");
    elementContainer.appendChild(element);

    const header = new CSS3DObject(elementContainer);
    const scale = 0.04;

    header.scale.set(scale, scale, scale);
    displayBContainer.add(header);
    domItemsSecond.push(header);
  }

  CAM_MANAGER.displayA = domItems;
  CAM_MANAGER.displayB = domItemsSecond;

  html.add(displayBContainer);
  //posicionar los segunda pantalla
  const radioS = 25;
  const centerS = new Vector3(0, 35, 0); // Vector3 que representa el centro

  for (let index = 0; index < domItemsSecond.length; index++) {
    const fixed = 1;
    const fixedAngle = -5;
    const angle = (Math.PI * fixed * index) / domItemsSecond.length; // Calcular el ángulo para esta iteración
    const x = radioS * Math.sin(angle - fixedAngle);
    const y = radioS * Math.cos(angle - fixedAngle);

    const position = new Vector3(x, y, 0);
    position.add(centerS); // Sumar el vector del centro para obtener la posición final

    domItemsSecond[index].position.copy(position);
  }

  //vista relativo
  /*
  let relative = new Vector3().addVectors(
    CAM_MANAGER.container.position,
    header.position
  );
  let relativePos = new Vector3().addVectors(
    relative,
    CAM_MANAGER.camera.position
  );

  header.lookAt(relativePos);
  */
  ///

  //posicionar
  const radio = 40;
  const center = new Vector3(0, 10, 0); // Vector3 que representa el centro

  for (let index = 0; index < domItems.length; index++) {
    const angle = (Math.PI * 2 * index) / domItems.length; // Calcular el ángulo para esta iteración
    const x = radio * Math.sin(angle);
    const z = radio * Math.cos(angle);

    const position = new Vector3(x, 0, z);
    position.add(center); // Sumar el vector del centro para obtener la posición final

    domItems[index].position.copy(position);
  }
});

//ANIMACION DE PUNTOS
function updateParticlesPositions(geometry, newparticlesPositions, intensity) {
  let newCount = newparticlesPositions.length;
  let newPoints = newparticlesPositions;
  const oldPositions = geometry.attributes.position.array;

  for (let i = 0; i < newCount; i++) {
    const i3 = i * 3;
    const lasIntensity = Math.random() * intensity;

    const x =
      newPoints[i3] === undefined ? newPoints[i3 % newCount] : newPoints[i3];
    const y =
      newPoints[i3 + 1] === undefined
        ? newPoints[(i3 % newCount) + 1]
        : newPoints[i3 + 1];
    const z =
      newPoints[i3 + 2] === undefined
        ? newPoints[(i3 % newCount) + 2]
        : newPoints[i3 + 2];

    geometry.attributes.position.array[i3] +=
      (x - oldPositions[i3]) * lasIntensity;
    geometry.attributes.position.array[i3 + 1] +=
      (y - oldPositions[i3 + 1]) * lasIntensity;
    geometry.attributes.position.array[i3 + 2] +=
      (z - oldPositions[i3 + 2]) * lasIntensity;

    // Set color and alpha to particles
    /*
      const mixedColor = colorInside.clone()
      mixedColor.lerp(colorOutside, (y + 1) / 2)
      particlesGeometry.attributes.color.array[i3] = mixedColor.r
      particlesGeometry.attributes.color.array[i3 + 1] = mixedColor.g
      particlesGeometry.attributes.color.array[i3 + 2] = mixedColor.b
      */
  }
  geometry.attributes.position.needsUpdate = true;
}

let isAnim = false;
webManager.setAnimations((delta) => {
  //animar particulas
  galaxyParticles.update(delta);
  TWEEN.update();
  if (1.2 > delta) {
    //position de las particulas
    updateParticlesPositions(galaxyParticles.geometry, galaxyParticles.arrayFrames.frame_1, 0.2);

  }
  else  if(2.5 > delta){
      updateParticlesPositions(galaxyParticles.geometry, galaxyParticles.arrayFrames.frame_2, 0.05);

  }
  else {
    updateParticlesPositions(galaxyParticles.geometry, galaxyParticles.arrayFrames.final, 0.04);

  }

  console.log("animando : ", delta)


  //animar esfera
  const angular = Math.sin(delta);

  holoSphere.update();
  holoSphere.position.y = angular + 20;

  CAM_MANAGER.camera.lookAt(target);
  CAM_MANAGER.orbitControls.update();

  TWEEN.update();

  if (isSecondScreen) {
    isInScreen = true;
    CAM_MANAGER.isDisplayA = false;

    //viewAnim.update();
    //screenAnim.update();
    //opacityAnim.update();

    screenAnim.onComplete(() => {
      //desactivar los controles de orbita

      CAM_MANAGER.orbitControls.minPolarAngle = Math.PI * 0.25;
      CAM_MANAGER.isDisplayB = true;
      CAM_MANAGER.orbitControls.maxPolarAngle = Math.PI * 0.25;

      isSecondScreen = false;
      //s_particles.visible = true;
      domItemsSecond.forEach((element) => {
        element.element
          .getElementsByClassName("element-b")[0]
          .classList.add("active");
      });

      domItems.forEach((element) => {
        element.element
          .getElementsByClassName("element")[0]
          .classList.add("desactive");
      });
    });
  } else {
    //primera pantalla

    if (!isInScreen) {
      //CAM_MANAGER.update();
    }
    domItems.forEach((element) => {
      let relative = new Vector3().addVectors(
        CAM_MANAGER.container.position,
        element.position
      );

      let fixed = new Vector3().addVectors(
        relative,
        grupoDotsContainer.position
      );
      let relativePos = new Vector3().addVectors(
        fixed,
        CAM_MANAGER.camera.position
      );

      element.lookAt(relativePos);
      element.position.y = angular - 1;
    });

    domItemsSecond.forEach((element) => {
      let relative = new Vector3().addVectors(
        CAM_MANAGER.container.position,
        element.position
      );

      let relativeFixed = new Vector3().subVectors(relative, target);

      let relativePos = new Vector3().addVectors(
        relativeFixed,
        CAM_MANAGER.camera.position
      );
      let relativePosFixed = new Vector3().subVectors(
        relativePos,
        displayBContainer.position
      );

      element.lookAt(relativePosFixed);
    });

    //mover los dots

    let relative = new Vector3().addVectors(
      CAM_MANAGER.container.position,
      grupoDotsContainer.position
    );

    let relativePos = new Vector3().addVectors(
      relative,
      CAM_MANAGER.camera.position
    );

    let relativeFixed = new Vector3(
      relativePos.x,
      relativePos.y,
      relativePos.z
    );
    relativeFixed.y = 0;

    grupoDotsContainer.lookAt(relativeFixed);
  }

  //mover los dots

  let relative = new Vector3().addVectors(
    CAM_MANAGER.container.position,
    displayBContainer.position
  );

  let relativePos = new Vector3().addVectors(
    relative,
    CAM_MANAGER.camera.position
  );

  displayBContainer.lookAt(relativePos);
  axisHelper.position.copy(displayBContainer.position);
  axisHelper.rotation.copy(displayBContainer.rotation);

  TWEEN.update();
});

//renderizar en el bucle
CAM_MANAGER.activeOrbit();
webManager.postProcesing = true;
webManager.renderLoop();
webManager.debugScenes();

//funciones de ayuda

function animatePosition(objeto, nuevaPosicion, tiempoAnimacion) {
  // Creamos una nueva instancia de Tween para animar la posición
  const tween = new TWEEN.Tween(objeto)
    .to(nuevaPosicion, tiempoAnimacion)
    .easing(TWEEN.Easing.Quadratic.InOut);

  //tween.start();
  // Retorna el objeto de animación para control externo
  return tween;
}

function animateValue(normal, target, newValue, tiempoAnimacion) {
  const tween = new TWEEN.Tween(normal)
    .to({ [target]: newValue }, tiempoAnimacion) // Establecer 'opacity' como propiedad de destino
    .easing(TWEEN.Easing.Quadratic.InOut);
  return tween;
}

function graph(x, z) {
  const t = 5;
  const frecuency = 0.002;
  const altura = 8;

  return Math.sin(frecuency * (x ** 2 + z ** 2 + t)) * altura;
}

function lerp(start, end, t) {
  return start + t * (end - start);
}

// Crear un objeto para almacenar los valores que se modificarán
const cameraControls = {
  positionY: CAM_MANAGER.container.position.y,
  positionZ: CAM_MANAGER.container.position.z,
};

// Crear una instancia de dat.GUI
const gui = new dat.GUI();

// Agregar controles para modificar la posición y y z de la cámara
const cameraFolder = gui.addFolder("Camera Position");
cameraFolder
  .add(cameraControls, "positionY", -100, 100)
  .step(0.005)
  .name("Y Position")
  .onChange(() => {
    CAM_MANAGER.container.position.y = cameraControls.positionY;
  });
cameraFolder
  .add(cameraControls, "positionZ", -100, 100)
  .step(0.005)
  .name("Z Position")
  .onChange(() => {
    CAM_MANAGER.container.position.z = cameraControls.positionZ;
  });
