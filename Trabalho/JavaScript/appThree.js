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

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let boneco;
const loader = new GLTFLoader();

loader.load('./models/boneco.glb', function (gltf) {
    boneco = gltf.scene;
    boneco.scale.set(1, 1, 1);
    boneco.position.set(0, 0, 0);
    scene.add(boneco);
}, undefined, function (error) {
    console.error('Erro ao carregar o boneco:', error);
});



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

const teclas = {};
document.addEventListener('keydown', (e) => teclas[e.key] = true);
document.addEventListener('keyup', (e) => teclas[e.key] = false);

function animate() {

  controls.update();

  if (boneco) {
    const velocidade = 0.1;

    if (teclas['w'] || teclas['W']) boneco.position.z -= velocidade;
    if (teclas['s'] || teclas['S']) boneco.position.z += velocidade;
    if (teclas['a'] || teclas['A']) boneco.position.x -= velocidade;
    if (teclas['d'] || teclas['D']) boneco.position.x += velocidade;

  }

  if (boneco) {
    const offset = new THREE.Vector3(0, 5, 10); // Posição da câmara em relação ao boneco
    const bonecoPos = boneco.position.clone();
    const cameraPos = bonecoPos.add(offset);
    camera.position.lerp(cameraPos, 0.1); // Suaviza o movimento da câmara
    camera.lookAt(boneco.position);
  }
  

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