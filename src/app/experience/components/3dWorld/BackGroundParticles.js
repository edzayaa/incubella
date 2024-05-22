import { BufferAttribute, Color } from "three";
import { BaseParticle } from "../../effects/BaseParticle";

//custom shader
import f_relleno from "../../scenes/shaders/f_relleno.glsl";
import v_relleno from "../../scenes/shaders/v_relleno.glsl";

export class BackGroundParticles extends BaseParticle {
  constructor(particleCount, colors) {
    //
    super(particleCount);
    //agignar custom shader
    this.vertex = v_relleno;
    this.fragment = f_relleno;

    //propiedades
    this.props = {
      area: 2,
      radius: 150,
      arrayColors: colors,
    };
    //asignar propiedades
    this.init(this.props);

    //crear particulas
    this.setupMaterial();
    this.createObject();
  }
  //override
  setupParticles(colors, positions, sizes, props) {
    //confiugra las particulas
    for (let index = 0; index < this.count; index++) {
      //posicionar particulas
      const x = (Math.random() - 0.5) * props.radius * props.area;
      const y = (Math.random() - 0.35) * props.radius;
      const z = (Math.random() - 0.5) * props.radius * props.area;

      //agregar
      //positions.push(y, z, x);
      positions.push(x, y, z);

      //asignar tamanos

      if (index > (this.count * 3) / 5) {
        sizes[index] = Math.random() * ((index % 15) - 1) + 2;
      } else {
        sizes[index] = Math.random() * ((index % 5) - 1) + 2;
      }

      //asignar colores
      const colorIndex = index % props.arrayColors.length;
      const actualColor = props.arrayColors[colorIndex];
      const color = new Color(actualColor);

      colors.push(color.r, color.g, color.b);

      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

  }

  setAttributes() {
    console.log("ATRIBBUTES SOBRECARGADO");
    // Luego, puedes usar particlePositions para configurar la geometría de las partículas
    this.geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(this.arrayPositions), 3)
    );
    //ESCONDER

    this.geometry.setAttribute("color", new BufferAttribute(new Float32Array(this.arrayColors), 3));

    this.geometry.setAttribute(
      "particleSize",
      new BufferAttribute(new Float32Array(this.arraySizes), 1)
    );
  }


}
