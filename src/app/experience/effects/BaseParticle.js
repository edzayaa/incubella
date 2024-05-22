import { AdditiveBlending, BufferGeometry, Points, ShaderMaterial, TextureLoader, Vector2 } from "three";

//clase

class BaseParticle {
  constructor(particleCount, isAnimated = false) {
    this.isAnimated = isAnimated;
    //valores
    this.count = particleCount;
    this.relativeCount = this.count * 3;

    //custom shaders
    this.vertex = null;
    this.fragment = null;

    //propiedades
    this.geometry = new BufferGeometry();
    this.arrayPositions = [];
    this.arrayColors = [];
    this.arraySizes = [];
    this.arrayFrames = [];
    this.props = null;

    this.shaderMaterial = null;

    //referencia
    this.self = null;
    this.position = null;
    this.rotation = null;
  }

  init(props) {
    //iniciar propiedades
    this.props = props;

    //crear particulas
    this.setupParticles(
      this.arrayColors,
      this.arrayPositions,
      this.arraySizes,
      this.props,
      this.arrayFrames,
    );


    //asignar las primeras posiciones
    if(this.isAnimated){
      this.arrayPositions = this.arrayFrames.start
    }

        
    this.setAttributes(
      this.arrayColors,
      this.arrayPositions,
      this.arraySizes,
    );

    //this.debug("Posiciones  ", this.arrayPositions);
    //this.debug("Colores", this.arrayColors);
    //this.debug("Tamanos", this.arraySizes);
  }
  //positions and colors
  setupParticles(color, positions, sizes, props) {

  }

  setAttributes(colors, positions, sizes) {
  }

  setupMaterial() {


  const tLink = new URL("../img/sphere-point.png", import.meta.url).href

    this.shaderMaterial = new ShaderMaterial({
      vertexShader: this.vertex,
      fragmentShader: this.fragment,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        opacityFactor: { value: 0 },
        u_mouse: { value: new Vector2(0,0) },
        tPoint: {value: new TextureLoader().load(tLink)},
        isHover:  { value: 0 },
      },
    });

    //console.log("Material is Ready", this.shaderMaterial)
  }
  createObject() {
    this.self = new Points(this.geometry, this.shaderMaterial);
    this.position = this.self.position
    this.rotation = this.self.rotation
  }
  //actualiza valores del material
  update(time, props) {
    this.shaderMaterial.uniforms.time.value = time;

    this.shaderMaterial.uniforms.time.needsUpdate = true;
  }

  //  verificar
  debug(name, item) {
    if (
      typeof item !== "undefined" &&
      item !== null &&
      item !== "" &&
      (typeof item !== "number" || !Number.isNaN(item)) &&
      (typeof item !== "object" || (Array.isArray(item) && item.length > 0))
    ) {
      // Tu código aquí si item pasa todas las comprobaciones
      console.log(name, "\n[FUE CREADO CORRECTAMENTE]");
    } else {
      console.log("Error [", item);
    }
  }
}

export { BaseParticle };
