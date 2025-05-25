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
        this.candeeiroCount = 10; // Novo: número de candeeiros

        this.createTerrain();
        //this.createTrees();
        //this.createRocks();
        //this.createBushes();
        this.createTorii();
        this.createWalls();
        //this.createBirds();
        this.createLanterna();
        this.createLanternasNasParedes();
        this.createCandeeirosNoTerreno(); // Novo: espalha candeeiros

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
            const vermelho = new THREE.MeshStandardMaterial({ color: 0xff0000 });
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
    name: 'LanternaGlass',
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
  const light = new THREE.PointLight(0xffcc88, 3, 5);
    light.position.set(0, 2.8 * scaleFactor, 0);
    light.castShadow = false; 
    light.shadow.mapSize.set(512, 512);
    light.shadow.bias = -0.005;
    lanterna.add(light);
    if (!window.lanternLights) window.lanternLights = [];
    window.lanternLights.push(light);


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








    createCandeeiro() {
        // Cria um grupo para o candeeiro
        const candeeiro = new THREE.Group();

        // Material vermelho
        const vermelho = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const preto = new THREE.MeshStandardMaterial({ color: 0x000000 });

        // Geometria do cilindro (raio topo, raio base, altura, segmentos)
        const base = new THREE.CylinderGeometry(0.05, 0.05, 1.395, 64);
        // Mesh do cilindro
        const cilindro = new THREE.Mesh(base, vermelho);
        cilindro.position.set(0, 0.725, 0); // Corrigido para posição local

        // Caixa Principal
        const facecaixa1 = new THREE.BoxGeometry( 0.01, 0.25, 0.25 );
        const face1 = new THREE.Mesh(facecaixa1, vermelho); 
        face1.position.set(0.125, 1.55, 0);

        const facecaixa2 = new THREE.BoxGeometry( 0.25, 0.01, 0.25 );
        const face2 = new THREE.Mesh(facecaixa2, vermelho); 
        face2.position.set(0, 1.425, 0);

        const facecaixa3 = new THREE.BoxGeometry( 0.25, 0.01, 0.25 );
        const face3 = new THREE.Mesh(facecaixa3, vermelho); 
        face3.position.set(0, 1.675, 0);

        const facecaixa4 = new THREE.BoxGeometry( 0.01, 0.25, 0.25);
        const face4 = new THREE.Mesh(facecaixa4, vermelho); 
        face4.position.set(-0.125, 1.55, 0);

        // Bordas da Frente
        const gradeHborda1 = new THREE.BoxGeometry( 0.04, 0.25, 0.01); 
        const hborda1 = new THREE.Mesh(gradeHborda1, vermelho ); 
        hborda1.position.set(-0.106, 1.55, 0.125);

        const gradeHborda2 = new THREE.BoxGeometry( 0.04, 0.25, 0.01); 
        const hborda2 = new THREE.Mesh(gradeHborda2, vermelho ); 
        hborda2.position.set(0.106, 1.55, 0.125);

        const gradeVborda1 = new THREE.BoxGeometry( 0.25, 0.04, 0.01); 
        const vborda1 = new THREE.Mesh(gradeVborda1, vermelho ); 
        vborda1.position.set(0, 1.656, 0.125);

        const gradeVborda2 = new THREE.BoxGeometry( 0.25, 0.04, 0.01); 
        const vborda2 = new THREE.Mesh(gradeVborda2, vermelho ); 
        vborda2.position.set(0, 1.444, 0.125);

        const gradeHjanelaF= new THREE.BoxGeometry( 0.25, 0.04, 0.01);
        const ghjanelaF = new THREE.Mesh(gradeHjanelaF, vermelho );
        ghjanelaF.position.set(0, 1.55, 0.125);

        const gradeVjanelaF= new THREE.BoxGeometry( 0.04, 0.25, 0.01);
        const gvjanelaF = new THREE.Mesh(gradeVjanelaF, vermelho );
        gvjanelaF.position.set(0, 1.55, 0.125);

        // Bordas de Tras
        const gradeHborda3 = new THREE.BoxGeometry( 0.04, 0.25, -0.01);
        const hborda3 = new THREE.Mesh(gradeHborda3, vermelho );
        hborda3.position.set(-0.106, 1.55, -0.125);

        const gradeHborda4 = new THREE.BoxGeometry( 0.04, 0.25, -0.01);
        const hborda4 = new THREE.Mesh(gradeHborda4, vermelho );
        hborda4.position.set(0.106, 1.55, -0.125);

        const gradeVborda3 = new THREE.BoxGeometry( 0.25, 0.04, -0.01);
        const vborda3 = new THREE.Mesh(gradeVborda3, vermelho );
        vborda3.position.set(0, 1.656, -0.125);

        const gradeVborda4 = new THREE.BoxGeometry( 0.25, 0.04, -0.01);
        const vborda4 = new THREE.Mesh(gradeVborda4, vermelho );
        vborda4.position.set(0, 1.444, -0.125);

        const gradeHjanelaT= new THREE.BoxGeometry( 0.25, 0.04, -0.01);
        const ghjanelaT = new THREE.Mesh(gradeHjanelaT, vermelho );
        ghjanelaT.position.set(0, 1.55, -0.125);

        const gradeVjanelaT= new THREE.BoxGeometry( 0.04, 0.25, -0.01);
        const gvjanelaT = new THREE.Mesh(gradeVjanelaT, vermelho );
        gvjanelaT.position.set(0, 1.55, -0.125);

        // Segundo Patamar para por o telhado
        const facecaixa5 = new THREE.BoxGeometry( 0.01, 0.125, 0.25 );
        const face5 = new THREE.Mesh(facecaixa5, vermelho); 
        face5.position.set(0.125, 1.675, 0);

        const facecaixa6 = new THREE.BoxGeometry( 0.01, 0.125, 0.25 );
        const face6 = new THREE.Mesh(facecaixa6, vermelho); 
        face6.position.set(-0.125, 1.675, 0);

        const facecaixa7 = new THREE.BoxGeometry( 0.25, 0.1, 0.01 );
        const face7 = new THREE.Mesh(facecaixa7, vermelho); 
        face7.position.set(0, 1.68, -0.125);

        const facecaixa8 = new THREE.BoxGeometry( 0.25, 0.1, 0.01 );
        const face8 = new THREE.Mesh(facecaixa8, vermelho); 
        face8.position.set(0, 1.68, 0.125);

        const facecaixa9 = new THREE.BoxGeometry( 0.25, 0.01, 0.25 );
        const face9 = new THREE.Mesh(facecaixa9, vermelho); 
        face9.position.set(0, 1.735, 0);

        // Telhado
        const telhadoD = new THREE.BoxGeometry(0.07, 0.25, 0.35);
        const telhadoDMesh = new THREE.Mesh(telhadoD, preto);
        telhadoDMesh.position.set(0.1, 1.72, 0);
        telhadoDMesh.rotation.z = Math.PI / 4;

        const telhadoE = new THREE.BoxGeometry(0.07, 0.25, 0.35);
        const telhadoEMesh = new THREE.Mesh(telhadoE, preto);
        telhadoEMesh.position.set(-0.1, 1.72, 0);
        telhadoEMesh.rotation.z = Math.PI / -4;

        const vigatelhado = new THREE.BoxGeometry(0.07, 0.07, 0.35);
        const vigatelhadoMesh = new THREE.Mesh(vigatelhado, preto);
        vigatelhadoMesh.position.set(0, 1.84, 0);
        vigatelhadoMesh.rotation.z = Math.PI / -4;

        // Bodaco que falta na face debaixo do telhado
        const bocadoparede = new THREE.BoxGeometry(0.08, 0.08, 0.251);
        const bocadoparedeMesh = new THREE.Mesh(bocadoparede, vermelho);
        bocadoparedeMesh.position.set(0, 1.72, 0);
        bocadoparedeMesh.rotation.z = Math.PI / -4;

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            name: 'CandeeiroGlass',
            color: 0xffe5b4,
            transparent: true,
            opacity: 0.5,
            transmission: 1.0,
            emissive: new THREE.Color(0xffcc88),
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0
        });

        const glassGeo = new THREE.PlaneGeometry(0.18, 0.22);
        const glass1 = new THREE.Mesh(glassGeo, glassMaterial);
        glass1.position.set(0, 1.55, 0.124);
        const glass2 = new THREE.Mesh(glassGeo, glassMaterial);
        glass2.position.set(0, 1.55, -0.124);

        // Adiciona tudo ao grupo
        candeeiro.add(cilindro, face1, face2, face3, face4, hborda1, hborda2, vborda1, vborda2, hborda3, hborda4, vborda3, vborda4, ghjanelaF, gvjanelaF, ghjanelaT, gvjanelaT, face5, face6, face7, face8, face9, telhadoDMesh, telhadoEMesh, vigatelhadoMesh, bocadoparedeMesh, glass1, glass2);

        // Sombra
        [cilindro, face1, face2, face3, face4, hborda1, hborda2, vborda1, vborda2, hborda3, hborda4, vborda3, vborda4, ghjanelaF, gvjanelaF, ghjanelaT, gvjanelaT, face5, face6, face7, face8, telhadoDMesh, telhadoEMesh, vigatelhadoMesh, bocadoparedeMesh, glass1, glass2].forEach(obj => obj.castShadow = true);

        // Adiciona luz dentro do candeeiro
        const light = new THREE.PointLight(0xffcc88, 2, 2.75, 3);
        light.position.set(0, 1.55, 0);
        light.castShadow = false;
        candeeiro.add(light);
        if (!window.candeeiroLights) window.candeeiroLights = [];
        window.candeeiroLights.push(light);

        // Opcional: vidro mais "brilhante" e sem reação à luz
        glass1.material = new THREE.MeshBasicMaterial({ color: 0xffe5b4, transparent: true, opacity: 0.1 });
        glass2.material = new THREE.MeshBasicMaterial({ color: 0xffe5b4, transparent: true, opacity: 0.1 });

        return candeeiro;
    }

    // Espalha vários candeeiros pelo terreno
    createCandeeirosNoTerreno() {
        this.candeeiros = new THREE.Group();
        this.add(this.candeeiros);
        for (let i = 0; i < this.candeeiroCount; i++) {
            const candeeiro = this.createCandeeiro();
            // Posição aleatória, evitando bordas
            const x = Math.random() * (this.width - 6) - (this.width / 2 - 3);
            const z = Math.random() * (this.height - 6) - (this.height / 2 - 3);
            candeeiro.position.set(x, 0, z);
            this.candeeiros.add(candeeiro);
        }
    }

}