uniform float time;
uniform vec2 u_mouse;

attribute float size;

varying vec3 finalColor;
varying float fSize;

void main() {
  finalColor = color;
  fSize = size;

  vec3 newPosition = position;
  vec3 mousePos = vec3(u_mouse.xy, 0.0);

  vec3 seg = position - mousePos;
  vec3 dir = normalize(seg);
  float dist = length(seg);
  if(dist < 2.) {
    float force = clamp(0.001 / (dist * dist), 0., 12.0);
    newPosition += dir * force;
  }

  // Movimiento en el eje x y z con ruido
  //newPosition.x += sin(time) * (newPosition.x * 1.1)

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.35);
  gl_PointSize = fSize; // Tamaño de las partículas (puedes ajustarlo)
}
