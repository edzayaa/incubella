import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  LineBasicMaterial,
  LineSegments,
  Points,
  ShaderMaterial,
  TextureLoader,
  Vector3,
} from "three";

import f_pSphere from '../../scenes/shaders/f_pSphere.glsl'
import v_pSphere from '../../scenes/shaders/v_pSphere.glsl'


class HoloSphere {
  constructor(particleCount, radius) {
    //animate funtion aux
    this.auxVector = new Vector3();

    //valores
    this.radius = radius;
    this.halfRadius = radius / 2;
    this.count = particleCount;
    this.segmentsCount = this.count * this.count;
    this.maxConnections = 7;
    this.lightIntensity = 0.8; //0.8

    this.minDistance = 0; //2.3
    this.particleSpeed = 150;
    //auxiliares
    this.holoSphere = new Group();
    this.holoSphere.name = "HoloSphere";

    //geometria
    this.linesGeometry = new BufferGeometry();
    this.pointsGeometry = new BufferGeometry();

    //materiales
    this.linesMaterial = new LineBasicMaterial({
      color: 0x0dd5fd,
      vertexColors: true,
      blending: AdditiveBlending,
      transparent: true
      });
    this.tLink = new URL("../../img/sphere-point.png", import.meta.url).href;
   //this.loader = 
    this.pointsMaterial = new ShaderMaterial({
      vertexShader: v_pSphere,
      fragmentShader:f_pSphere ,
      uniforms: {
        //agregar el nuevo uniform con lo nuevos colores
        tPoint: {value: new TextureLoader().load(this.tLink)},
        pColor: {value: new Vector3(15/255,213 / 255, 253 / 255 )},
        opacityDinamic: {value: 0}
      },
      depthWrite: false,
      transparent:true
    });

    this.normal = new Vector3(0,0,0);


    //arrays
    this.pointsPosition = new Float32Array(this.count *3);
    this.pointsDataPosition = [];

    this.linesPosition = new Float32Array(this.segmentsCount * 3);
    this.linesColorList = new Float32Array(this.segmentsCount * 3);

    //objetos
    this.linesParticle = null;
    this.pointsParticle = null;

    //propiedades
    this.color = new Color(0x0dd5fd);
    this.position = this.holoSphere.position;
    //this.rotation = this.holoSphere.rotation;

    //crear esfera
    this.setPositions();
    this.setAttributes();
    this.createObjects();

    this.self = this.holoSphere;
  }

  setPositions() {
    for (let i = 0; i < this.count; i++) {


      this.pointsPosition[i * 3] = this.normal.x;
      this.pointsPosition[i * 3 + 1] = this.normal.y;
      this.pointsPosition[i * 3 + 2] = this.normal.z;

      const velocity = new Vector3(
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
        -1 + Math.random() * 2
      );
      velocity.normalize().divideScalar(this.particleSpeed);

      this.pointsDataPosition.push({ velocity: velocity, numConnections: 0 });
    }

    this.pointsGeometry.setDrawRange(0, this.count);
  }

  setAttributes() {
    // Luego, puedes usar particlePositions para configurar la geometría de las partículas
    this.pointsGeometry.setAttribute(
      "position",
      new BufferAttribute(this.pointsPosition, 3).setUsage(DynamicDrawUsage)
    );

    // Luego, puedes usar particlePositions para configurar la geometría de las partículas
    this.linesGeometry.setAttribute(
      "position",
      new BufferAttribute(this.linesPosition, 3).setUsage(DynamicDrawUsage)
    );
    this.linesGeometry.setAttribute(
      "color",
      new BufferAttribute(this.linesColorList, 3).setUsage(DynamicDrawUsage)
    );

    this.linesGeometry.computeBoundingSphere();
    this.linesGeometry.setDrawRange(0, 0);
  }

