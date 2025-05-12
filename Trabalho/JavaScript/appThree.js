import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Terrain } from './terreno.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GUI
const gui = new GUI();

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Cena, Camera e Controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);

// Terreno
const terrain = new Terrain(50, 50);
scene.add(terrain);

// Luzes
const sun = new THREE.DirectionalLight();
sun.position.set(1, 2, 3);
sun.intensity = 3;
scene.add(sun);

const ambient = new THREE.AmbientLight();
ambient.intensity = 0.5;
scene.add(ambient);

// Nevoeiro
scene.fog = new THREE.Fog(0xcccccc, 10, 50);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Variáveis do Boneco
let boneco, mixer, animations = {};
let estadoAtual = 'idle';
let emAcao = false;

let inimigo, mixerInimigo, animationsInimigo = {};
let estadoInimigoAtual = 'idle';
let emAcaoInimigo = false;

let vidaInimigo = 100;
let cooldownHit = false;

let vidaJogador = 100;
let cooldownHitJogador = false;



// Hitboxes
const hitboxJogador = {};
const hitboxInimigo = {};
let mostrarHitboxes = true;
const todasHitboxes = [];

function getTamanhoHitbox(parte) {
    return {
        cabeça: [0.12, 0.18, 0.12],
        tronco: [0.25, 0.8, 0.25],
        bracoE: [0.15, 0.5, 0.15],
        bracoD: [0.15, 0.5, 0.15],
        pernaE: [0.15, 0.65, 0.15],
        pernaD: [0.15, 0.65, 0.15],
    }[parte];
}


// Loader
const loader = new GLTFLoader();

loader.load('./models/ninja.glb', function (gltf) {
    boneco = gltf.scene;
    boneco.scale.set(1, 1, 1);
    boneco.position.set(0, 0, 0);
    scene.add(boneco);

    mixer = new THREE.AnimationMixer(boneco);
    gltf.animations.forEach((clip) => {
        animations[clip.name] = mixer.clipAction(clip);
    });
    if (animations['idle']) animations['idle'].play();

    const bonesDeHitbox = {
        cabeça: 'mixamorigHead',
        tronco: 'mixamorigSpine',
        bracoE: 'mixamorigLeftForeArm',
        bracoD: 'mixamorigRightForeArm',
        pernaE: 'mixamorigLeftLeg',
        pernaD: 'mixamorigRightLeg'
    };

    const materialHitbox = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    boneco.traverse((obj) => {
        if (obj.isBone && bonesDeHitbox) {
            for (const [parte, nomeBone] of Object.entries(bonesDeHitbox)) {
                if (obj.name === nomeBone) {
                    const tamanho = getTamanhoHitbox(parte);
                    const cuboDebug = new THREE.Mesh(new THREE.BoxGeometry(...tamanho), materialHitbox);
                    cuboDebug.name = 'hitbox_' + parte;
                    obj.updateWorldMatrix(true, false);
                    obj.getWorldPosition(cuboDebug.position);
                    cuboDebug.visible = true;

                    scene.add(cuboDebug);
                    hitboxJogador[parte] = cuboDebug;
                    todasHitboxes.push(cuboDebug);
                }
            }
        }
    });

}, undefined, console.error);

