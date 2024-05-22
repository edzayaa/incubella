// Vertex shader para partículas
precision lowp float;

attribute vec3 color;
attribute float particleSize;

uniform float time;
uniform vec2 u_mouse;
uniform float isHover;

varying vec2 vUv;
varying float vSize;
varying vec3 vColor;
varying float opacityDinamic;
varying float inHover;

float noise1d(float v) {
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

void main() {
  opacityDinamic = 1.0;

  vUv = uv;
  vSize = particleSize;
  vColor = color;

  float animTime = 0.0001;
  vec3 newPosition = position;

  vec3 mousePos = vec3(u_mouse.x, 0.0, u_mouse.y); //LAST POSITION

  vec3 seg = position - mousePos;
  vec3 dir = normalize(seg);
  float dist = length(seg);
  float outSphere = 12.0;

  if(opacityDinamic > 1.0)
    opacityDinamic = 1.0;
  if(time > 5.0) {
    newPosition.x += noise1d(animTime * abs(time) + vSize) * 2.0;
    newPosition.z += noise1d(animTime * abs(time) + vSize) * 2.0;

    if(dist < 20.) {
      float force = clamp(5.0 / dist * dist, outSphere, 5.0);
      newPosition += dir * force;
    } else {
      opacityDinamic = isHover;
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = vSize;
}
