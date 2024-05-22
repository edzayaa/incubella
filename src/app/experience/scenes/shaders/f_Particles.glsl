precision lowp float;

varying vec3 vColor;
varying float vSize;
varying float opacityDinamic;

uniform sampler2D tPoint;


uniform float opacityFactor;


float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float details = pow(dist, 1.0);
      float t = smoothstep(4.0, 15.0, vSize);

    float alpha = mix(0.5, 0.05, t);
  float opacity = opacityDinamic;

  //if (dist > 0.5) discard;

    // Mapa de vSize a un rango de [0, 1] usando smoothstep

    // Combina la intensidad de la iluminación con el valor de ruido para introducir variaciones aleatorias

  if (opacityFactor < 0.6) details *= opacityFactor;
  if(opacityDinamic > 1.0) opacity = 1.0;


  vec4 tColor = texture2D(tPoint, gl_PointCoord);


    gl_FragColor =vec4(vColor,  (alpha + details) * opacityFactor * opacity ) * tColor ; // Alpha es 1.0 (opacidad completa)
}
