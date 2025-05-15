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
    const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //camara ortografica
    const cameraSize = 5;
    const aspect = window.innerWidth / window.innerHeight;
    const OrthographicCamera = new THREE.OrthographicCamera(
    -cameraSize * aspect,  // left
    cameraSize * aspect,   // right
    cameraSize,            // top
    -cameraSize,           // bottom
    0.5,                   // near
    500                   // far
);
    OrthographicCamera.position.set(0, 100, 0); // Câmera elevada, vista de cima
    OrthographicCamera.lookAt(0, 0, 0); // Aponta para o centro da cena

    let activeCamera = perspectiveCamera;

    
    const controls = new OrbitControls(activeCamera, renderer.domElement);

    document.getElementById("toggleCameraBtn").addEventListener("click", () => {
    if (activeCamera === perspectiveCamera) {
    // Alterna para ortográfica
    activeCamera = OrthographicCamera;
  } else {
    // Alterna para perspetiva
    activeCamera = perspectiveCamera;
  }

  // Atualiza controls (se usares OrbitControls)
  controls.object = activeCamera;
  controls.update();
});

//função para limitar movimento das camaras
function clampCameraPosition(camera, limits) {
  camera.position.x = Math.max(limits.minX + 5, Math.min(limits.maxX, camera.position.x));
  camera.position.z = Math.max(limits.minZ + 5, Math.min(limits.maxZ, camera.position.z));
}


    // Terreno
    const terrain = new Terrain(50, 50);
    scene.add(terrain);
    terrain.terrain.receiveShadow = true;

    scene.background = new THREE.Color(0xadd8e6);

    // Luzes
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(20, 40, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.001; // tenta valores entre -0.0001 e -0.01

    scene.add(sun);
    scene.add(sun.target);

    const ambient = new THREE.AmbientLight(0x404060, 0.7);
    scene.add(ambient);

    const fillLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x99ccff, 0.8);
    rimLight.position.set(-10, 10, -10);
    scene.add(rimLight);

    // Referências às luzes
const directionalLights = [sun, rimLight];
const hemisphereLight = fillLight;
const ambientLight = ambient;

// Estado atual das luzes
let ambientOn = true;
let directionalOn = true;
let hemisphereOn = true;

// Event Listeners para os botões
document.getElementById('toggleAmbient').addEventListener('click', () => {
    ambientOn = !ambientOn;
    ambientLight.visible = ambientOn;
});

document.getElementById('toggleDirectional').addEventListener('click', () => {
    directionalOn = !directionalOn;
    directionalLights.forEach(light => light.visible = directionalOn);
    sunHelper.visible = directionalOn; // Também esconde o helper
});

