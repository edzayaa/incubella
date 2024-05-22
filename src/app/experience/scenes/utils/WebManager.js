import { Clock, Scene, TextureLoader, Vector2 } from "three";
import { RenderManager } from "./RendererManager";
import { CameraManager } from "./CameraManager";
import { RenderPass } from "three/examples/jsm/postprocessing/renderpass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";


import * as dat from "dat.gui";

let loop  =null;

let extBoken = null;
let tDepth = null;
export class WebManager {
  constructor(id, camManager) {
    this._id = id;
    this._camera = camManager.camera;
    this._cameraManager = camManager;

    //scenes managers
    this.web3d = new Web3DManager(this._id);
    this.webHtml = new WebHtmlManager(this._id);

    //scenes
    this.web3DScene = this.web3d.scene;
    this.webHtmlScene = this.webHtml.scene;

    //renderer
    this.renderManager = RenderManager;
    this.renderManager._camera = this._camera;
    this.renderManager.initCamera();
    this.clock = new Clock();
    this.deltaTime =0;

    this.animatedFuntion = null;

    this.postProcesing =false;
    this.renderPass = new RenderPass(this.web3DScene, this._camera);
    this.bokem = null;

    this.initPost();

    //agregar camara
    this.initCamera();
    this.renderManager.renderLoop = this;
  }
  initPost() {
    // Crear una instancia del pase de "bloom" y configurarlo
    const bloomPass = new UnrealBloomPass(
      /* threshold */ 0.15, // Ajusta este valor según tus necesidades
      /* strength */ 0.35, // Ajusta este valor según tus necesidades
      /* radius */ 1, // Ajusta este valor según tus necesidades
    );

    //bloomPass.renderTargetResolution = new Vector2(0.5, 0.5); // Reducción de la resolución del render target

    const loader = new TextureLoader();

    const bokehPass = new BokehPass( this.web3DScene, this._camera, {
          focus: 0,
					aperture: 0.5,
					maxblur: 0.01,
    } );
    const texture = new URL("../../img/back-btn.png", import.meta.url).href;
    tDepth = loader.load(texture);
    extBoken = bokehPass;


    

    const outputPass = new OutputPass();
  
    // Agregar el pase de "bloom" al compositor de efectos
    this.renderManager.web3DRenderComposer.addPass(this.renderPass);
    this.renderManager.web3DRenderComposer.addPass(bloomPass);
    this.renderManager.web3DRenderComposer.addPass(outputPass);
    //this.renderManager.web3DRenderComposer.autoClear = false; // Desactiva la limpieza automática para permitir renderizados múltiples
    //this.renderManager.web3DRenderComposer.preserveDrawingBuffer = true; // Preserva el búfer de dibujo


  }
  //init camera 
  initCamera(){
    this.web3DScene.add(this._cameraManager.container);
    this._cameraManager.domElement = this.renderManager.domElement;
    console.log("[CAMARA] OK!");
  }
  //configura la escena
  setEnviroment(sceneType, callBack) {
    //inicializar el tipo de escena
    callBack(sceneType);
  }
  
  setAnimations(callBack){
    this.animatedFuntion = callBack;

  }

  //renderizar escena
  renderLoop() {
    //renderizar ambas escenas con el render en un loop

    
    //configurar el loop

   loop = () => {

      requestAnimationFrame(loop);

      if(this.animatedFuntion){
        this.delta = this.clock.getDelta();
        this.deltaTime = this.clock.getElapsedTime();
        this.animatedFuntion(this.deltaTime, this.delta);
      }
      //renderizar el 3d
      if(!this.postProcesing){
        this.renderManager.web3DRenderer.render(
          this.web3DScene,
          this._camera
          );
      }
      else{
        extBoken.uniforms.tDepth = tDepth;
        extBoken.uniforms.tDepth.needsUpdate = true;
        this.renderManager.web3DRenderComposer.render(0.1);
      }
      //renderizar el html en la escena
      this.renderManager.webHtmlRenderer.render(
        this.webHtmlScene,
        this._camera
      );
      
    };

    loop();
  }
  renderOneFrame(){
    console.log("RENDER ONE FRAME");

    //renderizar el 3d
    if(!this.postProcesing){
      this.renderManager.web3DRenderer.render(
        this.web3DScene,
        this._camera
        );
    }
    else{
      this.renderManager.web3DRenderComposer.render(0.1);
    }

  }

  setTimeAnimation(){
    console.log(this.renderManager)
    this.renderManager.web3DRenderer.setAnimationLoop(() => {
      console.log("clock OK!")
      this.deltaTime = this.clock.getDelta();
      callback;
    })
  }

  debugScenes() {
    this.renderManager.debugScenes();
  }
}
class WebSceneManager {
  constructor(id, type, camera) {
    this._id = id;
    this._orbitControls = null;
    this.scene = new Scene();
    this.renderManager = RenderManager;
  }
  debug() {
    console.log("_________________________________\nLayer > [", this._id, "] OK!");
  }
  //inicializar valores generales
  init(type) {
    //genera un identificador
    this._id = this._id + "_" + type;
    //el renderer se configura basado en el tipo
    this.renderManager.initRenderer(type, this.scene);
  }

  //enviar escena a renderizar
  loadToRender() {
    return this.scene;
  }
  add(item) {
    //agreagar el render al dom
    this.scene.add(item);
    console.log("Was Added! >> [", item.type,"]");
  }

}
class Web3DManager extends WebSceneManager {
  constructor(id) {
    super(id);
    this._type = "3D";

    //inicializar 3D
    this.init(this._type);
  }
}
class WebHtmlManager extends WebSceneManager {
  constructor(id,camera) {
    super(id);
    this._camera = camera;
    this._type = "HTML";
    this._orbitControls = null;

    //inicializar HTML
    this.init(this._type);
    
  }
     //hacer uso de orbit o
     useOrbitControls() {
      //activar controles
      console.log("Controls [OrbitControls] listo!");
      this._orbitControls = new OrbitControls(this._camera, this.renderManager.domElement);
    }
}


// Crear una instancia de dat.GUI
const gui = new dat.GUI();

const boken ={
  focus: 0,
  aperture: 0,
  maxblur: 0.1,
}
gui.domElement.style.zIndex = 100;

// Agregar controles para modificar la posición y y z de la cámara
const bokenFolder = gui.addFolder("blur");

function change(){
  extBoken.uniforms[ 'focus' ].value = boken.focus;
  console.log(extBoken.uniforms[ 'focus' ].value)
	extBoken.uniforms[ 'aperture' ].value = boken.aperture * 0.000001;
	extBoken.uniforms[ 'maxblur' ].value = boken.maxblur;
}


bokenFolder
  .add(boken, "focus", -1000, 10000)
  .step(0.0005)
  .name("focus")
  .onChange(() => {
    change();
  });

  bokenFolder
  .add(boken, "aperture", -100, 100)
  .step(0.0001)
  .name("aperture")
  .onChange(() => {
    change();
  });
  bokenFolder
  .add(boken, "maxblur", 0, 0.1)
  .step(0.001)
  .name("maxblur")
  .onChange(() => {
    change();
  });