  createObjects() {
    //agregar
    this.pointsParticle = new Points(this.pointsGeometry, this.pointsMaterial);
    this.linesParticle = new LineSegments(
      this.linesGeometry,
      this.linesMaterial
    );

    this.holoSphere.add(this.pointsParticle);
    this.holoSphere.add(this.linesParticle);
  }

  animate() {
    let _vertexpos = 0;
    let _colorpos = 0;
    let _numConnected = 0;


    for (let i = 0; i < this.count; i++) this.pointsDataPosition[i].numConnections = 0;


    for (let i = 0; i < this.count; i++) {
      const particleData = this.pointsDataPosition[i];

      this.auxVector
        .set(
          this.pointsPosition[i * 3],
          this.pointsPosition[i * 3 + 1],
          this.pointsPosition[i * 3 + 2]
        )
        .add(particleData.velocity)
        .setLength(this.radius);

      this.pointsPosition[i * 3] = this.auxVector.x;
      this.pointsPosition[i * 3 + 1] = this.auxVector.y;
      this.pointsPosition[i * 3 + 2] = this.auxVector.z;

      const x = this.pointsPosition[i * 3];
      const y = this.pointsPosition[i * 3 + 1];
      const z = this.pointsPosition[i * 3 + 2];

      const velocity = this.pointsDataPosition[i].velocity;

      // Verificamos las condiciones y actualizamos las velocidades si es necesario
      if (y < -this.halfRadius || y > this.halfRadius) {
        velocity.y = -velocity.y;
      }

      if (x < -this.halfRadius || x > this.halfRadius) {
        velocity.x = -velocity.x;
      }

      if (z < -this.halfRadius || z > this.halfRadius) {
        velocity.z = -velocity.z;
      }

      if (this.pointsDataPosition.numConnections >= this.maxConnections) continue;
      //actualizar las lineas
      for (let j = i + 1; j < this.count; j++) {
        const pointsDataPositionB = this.pointsDataPosition[j];
        if (pointsDataPositionB.numConnections >= this.maxConnections) continue;


        const i3 = i * 3;
        const j3 = j * 3;

        const dx = this.pointsPosition[i3] - this.pointsPosition[j3];
        const dy = this.pointsPosition[i3 + 1] - this.pointsPosition[j3 + 1];
        const dz = this.pointsPosition[i3 + 2] - this.pointsPosition[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < this.minDistance) {
          this.pointsDataPosition.numConnections++;
          pointsDataPositionB.numConnections++;


          //este valor pertenece a las uniones, Acceder al valor e]
          const alpha = this.lightIntensity - dist / this.minDistance;

          //XYZ I3
          this.linesPosition[_vertexpos++] = this.pointsPosition[i3];
          this.linesPosition[_vertexpos++] = this.pointsPosition[i3 + 1];
          this.linesPosition[_vertexpos++] = this.pointsPosition[i3 + 2];

          //XYZ J3
          this.linesPosition[_vertexpos++] = this.pointsPosition[j3];
          this.linesPosition[_vertexpos++] = this.pointsPosition[j3 + 1];
          this.linesPosition[_vertexpos++] = this.pointsPosition[j3 + 2];

          //RGB
          this.linesColorList[_colorpos++] = alpha + this.color.r;
          this.linesColorList[_colorpos++] = alpha + this.color.g;
          this.linesColorList[_colorpos++] = alpha + this.color.b;

          //RGB
          this.linesColorList[_colorpos++] = alpha + this.color.r;
          this.linesColorList[_colorpos++] = alpha + this.color.g;
          this.linesColorList[_colorpos++] = alpha + this.color.b;

          _numConnected++;
        }
      }
    }

    this.linesGeometry.setDrawRange(0, _numConnected * 2);
    this.linesGeometry.attributes.position.needsUpdate = true;
    this.linesGeometry.attributes.color.needsUpdate = true;

    this.pointsGeometry.attributes.position.needsUpdate = true;
    //rotar
    //this.self.rotation.y = delta *0.05;
  }

  //activa las animaciones
  update(props) {
    this.animate();
  }
}

export { HoloSphere };
