precision mediump float;
uniform sampler2D tPoint;
uniform float opacityDinamic;
uniform vec3 pColor;

void main() {
  

vec4 tColor = texture2D(tPoint, gl_PointCoord);
 // if(dist > 0.5)discard;

    gl_FragColor =vec4(pColor, 1.0) * tColor *opacityDinamic; // Alpha es 1.0 (opacidad completa)

}
