attribute mediump vec3 color;
attribute mediump float particleSize;
uniform mediump float time;

varying mediump float vSize;
varying mediump vec3 vColor;

mediump float noise1d(mediump float v) {
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

void main() {
  vSize = particleSize;
  
  mediump float intensity = 10.5;
  mediump float animTime = 0.07;
  vColor = color;

  // Transforma la posición de la partícula
  mediump float x = position.x;
  mediump float z = position.z;

  vec3 newPosition;
  newPosition.x = x + noise1d(animTime * abs(time) + vSize) * 2.0;
  newPosition.z = z + noise1d(animTime * abs(time) + vSize) * 2.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = vSize  ; // Tamaño de las partículas (puedes ajustarlo)
}
