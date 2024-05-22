import { Group, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";

const mouseData = {
  screenWidth:
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth, // Ancho de la pantalla
  screenHeight:
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight, // Alto de la pantalla
  fixedValue: 0.5,
  intensity: 15,
  x: 0, // Última posición X del mouse
  y: 0, // Última posición Y del mouse
  mouse: new Vector2(),
  u_mouse: new Vector2(),
  raycaster: new Raycaster(),
  plane: null,
};

let ORBIT_CONTROLS_REF = null;
export class CameraManager {
  constructor(camera) {
    //componentes del modulo
    this.camera = camera; // referenccia de la camara
    this.container = new Group(); //contenedor de la camara
    this.distance = 8;
    this.domElement = null;
    this.orbitControls = null;
    this.normalizedMouse = new Vector3();
    this.mouseData = mouseData;
    this.raycaster = new Raycaster();
    this.plane = null;
    this.isPlane = false;
    this.isDisplayB = false;
    this.isDisplayA = true;
    this.displayB = null;
    this.displayA = null;
    this.motion = null;
    this.parallax = true;
    this.isMobile = null;
    this.lastScroll = 0;
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      console.log("Estás usando un dispositivo móvil!!");
      this.isMobile = true;
    } else {
      console.log("No estás usando un móvil");
      this.isMobile = false;

    }

    // this.rendererManager = new RENDER_MANAGER();
    //inicializar camara

    this.init();
  }
  //configurar valores por defecto para esta camara
  init() {
    //posicion dentro del contenedor por defecto
    this.camera.position.set(0, 0, 1);
    //agregar la camara al contenedor
    this.container.add(this.camera);
    //posicion del contenedor por defecto
    this.container.position.set(0, 0, 0);
  }


  activeOrbit() {
    this.orbitControls = new OrbitControls(this.container, this.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = false;
    this.orbitControls.rotateSpeed = 0.2;
    this.orbitControls.dampingFactor = 0.025;
    
    const defaulPolarAngle =this.orbitControls.getPolarAngle();
    console.log(defaulPolarAngle, "DEFAULT")
    this.orbitControls.maxPolarAngle =1.2;
    this.orbitControls.minPolarAngle = defaulPolarAngle * 0.7;
    /*
    if (window.innerWidth <= 500) {
      this.orbitControls.target.set(0, -100, 0);
    }
    */

    //activar evento
    this.orbitControls.addEventListener("start", () => {
      console.log("Esconder")

     // const cortinas = document.getElementById("cortain").children;
     // for (const cortina of cortinas) {
     //   cortina.classList.add("active-cortain");
     // }
      if (this.isDisplayA) {

        this.displayA.forEach((item) => {
          item.hideIcon();
        });
      }
    });

    //desactivar evento
    this.orbitControls.addEventListener("end", () => {
      //console.log("ESCONDER")
      //const cortinas = document.getElementById("cortain").children;
      //for (const cortina of cortinas) {
      //  cortina.classList.remove("active-cortain");
      //}

      if (this.isDisplayA) {
        console.log("Mostrar");

        this.displayA.forEach((item) => {
          item.showIcon();
        });
      }
    });
  }

  update() {
    this.normalizedMouse.set(mouseData.x, -mouseData.y, 0);
   // if (this.parallax) this.activeParallax();
  }

  setRotationCamera(scroll, isScroll = true) {
    if (isScroll) {
      console.log("MOVIENDO");

      this.orbitControls.autoRotate = true;
      this.orbitControls.update(scroll * 0.2);
    } else {
      this.orbitControls.autoRotate = false;
    }
  }
  activeParallax() {
    let point = 0;
    if (this.isMobile) point = this.motion;
    else point = this.normalizedMouse;
    this.camera.position.lerp(point, 0.008);
    //console.log(this.camera.position)
  }
}

window.addEventListener("mousemove", (event) => {
  const mouseX = event.clientX; // Posición X actual del mouse
  const mouseY = event.clientY; // Posición Y actual del mouse
  const relativeX = mouseX / mouseData.screenWidth - mouseData.fixedValue;
  const relativeY = mouseY / mouseData.screenHeight - mouseData.fixedValue;

  mouseData.x = relativeX * mouseData.intensity; // Valor normalizado de la posición X
  mouseData.y = relativeY * mouseData.intensity; // Valor normalizado de la posición Y

  mouseData.u_mouse.set(-relativeX * 2, -relativeY * 2);
});
