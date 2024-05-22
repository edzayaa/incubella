// Función para manejar los eventos de movimiento del dispositivo

import { Vector3 } from "three";
const MOTION = new Vector3();

// Función para manejar los eventos de orientación del dispositivo
function handleDeviceOrientation(event) {
    // Acceder a los datos de orientación
    const alpha = event.alpha; //x
    const gamma = event.gamma; //y
  
    // Hacer algo con los datos de orientación, por ejemplo, imprimir en la consola
    console.log(`Orientación Alpha: ${alpha}, Beta: ${-gamma}`);
    MOTION.set(alpha * 0.5, gamma * 0.5, 0);
  }

function setDeviceMotion() {
  // Verificar si el navegador soporta el evento de DeviceMotion
  if (window.DeviceMotionEvent) {
    // Agregar el evento de movimiento del dispositivo
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  } else {
    console.log("El dispositivo no soporta el evento de DeviceMotion.");
  }
}
export  {MOTION, setDeviceMotion};



/*
EJEMPLO DE UNA FUNCION CALLBACK APRA eVENTO



function definir(callback) {
    // Define la lógica del manejador de eventos
    const inputHandler = (event) => {
        // Aquí puedes acceder a la lógica de tu función flecha
        callback(event);
    };

    // Agrega el manejador de eventos
    window.addEventListener("deviceorientation", inputHandler);

    // Retorna la función para que puedas acceder a ella si es necesario
    return inputHandler;
}

// Definir la lógica dentro de una función flecha
const callbackA = (event) => {
    // Lógica de la función input a
    // Trabaja con otro objeto
    console.log("Callback A:", event.alpha, event.beta, event.gamma);
};

const callbackB = (event) => {
    // Lógica de la función input b
    // Trabaja con diferente lógica
    console.log("Callback B:", event.alpha, event.beta, event.gamma);
};

// Llamada a definir y obtención de las funciones manejadoras
const handlerA = definir(callbackA);
const handlerB = definir(callbackB);

// Puedes usar handlerA y handlerB para acceder a las funciones manejadoras si es necesario

*/


