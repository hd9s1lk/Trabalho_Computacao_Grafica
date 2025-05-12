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
        this.createTrees();
        this.createRocks();
        this.createBushes();
        this.createTorii();

        console.log(this.#objectMap);
    }

    createTerrain() {
        if (this.terrain) {
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
            this.remove(this.terrain);
        }

        const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x50a000 });
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
            this.#objectMap.set(`${coords.x}-${coords.y}`, rockMesh);
        }
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
            this.#objectMap.set(`${coords.x}-${coords.y}`, bushMesh);
        }
    }

    createTorii() {
        this.torii = new THREE.Group();
        this.add(this.torii);

        for (let i = 0; i < this.toriiCount; i++) {
            const vermelho = new THREE.MeshStandardMaterial({ color: 0xff2c2c });
            const preto = new THREE.MeshStandardMaterial({ color: 0x222222 });

            const altura = 7;
            const raio = 0.3;
            const posteGeo = new THREE.CylinderGeometry(raio, raio, altura, 16);

            const posteEsq = new THREE.Mesh(posteGeo, vermelho);
            posteEsq.position.set(-3, altura / 2, 0); // Ajustado para centralizar
            this.torii.add(posteEsq);

            const posteDir = new THREE.Mesh(posteGeo, vermelho);
            posteDir.position.set(3, altura / 2, 0); // Ajustado para centralizar
            this.torii.add(posteDir);

            const vigaGeo = new THREE.BoxGeometry(7.5, 0.6, 1);
            const viga = new THREE.Mesh(vigaGeo, vermelho);
            viga.position.set(0, altura - 0.3, 0); // Ajustado para centralizar
            this.torii.add(viga);

            const topoGeo = new THREE.BoxGeometry(8, 0.4, 1.2);
            const topo = new THREE.Mesh(topoGeo, preto);
            topo.position.set(0, altura + 0.3, 0); // Ajustado para centralizar
            this.torii.add(topo);

            posteEsq.castShadow = true;
            posteDir.castShadow = true;
            viga.castShadow = true;
            topo.castShadow = true;
        }
    }
}