// Inimigo
loader.load('./models/creed.glb', function (gltf) {
    inimigo = gltf.scene;
    inimigo.scale.set(1, 1, 1);
    inimigo.position.set(5, 0, 0);
    scene.add(inimigo);

    mixerInimigo = new THREE.AnimationMixer(inimigo);
    gltf.animations.forEach((clip) => {
        animationsInimigo[clip.name] = mixerInimigo.clipAction(clip);
    });

    const idle = animationsInimigo['idle'];
    if (idle) idle.reset().fadeIn(0.2).play();

    const materialHitbox = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const bonesDeHitbox = {
        cabeça: 'mixamorigHead',
        tronco: 'mixamorigSpine',
        bracoE: 'mixamorigLeftForeArm',
        bracoD: 'mixamorigRightForeArm',
        pernaE: 'mixamorigLeftLeg',
        pernaD: 'mixamorigRightLeg'
    };

    inimigo.traverse((obj) => {
    if (obj.isBone) {
        for (const [parte, nomeBone] of Object.entries(bonesDeHitbox)) {
            if (obj.name === nomeBone) {
                const tamanho = getTamanhoHitbox(parte);
                const hitbox = new THREE.Mesh(new THREE.BoxGeometry(...tamanho), materialHitbox);
                hitbox.name = 'hitbox_inimigo_' + parte;
                hitbox.visible = true;

                obj.updateWorldMatrix(true, false);
                obj.getWorldPosition(hitbox.position);
                obj.getWorldQuaternion(hitbox.quaternion);

                scene.add(hitbox);
                hitboxInimigo[parte] = hitbox;
                todasHitboxes.push(hitbox);
            }
        }
    }
});


}, undefined, console.error);

// Clock
const clock = new THREE.Clock();

// Teclas
const teclas = {};
document.addEventListener('keydown', (e) => {
    teclas[e.key] = true;

    if (e.key === '1') iniciarAcao('punch');
    if (e.key === '2') iniciarAcao('elbow');
    if (e.key === '3') iniciarAcao('hammer_kick');
    if (e.key === '4') iniciarAcao('block_head');
    if (e.key === '5') iniciarAcao('hit');
    if (e.key === '6') iniciarAcao('dying');

    if (e.key === 'h' || e.key === 'H') {
        mostrarHitboxes = !mostrarHitboxes;
        todasHitboxes.forEach(hb => hb.visible = mostrarHitboxes);
    }
});
document.addEventListener('keyup', (e) => teclas[e.key] = false);

// Trocar animações
function trocaAnimacao(novoEstado) {
    if (estadoAtual !== novoEstado) {
        if (animations[estadoAtual]) animations[estadoAtual].fadeOut(0.2);
        if (animations[novoEstado]) animations[novoEstado].reset().fadeIn(0.2).play();
        estadoAtual = novoEstado;
    }
}

function iniciarAcao(nomeAcao) {
    if (!animations[nomeAcao] || emAcao) return;

    emAcao = true;
    const acao = animations[nomeAcao];
    acao.reset();
    acao.setLoop(THREE.LoopOnce, 1);
    acao.clampWhenFinished = true;
    trocaAnimacao(nomeAcao);

    mixer.addEventListener('finished', function voltarIdle(event) {
        mixer.removeEventListener('finished', voltarIdle);
        emAcao = false;
        trocaAnimacao('idle');
    });
}

// Atualizar Hitboxes
// Mapeamento comum dos nomes dos bones
const bonesDeHitbox = {
    cabeça: 'mixamorigHead',
    tronco: 'mixamorigSpine',
    bracoE: 'mixamorigLeftForeArm',
    bracoD: 'mixamorigRightForeArm',
    pernaE: 'mixamorigLeftLeg',
    pernaD: 'mixamorigRightLeg'
};

// Atualizar Hitboxes do Jogador
function atualizarHitboxesJogador() {
    for (const [parte, nomeBone] of Object.entries(bonesDeHitbox)) {
        const bone = boneco?.getObjectByName(nomeBone);
        const hitbox = hitboxJogador[parte];
        if (bone && hitbox) {
            bone.updateWorldMatrix(true, false);
            bone.getWorldPosition(hitbox.position);
            bone.getWorldQuaternion(hitbox.quaternion);
        }
    }
}

// Atualizar Hitboxes do Inimigo
function atualizarHitboxesInimigo() {
    for (const [parte, nomeBone] of Object.entries(bonesDeHitbox)) {
        const bone = inimigo?.getObjectByName(nomeBone);
        const hitbox = hitboxInimigo[parte];
        if (bone && hitbox) {
            bone.updateWorldMatrix(true, false);
            bone.getWorldPosition(hitbox.position);
            bone.getWorldQuaternion(hitbox.quaternion);
        }
    }
}


