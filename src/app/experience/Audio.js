export const AUDIO = {
  startScene: new URL("./audio/effects/start.ogg", import.meta.url).href,
  clickEffect: new URL("./audio/effects/click.ogg", import.meta.url).href,
  hoverEffect: new URL("./audio/effects/hover.ogg", import.meta.url).href,
};



// Variable para almacenar el último audio reproducido
let LAST_AUDIO = null;

// Función para reproducir un sonido
export function playAudio(sound, volume = 0.6) {
  // Detener todos los sonidos existentes
  if (LAST_AUDIO) {
    LAST_AUDIO.pause();
    LAST_AUDIO = null;
  }

  // Crear y reproducir el nuevo sonido
  const audio = new Audio(sound);
  audio.volume = volume;

  // Iniciar la reproducción
  audio.play();

  // Almacenar el nuevo audio como el último reproducido
  LAST_AUDIO = audio;

  // Retrasar la limpieza de LAST_AUDIO después de un intervalo corto
  setTimeout(() => {
    LAST_AUDIO = null;
  }, 100);
}