document.getElementById('toggleHemisphere').addEventListener('click', () => {
    hemisphereOn = !hemisphereOn;
    hemisphereLight.visible = hemisphereOn;
});


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

    window.jogoIniciado = false;



    // Hitboxes
    const hitboxJogador = {};
    const hitboxInimigo = {};
    let mostrarHitboxes = true;
    const todasHitboxes = [];

    function getTamanhoHitbox(parte) {
        return {
            cabeça: [0.12, 0.18, 0.12],
            tronco: [0.25, 0.8, 0.25],
            bracoE: [0.15, 0.8, 0.15],
            bracoD: [0.15, 0.8, 0.15],
            pernaE: [0.15, 1.2, 0.15],
            pernaD: [0.15, 1.2, 0.15],
        }[parte];
    }


    // Loader
    const loader = new GLTFLoader();

    loader.load(
        './models/ninja2.glb',
        function (gltf) {
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

            boneco.traverse((child) => {
                if (child.isMesh || child.isSkinnedMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        },
        undefined,
        console.error
    );


    // Carregar inimigo
    loader.load(
        './models/creed.glb',
        function (gltf) {
            inimigo = gltf.scene;
            inimigo.scale.set(1, 1, 1);
            inimigo.position.set(5, 0, 0);
            scene.add(inimigo);

            inimigo.traverse((child) => {
                if (child.isMesh || child.isSkinnedMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

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
        },
        undefined,
        console.error
    );

    const treeLoader = new GLTFLoader();
    const collidableObjects = [];
    let tree;

    // Função para gerar uma posição aleatória dentro dos limites do mapa
    function getRandomPosition() {
        // Defina os limites do mapa (ajuste conforme necessário)
        const mapWidth = 50;  // Largura do mapa
        const mapHeight = 50; // Altura do mapa

        const x = Math.random() * mapWidth - (mapWidth / 2);  // Posicionamento aleatório no eixo X
        const z = Math.random() * mapHeight - (mapHeight / 2);  // Posicionamento aleatório no eixo Z

        // Retorna a posição aleatória
        return new THREE.Vector3(x, 0, z);
    }

    treeLoader.load('./models/quick_treeit_tree.glb', (gltf) => {
        for (let i = 0; i < 20; i++) {
            const tree = gltf.scene.clone(); // Clona o modelo para cada árvore

            // Define a escala da árvore
            tree.traverse(c => {
                c.castShadow = true;
                c.scale.set(0.5, 0.5, 0.5);
            });

            // Define uma posição aleatória para cada árvore
            const position = getRandomPosition();
            tree.position.set(position.x, 0, position.z);  // A posição Y é 0, você pode ajustá-la conforme necessário

            // Adiciona a árvore à cena
            scene.add(tree);


            let box = new THREE.Box3().setFromObject(tree);
            collidableObjects.push({mesh: tree,box});
        }
    });

    //carregar cadaver
    const loaderRemains = new GLTFLoader();
    loader.load('./models/remains.glb', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
            c.scale.set(0.85,0.85,0.85);
            c.position.set(2,0,0);
        });
        scene.add(gltf.scene);
    })

    const loaderBushes = new GLTFLoader();
    loaderBushes.load('./models/bush.glb', (gltf) => {
        for (let i = 0; i < 20; i++) {
            const bush = gltf.scene.clone(); // Clona o modelo para cada arbusto

            // Define a escala do arbusto
            bush.traverse(c => {
                c.castShadow = true;
                c.scale.set(0.8, 0.8, 0.8);
            });

            // Define uma posição aleatória para cada árvore
            const position = getRandomPosition();
            bush.position.set(position.x, 3.5, position.z);  // A posição Y é 0, você pode ajustá-la conforme necessário

            // Adiciona o arbusto à cena
            scene.add(bush);
        }
    });

    const loaderRocks = new GLTFLoader();
    loaderRocks.load('./models/stylized_rocks.glb', (gltf) => {
        for(let i = 0; i< 10; i++){
            const rock = gltf.scene.clone(); // Clona o modelo para cada rocha

            // Define a escala da rocha
            rock.traverse(c => {
                c.castShadow = true;
                c.scale.set(0.8, 0.8, 0.8);
            });

            // Define uma posição aleatória para cada rocha
            const position = getRandomPosition();
            rock.position.set(position.x, 0, position.z);  // A posição Y é 0, você pode ajustá-la conforme necessário

            // Adiciona a rocha à cena
            scene.add(rock);
        }
    });


    // Clock
    const clock = new THREE.Clock();

    // Teclas
    const teclas = {};
    document.addEventListener('keydown', (e) => {
        teclas[e.key] = true;

        if (e.key === '1') iniciarAcao('punch');
        if (e.key === '2') iniciarAcao('block');
        if (e.key === '3') iniciarAcao('kick');
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
        const animacoesDeAtaque = ['punch', 'kick'];
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
                        mostrarGameOver("Vitória!");
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
                        mostrarGameOver("Derrota!");
                    }


                        mostrarMensagem("Hit:10")
                    return true;
                }
            }
        }
        return false;
    }

    let gameOver = false;

    function mostrarGameOver(texto) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverText = document.getElementById('gameOverText');
        gameOverText.innerText = texto;
        gameOverScreen.style.visibility = 'visible';
        gameOver = true;
    }

        function checkCollisions(playerBox) {
            for (const obj of collidableObjects) {
        if (playerBox.intersectsBox(obj.box)) {
        return true; // Colidiu
        }
    }
    return false;
    }

    function animate() {
        const delta = clock.getDelta();

        if (!window.jogoIniciado) {
        return; // Sai da função se o jogo ainda não começou
    }
    
        if (mixer) mixer.update(delta);
        if (mixerInimigo) {
            mixerInimigo.update(delta);
            atualizarInimigo(delta);
        }

        if (boneco) {
    let aAndar = false;

    if (teclas['w'] || teclas['W']) {
        const newZ = boneco.position.z - 0.05;
        if (newZ >= terrainLimits.minZ) {
            boneco.position.z = newZ;
            aAndar = true;
        }
    }
    if (teclas['s'] || teclas['S']) {
        const newZ = boneco.position.z + 0.05;
        if (newZ <= terrainLimits.maxZ) {
            boneco.position.z = newZ;
            aAndar = true;
        }
    }
    if (teclas['a'] || teclas['A']) {
        const newX = boneco.position.x - 0.05;
        if (newX >= terrainLimits.minX) {
            boneco.position.x = newX;
            aAndar = true;
        }
    }
    if (teclas['d'] || teclas['D']) {
        const newX = boneco.position.x + 0.05;
        if (newX <= terrainLimits.maxX) {
            boneco.position.x = newX;
            aAndar = true;
        }
    }

    if (!emAcao && (estadoAtual === 'idle' || estadoAtual.startsWith('walk'))) {
    if (teclas['d'] || teclas['D']) {
        trocaAnimacao('walk_back');
    } else if (teclas['a'] || teclas['A']) {
        trocaAnimacao('walk_forward');
    } else if (teclas['s'] || teclas['S']) {
        trocaAnimacao('walk_left');
    } else if (teclas['w'] || teclas['W']) {
        trocaAnimacao('walk_right');
    } else {
        trocaAnimacao('idle');
    }
}


    const offset = new THREE.Vector3(-1, 2, 5);
    const cameraTarget = boneco.position.clone().add(offset);
    activeCamera.position.lerp(cameraTarget, 0.1);
    activeCamera.lookAt(boneco.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
}

        if (boneco) atualizarHitboxesJogador();
        if (inimigo) atualizarHitboxesInimigo();

        if (boneco && inimigo) {
            verificarHitJogadorNoInimigo();
            verificarHitInimigoNoJogador();
            boneco.lookAt(inimigo.position);
        }

        clampCameraPosition(activeCamera, terrainLimits);

        renderer.render(scene, activeCamera);
        stats.update();
        document.getElementById('vidaInimigo').innerText = `Vida Inimigo: ${vidaInimigo}`;
        document.getElementById('vidaJogador').innerText = `Vida Jogador: ${vidaJogador}`;

        if (gameOver) {
        renderer.render(scene, activeCamera);
        return;
    }

    }

    let tempoUltimaAcaoInimigo = 0;
    const intervaloEntreAcoes = 2; // segundos

    function atualizarInimigo(delta) {
        if (!boneco || !inimigo) return;

        const distancia = boneco.position.distanceTo(inimigo.position);
        tempoUltimaAcaoInimigo += delta;

        if (distancia > 2 && !emAcaoInimigo) {
            const direcao = new THREE.Vector3().subVectors(boneco.position, inimigo.position).normalize();
            const newPosition = inimigo.position.clone().add(direcao.multiplyScalar(0.05));

            // Verificar se a nova posição está dentro dos limites
            if (
                newPosition.x >= terrainLimits.minX &&
                newPosition.x <= terrainLimits.maxX &&
                newPosition.z >= terrainLimits.minZ &&
                newPosition.z <= terrainLimits.maxZ
            ) {
                inimigo.position.copy(newPosition);
            }

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

    // GUI Luz
    const sunFolder = gui.addFolder('Sun Light');
    sunFolder.add(sun.position, 'x', -100, 100, 0.1).name('Pos X');
    sunFolder.add(sun.position, 'y', -100, 100, 0.1).name('Pos Y');
    sunFolder.add(sun.position, 'z', -100, 100, 0.1).name('Pos Z');
    sunFolder.add(sun, 'intensity', 0, 5, 0.1).name('Intensity');
    sunFolder.addColor({ color: sun.color.getHex() }, 'color')
        .name('Color')
        .onChange((val) => sun.color.set(val));

    const terrainLimits = {
    minX: -25, // Metade negativa da largura do terreno
    maxX: 25,  // Metade positiva da largura do terreno
    minZ: -25, // Metade negativa da altura do terreno
    maxZ: 25   // Metade positiva da altura do terreno
};

