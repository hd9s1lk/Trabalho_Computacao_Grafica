import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import { Terrain } from './terreno.js';

const gui = new GUI();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );

const terrain = new Terrain(50,50); //largura do mapa
scene.add(terrain);



const sun = new THREE.DirectionalLight();  //exemplo de luz
sun.position.set(1,2,3);
sun.intensity = 3;
scene.add(sun);

const ambient = new THREE.AmbientLight(); //2ºExemplo de lux
ambient.intensity = 0.5;
scene.add(ambient);

scene.fog = new THREE.Fog(0xcccccc, 10,50);


const stats = new Stats()
document.body.appendChild(stats.dom)


camera.position.set(30,2,30);
controls.update();

function animate() {

  controls.update();

  renderer.render( scene, camera );

  stats.update()
}


const Terrainfolder = gui.addFolder('Terrain');
Terrainfolder.add(terrain,'width', 1,50,1).name('Width');
Terrainfolder.add(terrain,'height',1,50,1).name('Height');
Terrainfolder.addColor(terrain.terrain.material,'color').name('Color');
Terrainfolder.onChange(() => {
  terrain.createTerrain();
})