import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Object3D,
  Points,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import v_Particles from "../../scenes/shaders/v_default.glsl";
import f_Particles from "../../scenes/shaders/f_default.glsl";

import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

const modelList = {
  ntf: new URL("../../model/ntf.glb", import.meta.url),
  chat: new URL("../../model/chat.glb", import.meta.url),
  word: new URL("../../model/word.glb", import.meta.url),
  file: new URL("../../model/file.glb", import.meta.url),
  munity: new URL("../../model/munity.glb", import.meta.url),
  soon: new URL("../../model/soon.glb", import.meta.url)
};

export class Item3D {
  constructor(particleCount, colors) {
    this.colors = colors;
    this.particleCount = particleCount;
    this.pointsPosition = [];
    this.colorList = [];
    this.sizelist = [];
    this.geometry = new BufferGeometry();
    this.self = null;
    this.shaderMaterial = null;
    this.ignoreMouse = false;

    this.speed = 0.5;
    this.createParticles(particleCount);

    this.allLoaded = false;
    this.IsDeviceMobile = false;

    if(window.innerHeight > window.innerWidth)
      {
        const factorScale = window.innerHeight  / window.innerWidth;
        if(factorScale >= 1.25)
        {
          this.IsDeviceMobile = true;
        }
      }

    if (!this.IsDeviceMobile) {
      this.self.position.set(0, 54, 0);
    }
    else{
      this.self.position.set(0, 58, 0);
    }
    this.scale = 5;
    this.self.scale.set(this.scale, this.scale, this.scale);

    this.sampler = null;
    this.loadedModels = {};

    //modelos
    this.particles = this.geometry.attributes.position.array;
    this.loadedNewPos = {};
    this.resetPos = this.particles.slice();
    this.count = 0;
    this.loadModel();

    this.actualId = false;
  }

  setScale(scale){
    this.self.scale.set(scale, scale, scale);
  }
  createParticles(count) {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * (80 *  Math.random());
      const y = (Math.random() - 0.5) * (80 *  Math.random());
      const z = (Math.random() - 0.5) * (80 *  Math.random());

      //asginar un color de la lista
      const cIndex = i % this.colors.length;
      const c = new Color(this.colors[cIndex]);
      this.colorList.push(c.r, c.g, c.b);

      //agregar tamano aleatorio
      const sA = Math.random() * (i % 10 * Math.random());
      this.sizelist.push(Math.max(sA, 2.5 + Math.random() *1.5));

      this.pointsPosition.push(x, y, z);
    }

    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.pointsPosition, 3)
    );
    this.geometry.setAttribute(
      "color",
      new Float32BufferAttribute(this.colorList, 3)
    );
    this.geometry.setAttribute(
      "size",
      new Float32BufferAttribute(this.sizelist, 1)
    );
    const tLink = new URL("../../img/sphere-point.png", import.meta.url).href;

    this.shaderMaterial = new ShaderMaterial({
      vertexShader: v_Particles,
      fragmentShader: f_Particles,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        opacityFactor: { value: 0 },
        u_mouse: { value: new Vector2(0, 0) },
        tPoint: { value: new TextureLoader().load(tLink) },
        isHover: {value: 0}
      },
    });

    this.self = new Points(this.geometry, this.shaderMaterial);
  }

  loadModel() {
    const newTempPosArray = {};

    const cargarModelosAsync = async () => {
      const promises = Object.keys(modelList).map((key) =>
        this.cargarModeloPromise(modelList[key].href)
      );

      try {
        this.loadedModels = await Promise.all(promises);

        // Ahora puedes realizar operaciones después de que todos los modelos se han cargado
        // porque este código se ejecuta después de que Promise.all() se ha resuelto.

        console.log("Carga De Modelos Exitosa");
        return newTempPosArray;
      } catch (error) {
        console.error("Error al cargar modelos:", error);
      }
    };

    cargarModelosAsync();
  }

  cargarModeloPromise(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.load(
        url,
        (gltf) => {
          resolve(gltf);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  loadModeltoParticles(models) {
    let count = 0;
    Object.keys(modelList).forEach((key) => {
      const material = new MeshBasicMaterial({ color: "red" });
      const model = models[count].scene.children[0];
      const scale = 2.8;

      model.scale.set(scale, scale, scale);
      model.material = material;
      model.position.set(0, 46, 0);

      this.actualModel = model;

      this.sampler = new MeshSurfaceSampler(model).build();
      const modelParticles = this.modelToParticles(model);
      this.loadedNewPos[key] = modelParticles;
      count++;
    });

    this.allLoaded = true;
  }

  //ANIMACION DE PUNTOS
  //ANIMACION DE PUNTOS
  modelToParticles(from) {
    const particles = from.geometry;
    const p_count = particles.attributes.position.array.length;
    const particlesPos = new Float32Array(p_count);

    for (let index = 0; index < p_count; index++) {
      const pos = new Vector3();
      this.sampler.sample(pos);

      particlesPos[index * 3] = pos.x;
      particlesPos[index * 3 + 1] = pos.y;
      particlesPos[index * 3 + 2] = pos.z;
    }
    return particlesPos;
  }
  changeModel(id, speed = this.speed) {
    this.actualId = id;
    this.speed = speed;
  }

  update(time, mouse, isHover) {
    this.shaderMaterial.uniforms.isHover.value = isHover;
    this.shaderMaterial.uniforms.isHover.needsUpdate = true;

    if (Object.keys(this.loadedModels).length > 0 && !this.allLoaded) {
      //convertir todos los modelos a puntos
      this.loadModeltoParticles(this.loadedModels);
      this.loadedNewPos["reset"] = this.resetPos;
    }
    if (this.allLoaded) {
      if (this.actualId) {
        const actualModel = this.loadedNewPos[this.actualId];
        const speed = time*this.speed;

        //animar
        for (let index = 0; index < actualModel.length; index++) {
          //nueva posicion
          const x = actualModel[index * 3];
          const y = actualModel[index * 3 + 1];
          const z = actualModel[index * 3 + 2];

          //antigua posicion
          this.particles[index * 3] +=
            (x - this.particles[index * 3]) * speed;
          this.particles[index * 3 + 1] +=
            (y - this.particles[index * 3 + 1]) * speed;
          this.particles[index * 3 + 2] +=
            (z - this.particles[index * 3 + 2]) * speed;
        }
        this.geometry.attributes.position.needsUpdate = true;
        this.shaderMaterial.uniforms.time.value = time;
        this.shaderMaterial.uniforms.time.needsUpdate = true;

        this.shaderMaterial.uniforms.u_mouse.value.x = mouse.x;
        this.shaderMaterial.uniforms.u_mouse.value.y = mouse.y;

        if(this.ignoreMouse)
        {
            this.shaderMaterial.uniforms.u_mouse.value.x = 5000;
            this.shaderMaterial.uniforms.u_mouse.value.y = 5000;
        }

        
        this.shaderMaterial.uniforms.u_mouse.needsUpdate = true;
      }
    }
  }
}
