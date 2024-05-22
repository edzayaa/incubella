import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Size } from "./WindowHandler";

export class DomElement{
    constructor(component){
        //se crea el elemento con el nuevo template
        this._element = new CSS3DObject(component);
        this.elementScale = 1.5;
        this._cameraDistance = 8;
        this._scale =   (this.elementScale/Size.x) * this._cameraDistance;

        //inicializar este objeto
        this.init();
    }

    //init
    init(){
        this._element.scale.set(this._scale, this._scale, this._scale);
        this._element.position.set(0, 0,0);
    }
}