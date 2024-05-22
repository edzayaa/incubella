precision lowp float;

uniform sampler2D tPoint;

varying  vec3 vColor;
varying  float vSize;

void main() {
  // Calculamos la coordenada relativa al centro del fragmento
   vec2 coord = gl_PointCoord - vec2(0.5);
  // Calculamos la distancia del fragmento al centro del círculo
   float dist = length(coord);

  // Ajustes de partículas
   float alpha = 0.15;


  vec4 tColor = texture2D(tPoint, gl_PointCoord);


  // Calculamos el brillo de la partícula
  // Calculamos el color final de la partícula con el brillo
  // Si vSize es menor que 8.0, ajustamos alpha
  if (vSize < 8.0) {
    alpha = 2.0;
    
  }

   float details = pow(dist, 0.5);

   vec3 finalColor = vColor * 0.3;

  // Asignamos el color de la partícula al fragmento
  gl_FragColor = vec4(finalColor, alpha + details) * tColor;
}