function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function verificarColisao(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

function verificarHitJogadorNoInimigo() {
    if (cooldownHit) return false;

    // Apenas cause dano se estiver numa animação de ataque
    const animacoesDeAtaque = ['punch', 'elbow', 'hammer_kick'];
    if (!animacoesDeAtaque.includes(estadoAtual)) return false;

    // Se o inimigo estiver bloqueando, não recebe dano
    if (estadoInimigoAtual === 'block' || estadoInimigoAtual === 'block_head'){
        mostrarMensagem("BLOCK!");
        return false;
    }

    const ofensivos = ['bracoE', 'bracoD', 'pernaE', 'pernaD'];
    const vulneraveis = ['tronco', 'cabeça'];

    for (const parteAtacante of ofensivos) {
        for (const parteAlvo of vulneraveis) {
            const atacante = hitboxJogador[parteAtacante];
            const alvo = hitboxInimigo[parteAlvo];
            if (atacante && alvo && verificarColisao(atacante, alvo)) {
                vidaInimigo -= 10;
                console.log(`💥 HIT: ${parteAtacante} atingiu ${parteAlvo} ➝ Vida Inimigo: ${vidaInimigo}`);
                alvo.material.color.set(0xff0000);

                cooldownHit = true;
                setTimeout(() => cooldownHit = false, 1500);

                if (vidaInimigo <= 0) {
                    iniciarAcaoInimigo('dying');
                }

                mostrarMensagem("HIT:10");
                return true;
            }
        }
    }
    return false;
}


function mostrarMensagem(msg) {
    const mensagemDiv = document.getElementById('mensagemHitBlock');
    mensagemDiv.innerHTML = msg;
    mensagemDiv.style.visibility = 'visible';
    setTimeout(() => {
        mensagemDiv.style.visibility = 'hidden';
    }, 1000);  // A mensagem desaparece após 1 segundo
}

function verificarHitInimigoNoJogador() {
    if (cooldownHitJogador) return false;

    const animacoesDeAtaqueInimigo = ['punch', 'kick'];
    if (!animacoesDeAtaqueInimigo.includes(estadoInimigoAtual)) return false;

    // Se o jogador estiver bloqueando, não recebe dano
    if (estadoAtual === 'block' || estadoAtual === 'block_head') {
        mostrarMensagem("BLOCK!");
        return false;
    }

    const ofensivos = ['bracoE', 'bracoD', 'pernaE', 'pernaD'];
    const vulneraveis = ['tronco', 'cabeça'];

    for (const parteAtacante of ofensivos) {
        for (const parteAlvo of vulneraveis) {
            const atacante = hitboxInimigo[parteAtacante];
            const alvo = hitboxJogador[parteAlvo];
            if (atacante && alvo && verificarColisao(atacante, alvo)) {
                vidaJogador -= 10;
                console.log(`😵 HIT: Inimigo com ${parteAtacante} no ${parteAlvo} ➝ Vida Jogador: ${vidaJogador}`);
                alvo.material.color.set(0xff0000);

                cooldownHitJogador = true;
                setTimeout(() => cooldownHitJogador = false, 1500);

                if (vidaJogador <= 0) {
                    iniciarAcao('dying');
                }

                    mostrarMensagem("Hit:10")
                return true;
            }
        }
    }
    return false;
}



function animate() {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (mixerInimigo) {
        mixerInimigo.update(delta);
        atualizarInimigo(delta);
    }

    if (boneco) {
        let aAndar = false;

        if (teclas['w'] || teclas['W']) { boneco.position.z -= 0.1; aAndar = true; }
        if (teclas['s'] || teclas['S']) { boneco.position.z += 0.1; aAndar = true; }
        if (teclas['a'] || teclas['A']) { boneco.position.x -= 0.1; aAndar = true; }
        if (teclas['d'] || teclas['D']) { boneco.position.x += 0.1; aAndar = true; }

        if (!emAcao && (estadoAtual === 'idle' || estadoAtual === 'walk')) {
            if (aAndar) trocaAnimacao('walk');
            else trocaAnimacao('idle');
        }

        const offset = new THREE.Vector3(-1, 2, 5);
        const cameraTarget = boneco.position.clone().add(offset);
        camera.position.lerp(cameraTarget, 0.1);
        camera.lookAt(boneco.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    }

    if (boneco) atualizarHitboxesJogador();
    if (inimigo) atualizarHitboxesInimigo();

    if (boneco && inimigo) {
        verificarHitJogadorNoInimigo();
        verificarHitInimigoNoJogador();
        boneco.lookAt(inimigo.position);
    }

    renderer.render(scene, camera);
    stats.update();
    document.getElementById('vidaInimigo').innerText = `Vida Inimigo: ${vidaInimigo}`;
    document.getElementById('vidaJogador').innerText = `Vida Jogador: ${vidaJogador}`;
}

let tempoUltimaAcaoInimigo = 0;
const intervaloEntreAcoes = 2; // segundos

function atualizarInimigo(delta) {
    if (!boneco || !inimigo) return;

    const distancia = boneco.position.distanceTo(inimigo.position);
    tempoUltimaAcaoInimigo += delta;

    if (distancia > 1.5 && !emAcaoInimigo) {
        const direcao = new THREE.Vector3().subVectors(boneco.position, inimigo.position).normalize();
        inimigo.position.add(direcao.multiplyScalar(0.05)); // reduzi um pouco a velocidade
        inimigo.lookAt(boneco.position);

        if (estadoInimigoAtual !== 'walk') trocaAnimacaoInimigo('walk');
    } else if (tempoUltimaAcaoInimigo >= intervaloEntreAcoes && !emAcaoInimigo) {
        const acoes = ['punch', 'kick', 'block'];
        const acaoEscolhida = acoes[Math.floor(Math.random() * acoes.length)];
        iniciarAcaoInimigo(acaoEscolhida);
        tempoUltimaAcaoInimigo = 0;
    }
}


function trocaAnimacaoInimigo(nome) {
    if (!inimigo || !mixerInimigo) return;
    if (estadoInimigoAtual !== nome && animationsInimigo[nome.toLowerCase()]) {
        mixerInimigo.stopAllAction();
        const acao = animationsInimigo[nome.toLowerCase()];
        acao.reset().fadeIn(0.4).play();
        estadoInimigoAtual = nome;
    }
}

function iniciarAcaoInimigo(nome) {
    const acao = animationsInimigo[nome.toLowerCase()];
    if (!acao || emAcaoInimigo) return;

    emAcaoInimigo = true;
    if (animationsInimigo[estadoInimigoAtual]) {
        animationsInimigo[estadoInimigoAtual].fadeOut(0.4);
    }

    acao.reset().setLoop(THREE.LoopOnce, 1);
    acao.clampWhenFinished = true;
    acao.fadeIn(0.2).play();
    estadoInimigoAtual = nome;

    mixerInimigo.addEventListener('finished', function fim() {
        mixerInimigo.removeEventListener('finished', fim);
        emAcaoInimigo = false;
        trocaAnimacaoInimigo('idle');
    });
}



// GUI Terreno
const Terrainfolder = gui.addFolder('Terrain');
Terrainfolder.add(terrain, 'width', 1, 50, 1).name('Width');
Terrainfolder.add(terrain, 'height', 1, 50, 1).name('Height');
Terrainfolder.addColor(terrain.terrain.material, 'color').name('Color');
Terrainfolder.onChange(() => {
    terrain.createTerrain();
});
