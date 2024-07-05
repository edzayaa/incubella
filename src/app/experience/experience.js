import {
  AmbientLight,
  AxesHelper,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Vector3,
  Group,
  Clock,
  BoxGeometry,
} from "three";

import * as dat from "dat.gui";
4;
// Importa Stats.js
import Stats from "stats.js";

// Crea una instancia de Stats
const stats = new Stats();
//stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

// Agrega el panel de Stats.js al cuerpo del documento
//document.body.appendChild(stats.dom);

//three.js
import TWEEN from "@tweenjs/tween.js";
import { WebManager } from "./scenes/utils/WebManager";
import { CameraManager } from "./scenes/utils/CameraManager";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

//componenes
import { HoloSphere } from "./components/UI/HoloSphere";
import { BackGroundParticles } from "./components/3dWorld/BackGroundParticles";
import { GalaxyParticles } from "./components/3dWorld/GalaxyParticles";
import { G_ARRAY } from "./components/3dWorld/galaxyArray";

//CONTENIDO UI
import PageLoader from "./components/UI/PageLoader";
import { AUDIO, playAudio } from "./Audio";
import { loadBeginText, loadFooterText, typeEffect } from "./font/TextAnim";
import { Item3D } from "../experience/components/3dWorld/Item3D";

//EXPERIENCIA DE USUARIO
import { MOTION, setDeviceMotion } from "./scenes/utils/DeviceMotion";
import { Console } from "console";
setDeviceMotion();

