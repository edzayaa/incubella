uniform sampler2D tPoint;
uniform float time;
uniform float isHover;
varying vec3 finalColor;


void main() {


vec4 texture = texture2D(tPoint, gl_PointCoord);

  // Asignamos el color de la partícula al fragmento
  gl_FragColor = vec4(finalColor, 0.75 * isHover) * texture;
}
