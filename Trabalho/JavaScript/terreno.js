import * as THREE from 'three';


export class Terrain extends THREE.Mesh {
    #objectMap = new Map();   //variável privada para verificar spawn diferentes de arvores, arbustos e rochas

    constructor(width,height) {
        super();
        this.width = width;
        this.height = height;
        this.treeCount = 30;
        this.rockCount = 45;
        this.bushCount = 40;
        this.toriiCount = 1;

        this.createTerrain();
        //this.createTrees();
        //this.createRocks();
        //this.createBushes();
        this.createTorii();
        this.createWalls();
        this.createBirds();
        this.createLanterna();
        this.createLanternasNasParedes();

        console.log(this.#objectMap);
    }

    createTerrain() {
        if (this.terrain) {
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
            this.remove(this.terrain);
        }

        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('models/grass.png'); // substitua pelo caminho real da imagem

        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(this.width / 10, this.height / 10); // Ajuste o tiling conforme necessário

        const terrainMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            side: THREE.DoubleSide,
        });


        const terrainGeometry = new THREE.PlaneGeometry(this.width, this.height, this.width, this.height);
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);

        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.set(0, 0, 0); // Centraliza o terreno no ponto (0, 0, 0)

        this.add(this.terrain);
    }

    createTrees() {
        const treeRadius = 0.2;
        const treeHeight = 4;

        const treeGeometry = new THREE.ConeGeometry(treeRadius, treeHeight, 8);
        const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x305010, flatShading: true });

        this.trees = new THREE.Group();
        this.add(this.trees);

        this.trees.clear();
        for (let i = 0; i < this.treeCount; i++) {
            const treeMesh = new THREE.Mesh(treeGeometry, treeMaterial);

            const coords = new THREE.Vector2(
                Math.floor(this.width * Math.random()) - this.width / 2,
                Math.floor(this.height * Math.random()) - this.height / 2
            );

            if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue; // verifica se já existe objeto

            treeMesh.position.set(
                coords.x + 0.5,
                treeHeight / 2,
                coords.y + 0.5
            );
            this.trees.add(treeMesh);
            treeMesh.castShadow = true;
            this.#objectMap.set(`${coords.x}-${coords.y}`, treeMesh);
        }
    }

    createRocks() {
        const minRockRadius = 0.1;
        const maxRockRadius = 0.3;
        const minRockHeight = 0.5;
        const maxRockHeight = 0.8;

        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, flatShading: true });

        this.rocks = new THREE.Group();
        this.add(this.rocks);

        for (let i = 0; i < this.rockCount; i++) {
            const radius = minRockRadius + (Math.random() * (maxRockRadius - minRockRadius));
            const height = minRockRadius + (Math.random() * (maxRockHeight - minRockHeight));
            const rockGeometry = new THREE.SphereGeometry(radius, 6, 5);
            const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);

            const coords = new THREE.Vector2(
                Math.floor(this.width * Math.random()) - this.width / 2,
                Math.floor(this.height * Math.random()) - this.height / 2
            );

            if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue; // verifica se já existe objeto

            rockMesh.position.set(
                coords.x + 0.5,
                0,
                coords.y + 0.5
            );
            rockMesh.scale.y = height;
            this.rocks.add(rockMesh);
            rockMesh.castShadow = true;
            this.#objectMap.set(`${coords.x}-${coords.y}`, rockMesh);
        }
    }    
    
    createWalls() {
    const wallHeight = 5;
    const wallThickness = 0.5;

    // Carrega a textura
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load('models/wall_japan.png');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(5, 1); // Ajusta conforme necessário

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
    });

    // Geometrias
    const wallGeometryVertical = new THREE.BoxGeometry(wallThickness, wallHeight, this.height);
    const wallGeometryHorizontal = new THREE.BoxGeometry(this.width, wallHeight, wallThickness);

    // Paredes com material com textura
    const leftWall = new THREE.Mesh(wallGeometryVertical, wallMaterial);
    leftWall.position.set(-this.width / 2, wallHeight / 2, 0);
    this.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometryVertical, wallMaterial);
    rightWall.position.set(this.width / 2, wallHeight / 2, 0);
    this.add(rightWall);

    const frontWall = new THREE.Mesh(wallGeometryHorizontal, wallMaterial);
    frontWall.position.set(0, wallHeight / 2, -this.height / 2);
    this.add(frontWall);

    const backWall = new THREE.Mesh(wallGeometryHorizontal, wallMaterial);
    backWall.position.set(0, wallHeight / 2, this.height / 2);
    this.add(backWall);

    return { leftWall, rightWall, frontWall, backWall };
}


    createBushes() {
        const minBushRadius = 0.1;
        const maxBushRadius = 0.3;

        const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x80a040, flatShading: true });

        this.bushes = new THREE.Group();
        this.add(this.bushes);

        for (let i = 0; i < this.bushCount; i++) {
            const radius = minBushRadius + (Math.random() * (maxBushRadius - minBushRadius));
            const bushGeometry = new THREE.SphereGeometry(radius, 8, 8);
            const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);

            const coords = new THREE.Vector2(
                Math.floor(this.width * Math.random()) - this.width / 2,
                Math.floor(this.height * Math.random()) - this.height / 2
            );

            if (this.#objectMap.has(`${coords.x}-${coords.y}`)) continue; // verifica se já existe objeto

            bushMesh.position.set(
                coords.x + 0.5,
                radius,
                coords.y + 0.5
            );
            this.bushes.add(bushMesh);
            bushMesh.castShadow = true;
            this.#objectMap.set(`${coords.x}-${coords.y}`, bushMesh);
        }
    }

    createTorii() {
        this.torii = new THREE.Group();
        this.add(this.torii);

        for (let i = 0; i < this.toriiCount; i++) {
            const vermelho = new THREE.MeshStandardMaterial({ color: 0xff2c2c });
            const preto = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const amarelo = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            const altura = 7;

            const posteGeo = new THREE.BoxGeometry(0.6, 7, 0.6);
            const coberturaposteGeo = new THREE.BoxGeometry(0.7, 1.5, 0.7);

            const coberturaPosteEsq = new THREE.Mesh(coberturaposteGeo, preto);
            coberturaPosteEsq.position.set(-3.26, 0.7, 0); // Ajustado para centralizar
            coberturaPosteEsq.rotation.z = THREE.MathUtils.degToRad(-5); // Inclina 5 graus para fora
            this.torii.add(coberturaPosteEsq);

            const posteEsq = new THREE.Mesh(posteGeo, vermelho);
            posteEsq.position.set(-3, altura / 2, 0); // Ajustado para centralizar
            posteEsq.rotation.z = THREE.MathUtils.degToRad(-5); // Inclina 5 graus para fora
            this.torii.add(posteEsq);

            const coberturaPosteDir = new THREE.Mesh(coberturaposteGeo, preto);
            coberturaPosteDir.position.set(3.26, 0.7, 0); // Ajustado para centralizar
            coberturaPosteDir.rotation.z = THREE.MathUtils.degToRad(5); // Inclina 5 graus para fora
            this.torii.add(coberturaPosteDir);

            const posteDir = new THREE.Mesh(posteGeo, vermelho);
            posteDir.position.set(3, altura / 2, 0); // Ajustado para centralizar
            posteDir.rotation.z = THREE.MathUtils.degToRad(5); // Inclina 5 graus para fora
            this.torii.add(posteDir);

            const vigaGeo = new THREE.BoxGeometry(8, 0.6, 1);
            const viga = new THREE.Mesh(vigaGeo, vermelho);
            viga.position.set(0, altura - 0.3, 0); // Ajustado para centralizar
            this.torii.add(viga);

            const vigaGeomeio = new THREE.BoxGeometry(8, 0.4, 1);
            const vigameio = new THREE.Mesh(vigaGeomeio, vermelho);
            vigameio.position.set(0, altura - 1.4, 0); // Ajustado para centralizar
            this.torii.add(vigameio);

            const vigaGeoSuporte = new THREE.BoxGeometry(0.5, 0.85, 1);
            const vigaSuporte = new THREE.Mesh(vigaGeoSuporte, vermelho);
            vigaSuporte.position.set(0, altura - 0.78, 0); // Ajustado para centralizar
            this.torii.add(vigaSuporte);


            //const topoGeo = new THREE.BoxGeometry(8, 0.4, 1.2);
           // const topo = new THREE.Mesh(topoGeo, preto);
            //topo.position.set(0, altura + 0.3, 0); // Ajustado para centralizar
            //this.torii.add(topo);

            const largura = 10;
            const alturaTopo = 0.5;
            const profundidade = 1.2;
            const segmentos = 100; // mais segmentos para curvatura suave

            // Cria uma geometria subdividida no eixo X
            const topoGeo = new THREE.BoxGeometry(largura, alturaTopo, profundidade, segmentos, 1, 1);

            // Curvatura parabólica: define o "pico" da curva no centro
            const intensidadeCurvatura = 0.2; // ajuste conforme preferir

            const positionAttr = topoGeo.attributes.position;

            for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i);
            const y = positionAttr.getY(i);

            // Aplica uma parábola: y += -a(x^2) + h
            // Centramos x em 0
            const xNorm = (x / (largura / 2)); // varia de -1 a 1
            const parabolaY = intensidadeCurvatura * (xNorm ** 2) + intensidadeCurvatura; // pico no centro

            positionAttr.setY(i, y + parabolaY);
            }

            positionAttr.needsUpdate = true;
            topoGeo.computeVertexNormals();

            // Cria o mesh
            const topo = new THREE.Mesh(topoGeo, preto);
            topo.position.set(0, altura - 0.3, 0);

            this.torii.add(topo);



            posteEsq.castShadow = true;
            posteDir.castShadow = true;
            coberturaPosteDir.castShadow = true;
            coberturaPosteEsq.castShadow = true;
            viga.castShadow = true;
            vigameio.castShadow = true;
            vigaSuporte.castShadow = true;
            topoGeo.castShadow = true;


        }
    }