window.onload = () => {
  //EFFECTS

  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
  );

  const beginFocus = new Vector3(-55, 0, -16);
  const beginPosition = new Vector3(-50, 100, 150);

  const primeraPantalla = new Vector3(0, 100, 100);
  const segundaPantalla = new Vector3(0, 57, 57);//Vector3(0, 57, 57);

  const movil_primeraPantalla = new Vector3(0, 220, 150);
  const movil_segundaPantalla = new Vector3(0, 54, 63);

  const debugPantalla = new Vector3(0, 500, 500);
  const VIEWPORT_WIDTH = window.innerWidth;
  const VIEWPORT_HEIGH = window.innerHeight;

  let isSecondScreen = false;

  let isSceneStarted = false;

  const CAM_MANAGER = new CameraManager(camera);

  if (!isOneMobileVertical()) {
    CAM_MANAGER.container.position.copy(primeraPantalla);
    console.log("computadora >>", VIEWPORT_WIDTH);
  } else {
    CAM_MANAGER.container.position.copy(movil_primeraPantalla);
    console.log("movil  >>", VIEWPORT_WIDTH);
  }

  const webManager = new WebManager("Main", CAM_MANAGER);

  let target = null;
  let domItems = [];

  let axisHelper = null;

  // Variables
  const colors = [
    0x0dd5fd, //azul
    0x0dd5fd, //azul
    0x0c94fc, // Celeste claro
    0x0c94fc, // Celeste claro
    0x0cf9fff, // violeta
    0x02573b0, // azul bandera
    0x02573b0, // azul bandera
    0x0cf9fff, // violeta

    // Puedes agregar más colores aquí...
  ];

  //valor de factor de las SCROL

  const particleProps = {
    opacity: 0.5,
  };
  let ITEM_COUNT = 2000;
  let sphereCount = 500;
  if (VIEWPORT_WIDTH <= 500) {
    ITEM_COUNT = 1000;
    sphereCount = 350;
    particleProps.opacity = 0.5;
  }

  const ITEM_3D = new Item3D(ITEM_COUNT, colors);

  let ITEM_ICON_3D = null;
  let PREVIEW_ELEMENT = null;
  let dots = null;
  let isHover = false;
  let disable = false;
  //

  //COMPONENTES
  const holoSphere = new HoloSphere(sphereCount, 17);
  holoSphere.self.children[0].frustumCulled = false;
  holoSphere.self.children[1].frustumCulled = false;
  holoSphere.self.frustumCulled = false;

  //PARTICULAS
  let bgCount = 2000;
  let galaxyCout = 4000;

  if (VIEWPORT_WIDTH <= 500) {
    //pc
    bgCount = 200;
    galaxyCout = 3000;
  }

  const backgroundParticles = new BackGroundParticles(bgCount, colors);
  const galaxyParticles = new GalaxyParticles(galaxyCout, colors, true);

  //la escena web 3d
  webManager.setEnviroment(webManager.web3d, (web) => {
    //3d enviroment
    const ambientLight = new AmbientLight();
    ambientLight.intensity = 2;
    axisHelper = new AxesHelper(20);

    //componentes UI
    web.add(holoSphere.self);

    //particulas
    galaxyParticles.position.set(0, -10, 0);
    galaxyParticles.self.frustumCulled = false;
    web.add(galaxyParticles.self);
    web.add(backgroundParticles.self);
    web.add(ITEM_3D.self);

    backgroundParticles.arrayFrames.final = backgroundParticles.arrayPositions;

    //  ter
    const plane = new Mesh(
      new PlaneGeometry(1500, 1500, 1),
      new MeshBasicMaterial({ wireframe: true })
    );
    CAM_MANAGER.plane = plane;
    plane.visible = false;
    axisHelper.visible = true;
    plane.rotation.x = -Math.PI / 2;

    //RAYCASTER
    galaxyParticles.setupRaycaster(plane, camera);
    //agregar a la escena
    web.add(plane);
    //web.add(axisHelper);
    axisHelper.position.set(-60, 0, 0);
  });

  //#region GLOBAL VARIABLESlet
  let isPageActive = false;
  let loadPreview = "";
  let goBack = false;
  const PAGE_LOADER_MANAGER = new PageLoader();
  const CONTENT_OBJ = new CSS3DObject(PAGE_LOADER_MANAGER.currentElement);
  //NAvigatioN MENU
  const NAV_MENU_REF = document.getElementById("navigation-menu");
  const FOOTER_TEXT = document.getElementById("span-footer-text");

  target = new Vector3(0, 15, 0);
  const primeraVista = new Vector3(0, 15, 0);
  let segundaVista = new Vector3();

  segundaVista.set(0, 42, 0);

  let screenAnim = null;
  //begin
  let beginFocusAnim = null;
  let beginPositionAnim = null;
  //defualt position
  let idleFocusAnim = null;
  let idlePositionAnim = null;

  if (VIEWPORT_WIDTH >= 740) {
    //setup soud btn
    screenAnim = animatePosition(
      CAM_MANAGER.container.position,
      segundaPantalla,
      4500
    );
    console.log("computadora >>", VIEWPORT_WIDTH);

    beginFocusAnim = animatePosition(target, beginFocus, 1800);
    beginPositionAnim = animatePosition(
      CAM_MANAGER.container.position,
      beginPosition,
      2100
    );

    idlePositionAnim = animatePosition(
      CAM_MANAGER.container.position,
      primeraPantalla,
      2100
    );
    idleFocusAnim = animatePosition(target, primeraVista, 2100);
  } else {
    segundaVista.set(0, 44, 0);
    screenAnim = animatePosition(
      CAM_MANAGER.container.position,
      movil_segundaPantalla,
      4500
    );
    console.log("movil ANIMACION  >>", VIEWPORT_WIDTH);
  }
  const BTN_SOUND_nav = document.getElementById("sound-btn-bar");
  const BTN_SOUND = document.getElementById("sound-btn");
  const BTN_launch = document.getElementById("launch-app-btn");
  let isContenPage = false;

  const viewAnim = animatePosition(target, segundaVista, 4200);
  const viewAnimBack = animatePosition(target, primeraVista, 4200);
  let camAnimBack = null;
  let screenAnimBack = null;
  if (!isOneMobileVertical()) {
    screenAnimBack = animatePosition(
      CAM_MANAGER.container.position,
      primeraPantalla,
      4200
    );
    console.log("computadora >>", VIEWPORT_WIDTH);
  } else {
    screenAnimBack = animatePosition(
      CAM_MANAGER.container.position,
      movil_primeraPantalla,
      4200
    );
    console.log("movil  >>", VIEWPORT_WIDTH);
  }

  let MAX_OPACITY = 0;
  if (VIEWPORT_WIDTH <= 500) {
    //movil
    MAX_OPACITY = 0.5;
  } else {
    MAX_OPACITY = 1;
  }

  const opacityAnim = animateValue(
    particleProps,
    "opacity",
    0.15,
    4200,
    TWEEN.Easing.Sinusoidal.Out
  );

  const opacityAnimBack = animateValue(
    particleProps,
    "opacity",
    MAX_OPACITY,
    3000,
    TWEEN.Easing.Quartic.In
  );
  let lastActivedIcon = null;

  const navHandleClick = (event) => {
    const tName = event.target.tagName;
    if (tName === "IMG") {
      //playAudio(AUDIO.clickEffect);
    }
    const container = event.target.parentNode;

    container.classList.add("actived");

    if (lastActivedIcon) {
      lastActivedIcon.classList.remove("actived");
      lastActivedIcon = container;
    } else {
      lastActivedIcon = container;
    }

    const pageId =
      container.getAttribute("dataset") ||
      event.target.id ||
      container.id ||
      container.getAttribute("data-icon");

    //LOAD PAGE
    PAGE_LOADER_MANAGER.hideElement();
    PAGE_LOADER_MANAGER.loadPage(pageId);

    //LOAD PREVIEW
    ITEM_3D.changeModel(pageId, 2.5);
  };
  const RENDERER_BACK = document.getElementById("renderer");

  //back btn
  const BACK_BTN = document.getElementById("back-btn");
  let isTravelling = false;
  let isTravellingBack = false;

  //
  BTN_launch.addEventListener("click", () => {
    window.open("https://app.munity.ai/", "_blank");
  });

  BACK_BTN.addEventListener("click", () => {
    if (isTravelling) return;
    isTravellingBack = true;
    isMainPage = true;
    isContenPage = false;
    BTN_SOUND.classList.toggle("min");
    BTN_SOUND_nav.classList.add("deactive");
    BTN_SOUND_nav.classList.remove("fade-in");
    disable = false;
    console.log("VOLVER >HOME");
    PAGE_LOADER_MANAGER.hideElement();
    goBack = true;

    setTimeout(() => {
      screenAnimBack.start();
      viewAnimBack.start();
      opacityAnimBack.start();
    }, 300);

    //reseteat vista
    ITEM_3D.changeModel("reset", 0.2);

    //activar barra navegacion
    NAV_MENU_REF.classList.add("fade-out");

    const FOOTER_TEXT = document.getElementById("span-footer-text");
    FOOTER_TEXT.classList.remove("fade-in");

    isSecondScreen = false;
    ITEM_3D.ignoreMouse=false;
    //galaxyParticles.ignoreMouse=false;
    isPageActive = false;

    BACK_BTN.classList.remove("fade-in");
    BACK_BTN.classList.add("deactive");

    RENDERER_BACK.style.background = "transparent";
  });

  const handlreClick = (event) => {
    if (!isOneMobileVertical()) {
      //setup soud btn
      screenAnim = animatePosition(
        CAM_MANAGER.container.position,
        segundaPantalla,
        4500
      );
      console.log("computadora >>", VIEWPORT_WIDTH);
    } else {
      segundaVista.set(0, 44, 0);
      screenAnim = animatePosition(
        CAM_MANAGER.container.position,
        movil_segundaPantalla,
        4500
      );
      console.log("movil ANIMACION  >>", VIEWPORT_WIDTH);
    }
    disable = true;

    if (event.target.tagName !== "IMG") return;
    CAM_MANAGER.isDisplayA = false;
    hideIcons();

    isTravelling = true;
    isContenPage = true;
    isSecondScreen = true;
    ITEM_3D.ignoreMouse=true;
    //galaxyParticles.ignoreMouse=true;
    isPageActive = true;

    setTimeout(() => {
      screenAnim.start();
      viewAnim.start();
      opacityAnim.start();
    }, 300);
    //esperar unos segundo para la carga
    setTimeout(() => {
     /*
      if (mainSpan.classList.contains("visible")) {
        mainSpan.classList.remove("visible");
      }
      */
      if (VIEWPORT_WIDTH <= 768) {
        BTN_SOUND.classList.add("min");
        BTN_SOUND_nav.classList.remove("deactive");
        BTN_SOUND_nav.classList.add("fade-in");
      }

      BACK_BTN.classList.add("fade-in");
      BACK_BTN.classList.remove("deactive");

      const container = event.target.parentNode;
      const pageId =
        container.getAttribute("dataset") ||
        event.target.id ||
        container.id ||
        container.getAttribute("data-icon");

      //LOAD PAGE
      PAGE_LOADER_MANAGER.loadPage(pageId);
      //animar las particulas

      loadPreview = pageId;
      //activar barra navegacion
      NAV_MENU_REF.classList.add("fade-in");
      NAV_MENU_REF.classList.remove("deactive");
      NAV_MENU_REF.classList.remove("fade-out");

      FOOTER_TEXT.classList.add("deactive");
      CAM_MANAGER.parallax = false;
      console.log("DATA CARGADA VIAJANDO......");
    }, 800);

    /*
    camAnimBack = animatePosition(
      CAM_MANAGER.camera.position,
      new Vector3(),
      4200
    );
    */
  };
  //la escena html

  let grupoDotsContainer = null;
  const DOT_CONTAINER = new Group();
  const grupoDots = new Group();

  //VARIABLE GLOBALES DE WEB HTML
  let isBgSoundActive = true;
  let isDive = false;

  let toggleSound = false;
  let activeMenu = false;

  let FIRST_SCREEN_DISABLE = false;
  let DOT_ITEM_LIST = null;

  let mainSpan = document.getElementById("main-span");

  //#endregion END GLOBAL VARIABLES
  webManager.setEnviroment(webManager.webHtml, (html) => {
    document.addEventListener("DOMContentLoaded", (event) => {
      console.log("DOM CARGADO");

      loadBeginText();
    });

    const CREDIT_BACK_BTN = document.getElementById("credit__back-btn");
    CREDIT_BACK_BTN.addEventListener("mouseover", (event) => {
      ////playAudio(AUDIO.hoverEffect);
    });
    CREDIT_BACK_BTN.addEventListener("click", (event) => {
      //console.log(event.target);
      //playAudio(AUDIO.clickEffect);
      const FIRST_SCREEN = document.getElementById("first-screen");
      const ROOT = document.getElementById("root");
      const CREDIT = document.getElementById("credit");
      const PrincipalLogo = document.getElementById("navbar");
      const CreditLogo = document.getElementById("creditLogo_");

      try {
        ROOT.style.zIndex = "99";
      } catch {}

      
      CREDIT.classList.remove("fade-in");
      CREDIT.classList.add("fade-out");
      CreditLogo.classList.add("CreditBackLogo");
      console.log("ESTADO>>", FIRST_SCREEN_DISABLE);
      FIRST_SCREEN.classList.remove("fade-out");
      PrincipalLogo.classList.remove("d-none");
      PrincipalLogo.classList.add("fade-in");

      if (!FIRST_SCREEN_DISABLE) {
        FIRST_SCREEN.classList.add("fade-in");

        setTimeout(() => {
          CREDIT.classList.add("deactive");
          //CREDIT.classList.add("deactive");
          FIRST_SCREEN.classList.remove("deactive");
          ROOT.classList.remove("fade-out");
          
          CreditLogo.classList.remove("CreditBackLogo");
        }, 1800);
      } else {
        console.log("AHORA EN HOME");
        setTimeout(() => {
          ROOT.classList.add("deactive");
          CREDIT.classList.add("deactive");
          PrincipalLogo.classList.remove("d-none");
        }, 2300);
      }
    });

    //credisst btn
    const CREDIT_BTN = document.getElementById("credit-btn");
    CREDIT_BTN.addEventListener("mouseover", (event) => {
      //playAudio(AUDIO.hoverEffect);
    });
    let isTyepo = false;
    CREDIT_BTN.addEventListener("click", (event) => {
      //playAudio(AUDIO.clickEffect);
      const FIRST_SCREEN = document.getElementById("first-screen");
      const ROOT = document.getElementById("root");
      const CREDIT = document.getElementById("credit");
      const PrincipalLogo = document.getElementById("navbar");

      if (!isTyepo) {
        typeEffect();
        isTyepo = true;
      }

      
      FIRST_SCREEN.classList.add("fade-out");
      setTimeout(() => {
        try {
          ROOT.style.zIndex = "100";
          ROOT.classList.remove("deactive");
        } catch {}
        FIRST_SCREEN.classList.add("deactive");
        CREDIT.classList.remove("deactive");
        CREDIT.classList.remove("fade-out");
        CREDIT.classList.add("fade-in");
        PrincipalLogo.classList.add("d-none");
      }, 450);
    });

    //agregar primera pantalla
    DOT_ITEM_LIST = ["munity", "ntf", "chat", "soon", "word", "file"];
    dots = {
      munity: {
        id: "munity",
        span: "ENTER",
        title: "MUNITY",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__comunication.png",
          import.meta.url
        ).href,
      },
      file: {
        id: "file",
        span: "CIBER",
        title: "PRIVACY & SECURITY",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__sharing.png",
          import.meta.url
        ).href,
      },
      word: {
        id: "word",
        span: "DISCOVER</br> COMMUNITIES",
        title: "CROSS-CHAIN",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__word.png",
          import.meta.url
        ).href,
      },
      ntf: {
        id: "ntf",
        span: "PROOF OF COMMUNITY",
        title: "ACCESS CARD",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__access.png",
          import.meta.url
        ).href,
      },
      chat: {
        id: "chat",
        span: "EVENT",
        title: "COORDINATION",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__chat.png",
          import.meta.url
        ).href,
      },
  
      soon: {
        id: "soon",
        span: "SELF",
        title: "GOVERNANCE",
        link: new URL(
          "../experience/img/dot-icon/dot-icon__soon.png",
          import.meta.url
        ).href,
      },
    };
    /*CREATE DOTS*/

    const bgAudioUrl = new URL("audio/background.ogg", import.meta.url);
    const bgAudio = new Audio(bgAudioUrl.href);

    //cargar paginas
    const scale = 0.03;

    CONTENT_OBJ.scale.set(scale, scale, scale);
    ITEM_3D.setScale(8);
    if (!isOneMobileVertical()) {
      CONTENT_OBJ.position.set(0, 38, 0);
    } else {
      CONTENT_OBJ.position.set(0, 44, 0);
    }

    //console.log(CONTENT_OBJ);
    html.add(CONTENT_OBJ);

    //CREATE INTERNAL ELEMENT

    const CUBE_GRID = document.createElement("div");
    CUBE_GRID.style.height = "500px";
    CUBE_GRID.style.width = "500px";
    CUBE_GRID.style.outline = " solid purple 3px";

    //end zona drag

    // SONIDO
    const activateSound = () => {
      isBgSoundActive = true;
      console.log("ACTIVAR SONIDO");
      //reproducir sonido
      bgAudio.play();
      bgAudio.loop = true;
      bgAudio.volume = 0.2;

      // Desactivar el event listener después de la primera activación
      //document.body.removeEventListener("click", activateSound);
    };
    const expAudioUrl = new URL("audio/explosion.ogg", import.meta.url);
    const expAudio = new Audio(expAudioUrl.href);
    const desactiveteSound = () => {
      isBgSoundActive = false;
      console.log("Desactivar SONIDO");
      //reproducir sonido
      bgAudio.pause();
      expAudio.pause();
      // Desactivar el event listener después de la primera activación
      //document.body.removeEventListener("click", activateSound);
    };

    const activateSoundExplotion = () => {
      isBgSoundActive = true;
      //console.log("ACTIVAR SONIDO EXPLOSION");
      //reproducir sonido
      expAudio.play();
      expAudio.volume = 0.2;

      // Desactivar el event listener después de la primera activación
      //document.body.removeEventListener("click", activateSound);
    };
    //escena de inicio
    const activeScene = (event) => {
      console.log("INICIAR ESCENA");
      isDive = true;
      //solo se valide una vez
      START_BTN.removeEventListener("click", activeScene);

      //activar sonido
      //SE ACTIVA DESPUES DE LA CARGA DE LA PAGINA
      setTimeout(() => {
        const LOAD_SCREEN = document.getElementById("load-screen");
        LOAD_SCREEN.classList.add("no-visible");
        console.log("esconder pantalla");
        //variable global, escea iniciada
        setTimeout(() => {
          isSceneStarted = true;
          if (isBgSoundActive) {
            activateSoundExplotion();
          }
        }, 400);
        const CONTROL_PANEL = document.getElementById("control-panel");
        //CLICK OPTIONS PANEL SOUND
        CONTROL_PANEL.addEventListener("click", (event) => {
          const tName = event.target.tagName;
          if (tName === "SPAN" || tName === "BUTTON") {
            //playAudio(AUDIO.clickEffect, 0.25);
          }
        });
        //HOVER OPTIONS PANEL SOUND
        CONTROL_PANEL.addEventListener("mouseover", (event) => {
          const tName = event.target.tagName;
          //console.log("HOVER", tName)
          if (tName === "BUTTON") {
            //playAudio(AUDIO.hoverEffect);
          }
        });

        const FIRST_SCREEN = document.getElementById("first-screen");
        const FEATURES_BTN = document.getElementById("features-btn");

        const NAVBAR = document.getElementById("navbar");
        const FOOTER = document.getElementById("footer");
        const ROOT = document.getElementById("root");

        setTimeout(() => {
          if (isBgSoundActive) {
            activateSound();
            //ANIMACIONES DE INICIO
            if (VIEWPORT_WIDTH >= 740 && VIEWPORT_WIDTH > VIEWPORT_HEIGH) {
              beginFocusAnim.start();
              beginPositionAnim.start();
            }
          }
          //INICIAR ESCENA

          LOAD_SCREEN.classList.add("deactive");
          FIRST_SCREEN.classList.remove("deactive");
          //
          NAVBAR.classList.remove("deactive");
          FOOTER.classList.remove("deactive"); 
  
          // 
          ROOT.classList.add("dark");

          //nPRIMERA PANTALLA
          //console.log("BOTON LAUNCH APP LISTO");

          FEATURES_BTN.addEventListener("click", (event) => {
            //isDive = true;
            activeMenu = true;
            //INICIAR LA ESCENA
            if (VIEWPORT_WIDTH >= 740 && VIEWPORT_WIDTH > VIEWPORT_HEIGH) {
              idleFocusAnim.start();
              idlePositionAnim.start();
            }

            //

            FIRST_SCREEN_DISABLE = true; // Obtén el elemento padre
            FIRST_SCREEN.classList.add("deactive");
            // Obtén todos los elementos con la clase .element que son descendientes de elementoPadre
            setTimeout(() => {
              const iconos = document
                .getElementById("renderer")
                .querySelectorAll(".element-container");

              // Recorre los elementos y realiza alguna acción
              iconos.forEach((icon) => {
                icon.childNodes[0].classList.remove("not-active");
                icon.childNodes[0].classList.add("active");
                icon.classList.remove("no-blur");
                // Puedes realizar otras acciones con cada elemento aquí
              });
            }, 500);
            //eliminar root
            ROOT.classList.add("deactive");
          });
        }, 3500);
      }, 1000);
    };

    const START_BTN = document.getElementById("start-btn");

    if (!isSceneStarted) {
      //activeScene();
      START_BTN.addEventListener("click", activeScene);
    }

    grupoDotsContainer = new Group();
    for (const key in dots) {
      if (dots.hasOwnProperty(key)) {
        //generar elementos
        const dot = dots[key];
        const elementContainer = document.createElement("div");
        const element = document.createElement("div");
        const img = document.createElement("img");
        const dotTitle = document.createElement("div");
        const span = document.createElement("span");
        const text = document.createElement("h2");

        //configurar propiedades
        element.classList.add("element", "not-active");
        img.srcset = dot.link;
        span.innerHTML = dot.span;
        text.innerHTML = dot.title;

        img.classList.add("icon-item");
        span.classList.add("icon-item");
        text.classList.add("icon-item");

        dotTitle.classList.add("dot-title");

        //agregar al contendor
        dotTitle.appendChild(span);
        dotTitle.appendChild(text);

        //agregar elementos
        element.appendChild(dotTitle);
        element.appendChild(img);

        //agregar navigation menu
        const nav_icon = document.createElement("img");
        nav_icon.srcset = dot.link;
        nav_icon.classList.add("btn-container__icon");

        const iconContianer = document.createElement("div");
        iconContianer.setAttribute("dataset", dot.id);
        iconContianer.classList.add("navigation-menu__btn-container");

        iconContianer.appendChild(nav_icon);
        NAV_MENU_REF.appendChild(iconContianer);
        let actualItem = null;
        let items = null;

        //agregar identificador
        element.setAttribute("data-icon", dot.id);

        elementContainer.addEventListener("pointerdown", handlreClick);
        elementContainer.addEventListener("mouseover", (event) => {
          if (event.target.tagName !== "IMG") return;
          console.log("HOVER", event.target.tagName);
          //playAudio(AUDIO.hoverEffect);
          isHover = true;
          //if (VIEWPORT_WIDTH >= 500) mainSpan.classList.add("visible");
          actualItem = event.target.parentNode;
          actualItem.classList.add("hover");
          items = document.getElementsByClassName("element");
          //iterar cada elemento, esconderlos
          Array.from(items).forEach((element) => {
            if (element === actualItem) return;
            element.classList.remove("active");
            element.classList.add("no-focus");
          });
        });
        elementContainer.addEventListener("mouseout", (event) => {
          //mainSpan.classList.remove("visible");
          if (actualItem) {
            actualItem.classList.remove("hover");
            isHover = false;
            console.log("FUERA HOVER ");
            //iterar cada elemento, esconderlos
            Array.from(items).forEach((element) => {
              if (element === actualItem) return;
              element.classList.add("active");
              element.classList.remove("no-focus");
            });
          }
        });
        elementContainer.classList.add("element-container")
        elementContainer.classList.add("no-blur")
        elementContainer.appendChild(element);

        const header = new CSS3DObject(elementContainer);
        header.hideIcon = ()=>{
          element.classList.add("not-active");
          element.classList.remove("active");
          elementContainer.classList.add("no-blur");
        }
        header.showIcon = ()=>{
          element.classList.remove("not-active");
          element.classList.add("active");
          elementContainer.classList.remove("no-blur");
        }
        const scale = 0.1;

        header.scale.set(scale, scale, scale);
        ///header.position.set(1, 0, 0);
        header.rotation.x = Math.PI / -2;

        grupoDots.add(header);
        domItems.push(header);
      }
    }

    //agregar navigation event
    NAV_MENU_REF.addEventListener("click", navHandleClick);
    NAV_MENU_REF.addEventListener("mouseover", (event) => {
      const tName = event.target.tagName;
      if (tName === "IMG") {
        //playAudio(AUDIO.hoverEffect);
      }
    });
    /*END CREATE DOTS*/

    //configurar centro
    grupoDots.position.set(0, 0, -12);
    //grupoDotsContainer.position.set(0, 0, 0);
    grupoDotsContainer.add(grupoDots);
    //grupoDotsContainer.add(axisHelper);

    /*
  const tempDiv = document.createElement("div");
  tempDiv.appendChild(CUBE_GRID);
  const temp = new CSS3DObject(tempDiv);
  temp.position.set(0, 15, 0);
  grupoDotsContainer.add(temp);

  */

    grupoDotsContainer.rotation.x = Math.PI / 2;
    DOT_CONTAINER.add(grupoDotsContainer);
    html.add(DOT_CONTAINER);

    CAM_MANAGER.displayA = domItems;
    //

    // html.add(displayBContainer);

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
    let radio = 0;
    if (!isOneMobileVertical()) {
      radio = 30;
    } else {
      holoSphere.lightIntensity = 0.25;
      radio = 36;
    }

    let center = new Vector3();

    center.set(0, 10, 0); // Vector3 que representa el centro

    for (let index = 0; index < domItems.length; index++) {
      const angle = (Math.PI * 2 * index) / domItems.length; // Calcular el ángulo para esta iteración
      const x = radio * Math.sin(angle - 2.63);
      const z = radio * Math.cos(angle - 2.63);

      const position = new Vector3(x, 0, z);
      position.add(center); // Sumar el vector del centro para obtener la posición final

      domItems[index].position.copy(position);
      //domItems[index].rotation.x = Math.PI /-1.5
    }
 
    domItems[2].position.x = domItems[0].position.x + 0.5;
    domItems[3].position.x = domItems[5].position.x - 0.6;


    //SONIDO

    const SPAN_SOUND = document.getElementById("sound-btn__span");
    const BTN_NO_SOUND = document.getElementById("no-audio-btn");

    //aux soudn btn
    // const SPAN_SOUND_nav = document.getElementById("sound-btn__span-nav");

    if (isOneMobileVertical()) {
      BTN_SOUND_nav.addEventListener("mouseover", () => {
        //playAudio(AUDIO.hoverEffect);
      });

      BTN_SOUND_nav.addEventListener("click", () => {
        //playAudio(AUDIO.clickEffect);

        if (toggleSound) {
          console.log("ACTIVR SONIDO");
          BTN_SOUND_nav.classList.toggle("off");

          activateSound();
        } else {
          console.log("DESACTIVAR SONIDO");
          toggleSound = !toggleSound;
          BTN_SOUND_nav.classList.add("off");
          desactiveteSound();
        }
      });
    }

    BTN_NO_SOUND.addEventListener("click", () => {
      desactiveteSound();
      activeScene();
    });

    //activar desactivar sonido
    BTN_SOUND.addEventListener("mouseover", () => {
      //playAudio(AUDIO.hoverEffect);
    });

    BTN_SOUND.addEventListener("click", () => {
      //playAudio(AUDIO.clickEffect);

      if (toggleSound) {
        console.log("ACTIVR SONIDO");
        if (BTN_SOUND.classList.contains("footer--sound-btn_off"))
          BTN_SOUND.classList.remove("footer--sound-btn_off");
        toggleSound = !toggleSound;
        activateSound();
      } else {
        console.log("DESACTIVAR SONIDO");
        toggleSound = !toggleSound;
        BTN_SOUND.classList.add("footer--sound-btn_off");
        desactiveteSound();
      }
    });
    //end
  });

  //animacion de particulas de relleno
  function bgParticlesAnimation(geometry, time, obj, delta) {
    const oldPositions = geometry.attributes.position.array;

    for (let i = 0; i < oldPositions.length; i++) {
      const i3 = i * 3;

      let circle = Math.PI * 2;
      const angle = (circle / oldPositions.length) * 3 * i;
      const tang = Math.tan(angle * 5 + time) * 1.5;
      const waves = 0.35 * Math.sin(angle * 5 + tang) + 4.5;
      let xEquat = 0,
        yEquat = 0,
        zEquat = 0;

      if (time > 0) {
        xEquat = Math.sin(waves + angle + time * 2) * (30 + time * 0.7);
        zEquat = Math.cos(waves + angle + time * 2) * (30 + time * 0.7);
        yEquat = tang;
      }
      if (time > 3) {
        xEquat = obj.arrayFrames.final[i3];
        zEquat = obj.arrayFrames.final[i3 + 2];
        yEquat = obj.arrayFrames.final[i3 + 1];
      }

      let x, y, z;
      let xOld, yOld, zOld;

      x = xEquat;
      z = zEquat;
      y = yEquat;

      xOld = geometry.attributes.position.array[i3];
      yOld = geometry.attributes.position.array[i3 + 1];
      zOld = geometry.attributes.position.array[i3 + 2];

      const animIntensity = 1 * delta;

      geometry.attributes.position.array[i3] += (x - xOld) * animIntensity; //X
      geometry.attributes.position.array[i3 + 2] += (z - zOld) * animIntensity; //Z
      geometry.attributes.position.array[i3 + 1] += (y - yOld) * animIntensity; //Y
    }

    geometry.attributes.position.needsUpdate = true;
  }

  function previewAnim(geometry, time, obj, delta) {
    const oldPositions = geometry.attributes.position.array;

    for (let i = 0; i < oldPositions.length; i++) {
      const i3 = i * 3;

      let circle = Math.PI * 2;
      const angle = (circle / oldPositions.length) * 3 * i;
      const tang = Math.tan(angle * 5 + time) * 1.5;
      const waves = 0.35 * Math.sin(angle * 5 + tang) + 4.5;
      let xEquat = 0,
        yEquat = 0,
        zEquat = 0;

      if (time > 0) {
        xEquat = Math.sin(waves + angle + time * 2) * (30 + time * 0.7);
        zEquat = Math.cos(waves + angle + time * 2) * (30 + time * 0.7);
        yEquat = tang;
      }
      if (time > 3) {
        xEquat = obj.resetPos[i3];
        zEquat = obj.resetPos[i3 + 2];
        yEquat = obj.resetPos[i3 + 1];
      }

      let x, y, z;
      let xOld, yOld, zOld;

      x = xEquat;
      z = zEquat;
      y = yEquat;

      xOld = geometry.attributes.position.array[i3];
      yOld = geometry.attributes.position.array[i3 + 1];
      zOld = geometry.attributes.position.array[i3 + 2];

      const animIntensity = 0.005 * delta;

      geometry.attributes.position.array[i3] += (x - xOld) * animIntensity; //X
      geometry.attributes.position.array[i3 + 2] += (z - zOld) * animIntensity; //Z
      geometry.attributes.position.array[i3 + 1] += (y - yOld) * animIntensity; //Y
    }

    geometry.attributes.position.needsUpdate = true;
  }

  //animacion de la galaxia de inicio
  function galaxyBeginAnimation(geometry, time) {
    const positions = geometry.attributes.position.array;
    const count = galaxyCout;
    let amount = 0,
      i3 = 0;

    const props = {
      arrayColors: colors,
      area: 1.5,
      divisiones: 20,
      twoPI: Math.PI * 2,
      ringFrecuency: 7,
      speedAnim: 2,
    };

    //anima las particulas en el tiempo
    for (let ringIndex = 20; ringIndex > 0; ringIndex--) {
      const yAxis = Math.cos(time * 0.5 + ringIndex) + Math.sin(time * 2);
      const ringAmount = (count / props.divisiones) * ringIndex;

      //recorre los puntos
      for (let index = 0; index < ringAmount; index++) {
        i3 = (amount + index) * 3;

        let x, y, z;

        let xOld = positions[i3];
        let yOld = positions[i3 + 1];
        let zOld = positions[i3 + 2];

        //nueva posicion
        const angle = ((props.twoPI * yAxis) / ringAmount) * index;
        const tang = Math.tan(angle * 5 + time) * 1.5;
        const radius = 18;

        //calculos
        const smooth = 1;
        const intensity = 0.1;
        const angleAnim = index * intensity + time + yAxis;
        const wavesAnim = Math.sin(time - index * props.ringFrecuency);
        const sinAnimation = Math.sin(
          index + ringIndex + time * props.speedAnim
        );

        //formulas de aniamcion
        const wavesEquad = smooth + intensity * wavesAnim - yAxis * 2.5;
        const xEquat =
          Math.cos(angleAnim) *
          (smooth + intensity * sinAnimation) *
          wavesEquad;
        const zEquat =
          Math.sin(angleAnim) *
          (smooth + intensity * sinAnimation) *
          wavesEquad;

        //ajustar area
        y = tang;
        x = xEquat * props.area * radius;
        z = zEquat * props.area * radius;

        //tiempo de la animacion
        if (time >= 2.8) {
          x = G_ARRAY[i3];
          z = G_ARRAY[i3 + 2];
          y = G_ARRAY[i3 + 1];
        }

        const animIntensity = 0.015;
        //asignar position despues de cada bucle
        geometry.attributes.position.array[i3] += (x - xOld) * animIntensity; //X
        geometry.attributes.position.array[i3 + 1] +=
          (y - yOld) * animIntensity; //Y
        geometry.attributes.position.array[i3 + 2] +=
          (z - zOld) * animIntensity; //Z
      }

      amount += ringAmount;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  //DETECATAR SCROLL
  let IS_SCROLLING = false;
  let SCROLLING = 0;
  let COUTN_SCROLL = 0;
  // Función para manejar el evento de rueda (scroll)
  function handleScroll(event) {
    //console.log("SCROLLING");

    IS_SCROLLING = true;

    // Obtener la cantidad de desplazamiento horizontal
    let delta = Math.sign(event.deltaY);

    if (IS_SCROLLING) {
      if (isOneMobileVertical()) {
        delta *= 10;
        console.log("scroll movil");
      }

      SCROLLING = delta;
      COUTN_SCROLL += delta;
      //console.log(IS_SCROLLING, "<<<", COUTN_SCROLL);
    } else {
      COUTN_SCROLL = 0;
      //console.log(IS_SCROLLING, "RESET", COUTN_SCROLL);
    }
  }
  ////

  function selectNewPage() {
    const id = PAGE_LOADER_MANAGER.getCurrentId();
    const count = DOT_ITEM_LIST.length;
    //buscar el indice actual
    for (let index = 0; index < count; index++) {
      const idPage = DOT_ITEM_LIST[index];
      let nextPage = DOT_ITEM_LIST[index + 1];
      //console.log("BUSCAR NEW DOT");

      if (idPage === id) {
        if (!nextPage) {
          nextPage = DOT_ITEM_LIST[0];
        }
        /*console.log(
        "ID ENCONTRADO",
        idPage,
        "  INDICE: ",
        index,
        "NUEVO ID: ",
        nextPage
      );
      */
        return nextPage;
      }
    }
  }
  function travelWithScroll(count) {
    const limit = 30;

    if (count >= limit) {
      COUTN_SCROLL = 0;
      //console.log("RESET")
      PAGE_LOADER_MANAGER.hideElement();
      const newPage = selectNewPage();

      PAGE_LOADER_MANAGER.loadPage(newPage);

      //PREVIEW CONS CROL
      ITEM_3D.changeModel(newPage, 2.5);
    } else if (count <= -limit) {
      COUTN_SCROLL = 0;
      //console.log("RESET")
      PAGE_LOADER_MANAGER.hideElement();
      const newPage = selectNewPage();

      PAGE_LOADER_MANAGER.loadPage(newPage);
      ITEM_3D.changeModel(newPage, 2.5);
    }
  }

  // Agregar el evento de rueda al documento
  document.addEventListener("wheel", handleScroll);

  //END SCROLL
  let isMainPage = true;
  const clock = new Clock();
  let time = 0;
  let sphereClock = {time:0};
  let sphereAnim = animateValue(sphereClock, "time", 4.2, 3100 );
  let opacityDelta = 0.65;
  let speedDelta = 1.8;
  let speedDeltaBack = 0.3;
  let animOpacity = animateValue()

  let animEnded = false;
  let camPoint = new Vector3();
  let angular = 0;
  CAM_MANAGER.isDisplayA = true;

  let resetTimer = false;
  let setSpecialUpdate= true;
  //ANIMACIONES
  webManager.setAnimations((delta, fixed) => {
    //PAGINA ESTA CARGADA
    //stats.begin();

    if (!isSceneStarted) return;
    //animaciones de inicio
    if(isDive){
      sphereAnim.start();
      isDive = false;
    }
    if (time >= 11){
      animEnded = true;
    }
    else time = clock.getElapsedTime();

    if (animEnded) ITEM_3D.update(fixed, galaxyParticles._mousePos, 1.0);
    if (!animEnded && isSceneStarted) {
      //actualizar animaciones de la escena [PRIMERA VEZ]
      CAM_MANAGER.camera.lookAt(target);
      galaxyBeginAnimation(galaxyParticles.geometry, time * 0.9);
      previewAnim(ITEM_3D.geometry, time, ITEM_3D, delta);
      bgParticlesAnimation(
        backgroundParticles.geometry,
        time,
        backgroundParticles,
        fixed
      );
    }


    //#endregion

    CAM_MANAGER.camera.getWorldPosition(camPoint);

    //detecta cuando esta viajando o no
    if (isTravelling || isTravellingBack) {
      //VIAJANDO
      CONTENT_OBJ.lookAt(camPoint);
    } else {
      //ESTACIONARIO
      if (!isSecondScreen) {
        CAM_MANAGER.motion = MOTION;
        //controla la opacidad
        if (!disable) {
          if (isHover && opacityDelta >= 0.15) {
            opacityDelta -= fixed * speedDelta;
            //console.log("encendido", opacityDelta);
            galaxyParticles.isHover = opacityDelta;
          } else if (!isHover && opacityDelta <= 0.65) {
            opacityDelta += fixed * speedDeltaBack;
            //console.log("apagado", opacityDelta);
            galaxyParticles.isHover = opacityDelta;
          }
        }
        angular = Math.sin(delta);
        if(activeMenu){
        }
        DOT_CONTAINER.position.y = angular;
        DOT_CONTAINER.lookAt(camPoint);
        holoSphere.position.y += (angular + 16 - holoSphere.position.y) * 0.3;
      }
      //SEGUNDA PANTALLA
      else {
        CONTENT_OBJ.lookAt(camPoint);
        if (isPageActive && IS_SCROLLING) {
          console.log("mover");
          travelWithScroll(COUTN_SCROLL);
          CAM_MANAGER.setRotationCamera(SCROLLING);
          IS_SCROLLING = false;
        } else {
          CAM_MANAGER.setRotationCamera(SCROLLING, false);
        }
      }
      CAM_MANAGER.orbitControls.update();
    }
    TWEEN.update();
    holoSphere.update();
    CAM_MANAGER.update();
    CAM_MANAGER.camera.lookAt(target);
    galaxyParticles.update(delta, particleProps, fixed);

    if(setSpecialUpdate && CAM_MANAGER.orbitControls != null){
      setSpecialUpdate = false;
      console.log("cargado")
      CAM_MANAGER.orbitControls.addEventListener('change', ()=>{
        console.log("Listo");
        CAM_MANAGER.camera.getWorldPosition(camPoint);
        DOT_CONTAINER.lookAt(camPoint);
      })
    }
    //MEDICIONES
    //stats.end();
  });



  //FUNCIONES DE  TWEEN JS

sphereAnim.onUpdate(()=>{
  console.log(sphereClock)
  holoSphere.minDistance = sphereClock.time;
})
  //animacion finalizo
  viewAnim.onComplete(() => {
    console.log("VIAJE COMPLETO");
    const defaulPolarAngle = CAM_MANAGER.orbitControls.getPolarAngle();
    console.log(defaulPolarAngle, "SEGUNDA PANTALLA");
    CAM_MANAGER.orbitControls.maxPolarAngle = defaulPolarAngle;
    CAM_MANAGER.orbitControls.minPolarAngle = defaulPolarAngle;
    isMainPage = false;
    isTravelling = false;
    isContenPage = true;
    ITEM_3D.changeModel(loadPreview, 1.8);
  });
  viewAnim.onUpdate(() => {
    //const defaulPolarAngle =CAM_MANAGER.orbitControls.getPolarAngle();
    //console.log(defaulPolarAngle, "SEGUNDA PANTALLA")
    //CAM_MANAGER.orbitControls.maxPolarAngle = defaulPolarAngle;
    //CAM_MANAGER.orbitControls.minPolarAngle = defaulPolarAngle;
    CAM_MANAGER.orbitControls.update();
  });

  //animar regreso
  screenAnimBack.onComplete(() => {
    const defaulPolarAngle = CAM_MANAGER.orbitControls.getPolarAngle();
    console.log(defaulPolarAngle, "PRIMERA PANTALLA");
    if (VIEWPORT_WIDTH > 500) {
      CAM_MANAGER.orbitControls.maxPolarAngle = 1;
    } else {
      CAM_MANAGER.orbitControls.maxPolarAngle = defaulPolarAngle * 2.2;
    }
    CAM_MANAGER.orbitControls.minPolarAngle = defaulPolarAngle * 0.8;
    shoIcons();
    loadFooterText();

    CAM_MANAGER.parallax = true;
    isSecondScreen = false;
    ITEM_3D.ignoreMouse=false;
    //galaxyParticles.ignoreMouse=false;
    isTravellingBack = false;
    CAM_MANAGER.isDisplayA = true;
    FOOTER_TEXT.classList.remove("deactive");
    NAV_MENU_REF.classList.add("deactive");
    NAV_MENU_REF.classList.remove("fade'in");

    //END MOSTRAR ICONOS
  });

  //renderizar en el bucle
  CAM_MANAGER.activeOrbit();
  webManager.renderLoop();
  webManager.postProcesing = true;

  //funciones de ayuda

  function animatePosition(
    objeto,
    nuevaPosicion,
    tiempoAnimacion,
    ease = TWEEN.Easing.Quadratic.InOut
  ) {
    // Creamos una nueva instancia de Tween para animar la posición
    const tween = new TWEEN.Tween(objeto)
      .to(nuevaPosicion, tiempoAnimacion)
      .easing(ease);

    //tween.start();
    // Retorna el objeto de animación para control externo
    return tween;
  }
  function shoIcons() {
    domItems.forEach((element) => {
      const item = element.element.getElementsByClassName("element")[0];
      item.classList.add("active");
      item.classList.remove("desactive");
      item.classList.remove("not-active");
      item.parentNode.classList.remove("not-active")
    });
  }
  function hideIcons() {
    console.log("Hide Actual Icons");
    domItems.forEach((element) => {
      const e = element.element.getElementsByClassName("element")[0];
      e.classList.add("not-active");
      e.parentNode.classList.add("not-active")
      e.classList.remove("active");
    });
  }
  function animateValue(
    normal,
    target,
    newValue,
    tiempoAnimacion,
    animMode = TWEEN.Easing.Quadratic.InOut
  ) {
    const tween = new TWEEN.Tween(normal)
      .to({ [target]: newValue }, tiempoAnimacion) // Establecer 'opacity' como propiedad de destino
      .easing(animMode);
    return tween;
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

  //gloch effects
};

function isOneMobileVertical(){
  const VIEWPORT_WIDTH = window.innerWidth;
  const VIEWPORT_HEIGH = window.innerHeight;
  

  if(VIEWPORT_HEIGH > VIEWPORT_WIDTH)
  {
    const factorScale = VIEWPORT_HEIGH  / VIEWPORT_WIDTH;
    if(factorScale >= 1.25)
    {
        return true;
    }
  }

  if(AgentIsMobile)
    return true;


  return false;
}

var agentChecked = false;
var AgentIsMobile = false;
function isMobileDevice() {
  if(agentChecked){

    return AgentIsMobile;

  }else{
    console.log("checking agent!");

    AgentIsMobile = /Mobi|Android/i.test(navigator.userAgent) || isOneMobileVertical();
    agentChecked=true;

    return AgentIsMobile;
  }
   
}

isMobileDevice();