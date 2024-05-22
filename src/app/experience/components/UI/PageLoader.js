// Importar datos de las páginas desde el archivo JSON
import pageData from "./content.json";
// Importar Swiper JS
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

let COUNT_INDEX = 0;
let GENERATED_OBJ = {};

class PageLoader {
  constructor() {
    this.currentId = null;
    this.pagesData = pageData.data;
    this.currentPageContent = null;
    this.currentPageId = null;
    this._tempContainer = document.createElement("div");
    this.currentElement = this._tempContainer;

    this.currentPageChild = null;

    this.noDragZone = null;
  }

  // Cargar páginas
  loadPage(id) {
    // Establecer valores de ayuda
    this.currentId = id;
    const currentPageId = id;
    const currentPageContent = this.pagesData[currentPageId];
    let generatedPage = null;
    let generatedRef = null;

    //agregar la referencia generada
    let currentId = GENERATED_OBJ[id];

    if (currentId) {
      console.log("PAGINA YA EXISTE REVELAR>>", id);
      this.revealElement();
      return;
    }

    // Recorrer y crear múltiples páginas si hay más de una
    if (Array.isArray(currentPageContent) && currentPageContent.length > 1) {
      const sliderObject = createSwiper(id);

      currentPageContent.forEach((page) => {
        // Crear la página
        generatedPage = generatePageElements(page, true);
        // Agregar al Swiper
        sliderObject.container.appendChild(generatedPage);
      });

      //asignar elemento creado
      this.currentElement.appendChild(sliderObject.ref);
      generatedRef = sliderObject.ref;
    }
    // Crear página única si no hay más de una
    else {
      try {
        generatedPage = generatePageElements(currentPageContent[0]);
      } catch {
        return;
      }
      generatedRef = generatedPage;

      //agregar contador
      this.currentElement.appendChild(generatedPage);
    }

    GENERATED_OBJ[id] = generatedRef;
    console.log(GENERATED_OBJ);
  }

  //regresa el elemento principal
  getDomElement() {
    return this.currentElement;
  }
  getCurrentId() {
    return this.currentId;
  }

  //
  hideElement() {
    const currentPage = document.getElementById(this.currentId);
    currentPage.classList.add("deactive");
    console.log("ESCONDER PAGINA");
  }

  revealElement() {
    const currentPage = document.getElementById(this.currentId);
    currentPage.classList.remove("deactive");
    console.log("REVELAR PAGINA");
  }

  //carga el swipper element
  loadSwiperScript() {
    const swiper = new Swiper(".mySwiper", {
      modules: [Pagination],
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      },
    });
  }
}

// Funciones auxiliares
// Obtener el tipo de elemento HTML según la clave del objeto literal
function getHtmlElementType(key) {
  switch (key) {
    case "title":
      return "h2";
    case "content":
      return "p";
    case "id":
      return "id";
    default:
      return "div";
  }
}

// Asignar la clase según la clave del objeto literal
function getHtmlElementClass(key) {
  switch (key) {
    case "title":
      return "content-page__title";
    case "content":
      return "content-page__text";
    default:
      return "content-page__default";
  }
}

// Generar elementos HTML de la página
function generatePageElements(data, isSlider = false) {
  const keys = Object.keys(data);
  const containerId = data.id;

  // Crear el contenedor principal
  const pageContainer = document.createElement("div");
  if (isSlider) pageContainer.classList.add("swiper-slide");

  pageContainer.id = containerId;

  // Recorrer las claves del objeto
  for (let index = 0; index < keys.length; index++) {
    const currentKey = keys[index];
    const elementType = getHtmlElementType(currentKey);
    const elementClass = getHtmlElementClass(currentKey);
    const elementContent = data[currentKey];

    let htmlElement;

    // Crear elemento HTML, excluyendo la clave "id"
    if (currentKey !== "id") {
      htmlElement = document.createElement(elementType);
      htmlElement.classList.add(elementClass);
      htmlElement.innerHTML = elementContent;
    } else {
      continue;
    }

    // Agregar al contenedor principal
    pageContainer.classList.add("fade-in", "content-page");

    pageContainer.appendChild(htmlElement);
  }

  const launchId = document.createElement("div");
  const iContent = `<span class="intro-btn__text">Launch</span>
  <div class="intro-btn__icon" />`;
  launchId.innerHTML = iContent;
  launchId.classList.add("control-panel__intro-btn", "control-panel__intro-btn--launch-app-btn", "padding-extra");
  pageContainer.appendChild(launchId);


  const spanMsg = document.createElement("span");
  spanMsg.innerHTML = "Drag or Scroll to explore";
  spanMsg.classList.add("content-page__span-msg");
  //pageContainer.appendChild(spanMsg);

  // Devolver el elemento generado
  return pageContainer;
}

// Crear un Swiper si es necesario
function createSwiper(id) {
  // Crear elementos
  const swiperContainer = document.createElement("div");
  const wrapper = document.createElement("div");
  const pagination = document.createElement("div");

  // Asignar clases
  swiperContainer.classList.add("swiper", "mySwiper");
  wrapper.classList.add("swiper-wrapper");
  pagination.classList.add("swiper-pagination");

  //agregar id
  swiperContainer.id = id;

  // Construir el componente Swiper
  swiperContainer.appendChild(wrapper);
  swiperContainer.appendChild(pagination);

  return {
    ref: swiperContainer,
    container: wrapper,
  };
}

export default PageLoader;