createLanterna() {
  const lanterna = new THREE.Group();

  const scaleFactor = 0.7;

 // === BASE (pequena e cinza) ===
const baseHeight = 1 * scaleFactor;
const baseGeometry = new THREE.BoxGeometry(0.4 * scaleFactor, baseHeight, 0.2 * scaleFactor);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
baseMesh.position.set(0, baseHeight / 2, 0); // base apoiada no chão
lanterna.add(baseMesh);

// === SUPORTE CURVO (começa no topo da base) ===
const curve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0, baseHeight, 0),                 // início: topo da base
  new THREE.Vector3(0, baseHeight + 0.5 * scaleFactor, 0.5), // curva
  new THREE.Vector3(0, baseHeight + 1.2 * scaleFactor, 0)    // fim
);
const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05 * scaleFactor, 8, false);
const tubeMaterial = new THREE.MeshStandardMaterial({ color: 0x3c2f1b });
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
lanterna.add(tubeMesh);


  // === CORPO DA LANTERNA (centralizado no suporte) ===
  const body = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

  const bodyBox = new THREE.BoxGeometry(1 * scaleFactor, 1.2 * scaleFactor, 1 * scaleFactor);
  const bodyMesh = new THREE.Mesh(bodyBox, frameMaterial);
  bodyMesh.position.set(0, 2.8 * scaleFactor, 0);
  body.add(bodyMesh);

  const barGeo = new THREE.BoxGeometry(0.05 * scaleFactor, 1.2 * scaleFactor, 0.05 * scaleFactor);
  for (let i = -0.4; i <= 0.4; i += 0.4) {
    for (let j = -0.4; j <= 0.4; j += 0.8) {
      const bar = new THREE.Mesh(barGeo, frameMaterial);
      bar.position.set(i * scaleFactor, 2.8 * scaleFactor, j * scaleFactor);
      body.add(bar);

      const sideBar = new THREE.Mesh(barGeo, frameMaterial);
      sideBar.rotation.y = Math.PI / 2;
      sideBar.position.set(0, 2.8 * scaleFactor, (j + i) * scaleFactor);
      body.add(sideBar);
    }
  }

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffe5b4,
    transparent: true,
    opacity: 0.5,
    transmission: 1.0,
    emissive: new THREE.Color(0xffcc88),
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0
  });
  const glassGeo = new THREE.PlaneGeometry(0.8 * scaleFactor, 1.0 * scaleFactor);
  for (let angle = 0; angle < 4; angle++) {
    const glass = new THREE.Mesh(glassGeo, glassMaterial);
    glass.position.set(0, 2.8 * scaleFactor, 0.51 * scaleFactor);
    glass.rotation.y = angle * Math.PI / 2;
    body.add(glass.clone());
  }

  lanterna.add(body);

  // === TOPO ===
  const roof = new THREE.Group();
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2c1a });

  for (let i = 0; i < 3; i++) {
    const layer = new THREE.BoxGeometry(
      (1.2 - i * 0.2) * scaleFactor,
      0.1 * scaleFactor,
      (1.2 - i * 0.2) * scaleFactor
    );
    const layerMesh = new THREE.Mesh(layer, roofMaterial);
    layerMesh.position.set(0, (3.4 + i * 0.08) * scaleFactor, 0);
    roof.add(layerMesh);
  }

  const tipGeo = new THREE.BoxGeometry(0.1 * scaleFactor, 0.05 * scaleFactor, 0.4 * scaleFactor);
  for (let offset of [-0.55, 0.55]) {
    const tip1 = new THREE.Mesh(tipGeo, roofMaterial);
    tip1.position.set(offset * scaleFactor, 3.55 * scaleFactor, 0);
    tip1.rotation.z = 0.2 * offset;
    roof.add(tip1);

    const tip2 = new THREE.Mesh(tipGeo, roofMaterial);
    tip2.rotation.z = 0.2 * offset;
    tip2.rotation.y = Math.PI / 2;
    tip2.position.set(0, 3.55 * scaleFactor, offset * scaleFactor);
    roof.add(tip2);
  }

  lanterna.add(roof);

  // === LUZ ===
  const pointLight = new THREE.PointLight(0xffcc66, 1, 5 * scaleFactor);
  pointLight.position.set(0, 2.8 * scaleFactor, 0);
  lanterna.add(pointLight);

  return lanterna;
}


createLanternasNasParedes() {
    const wallHeight = 5;
    const lanternaY = wallHeight / 2; // meia altura
    const offsetZ = this.height / 2 - 0.3;
    const offsetX = this.width / 2 - 0.3;
    const spacing = this.width / 4; // para distribuir 3 lanternas por parede

    const lanternas = new THREE.Group();

    // Frontal (-Z)
    for (let i = -1; i <= 1; i++) {
        const lanterna = this.createLanterna();
        lanterna.position.set(i * spacing, lanternaY, -offsetZ);
        lanternas.add(lanterna);
    }

    // Traseira (+Z)
    for (let i = -1; i <= 1; i++) {
        const lanterna = this.createLanterna();
        lanterna.position.set(i * spacing, lanternaY, offsetZ);
        lanternas.add(lanterna);
    }

    // Esquerda (-X)
    for (let i = -1; i <= 1; i++) {
        const lanterna = this.createLanterna();
        lanterna.position.set(-offsetX, lanternaY, i * spacing);
        lanternas.add(lanterna);
        lanterna.rotation.y = Math.PI / 2; // gira para "olhar" para dentro
    }

    // Direita (+X)
    for (let i = -1; i <= 1; i++) {
        const lanterna = this.createLanterna();
        lanterna.position.set(offsetX, lanternaY, i * spacing);
        lanternas.add(lanterna);
        lanterna.rotation.y = -Math.PI / 2;
    }

    this.add(lanternas);
}



    createBirds() {
        const birdCount = 10; // Número de pássaros
        const birdSpeed = 0.02; // Velocidade de voo
    
        this.birds = new THREE.Group();
        this.add(this.birds);
    
        const birdGeometry = new THREE.ConeGeometry(0.2, 0.5, 8); // Forma simples para o pássaro
        const birdMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
        for (let i = 0; i < birdCount; i++) {
            const bird = new THREE.Mesh(birdGeometry, birdMaterial);
    
            // Posição inicial aleatória
            bird.position.set(
                Math.random() * this.width - this.width / 2,
                Math.random() * 10 + 5, // Altura entre 5 e 15
                Math.random() * this.height - this.height / 2
            );
    
            bird.rotation.z = Math.PI / 2; // Rotaciona para parecer um pássaro em voo
            this.birds.add(bird);
    
            // Adiciona uma propriedade para armazenar a direção de movimento
            bird.userData.direction = new THREE.Vector3(
                Math.random() * 2 - 1, // Direção X
                0,
                Math.random() * 2 - 1 // Direção Z
            ).normalize();
        }
    
        // Animação dos pássaros
        const animateBirds = () => {
            this.birds.children.forEach((bird) => {
                bird.position.add(bird.userData.direction.clone().multiplyScalar(birdSpeed));
    
                // Faz os pássaros "voltarem" ao cenário se saírem dos limites
                if (bird.position.x > this.width / 2 || bird.position.x < -this.width / 2) {
                    bird.userData.direction.x *= -1;
                }
                if (bird.position.z > this.height / 2 || bird.position.z < -this.height / 2) {
                    bird.userData.direction.z *= -1;
                }
            });
    
            requestAnimationFrame(animateBirds);
        };
    
        animateBirds();
    }
}