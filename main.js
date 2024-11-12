let scene, camera, renderer, player, smile, frown, keys = [], exit, gun;
let keyCollected = 0;
let hasGun = false;
let isGameOver = false;
let turnSpeed = 0.002; // Adjust turning speed

function init() {
    // Basic Three.js Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Player Setup
    player = new THREE.Object3D();
    camera.position.set(0, 1.6, 5);
    player.add(camera);
    scene.add(player);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Floor (Haunted House)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: 0x333333 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Create Game Objects
    smile = createMonster(0xff0000, 'SMILE');
    frown = createMonster(0x0000ff, 'FROWN');
    createKeys(5); // 5 keys to collect
    exit = createExit();
    gun = createGun();

    // Start Game Loop
    document.addEventListener('keydown', onKeyPress);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', () => {
        document.getElementById('gameCanvas').requestPointerLock();
    });
    
    animate();
}

function createMonster(color, name) {
    const monster = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial({ color }));
    monster.position.set(Math.random() * 10 - 5, 1, Math.random() * 10 - 5);
    monster.name = name;
    scene.add(monster);
    return monster;
}

function createKeys(count) {
    for (let i = 0; i < count; i++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        key.position.set(Math.random() * 10 - 5, 0.25, Math.random() * 10 - 5);
        scene.add(key);
        keys.push(key);
    }
}

function createExit() {
    const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    exitDoor.position.set(0, 1.5, -8);
    scene.add(exitDoor);
    return exitDoor;
}

function createGun() {
    const gunMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0x808080 }));
    gunMesh.position.set(Math.random() * 10 - 5, 0.1, Math.random() * 10 - 5);
    scene.add(gunMesh);
    return gunMesh;
}

function animate() {
    if (isGameOver) return;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    // Check for collisions
    checkCollisions();
}

function checkCollisions() {
    // Check if player is near any key
    keys.forEach((key, index) => {
        if (key.position.distanceTo(player.position) < 1) {
            scene.remove(key);
            keys.splice(index, 1);
            keyCollected++;
            console.log(`Keys collected: ${keyCollected}`);
        }
    });

    // Check if player is near gun
    if (gun.position.distanceTo(player.position) < 1) {
        hasGun = true;
        scene.remove(gun);
        console.log("Gun collected!");
    }

    // Check if player is near exit and has all keys
    if (exit.position.distanceTo(player.position) < 1 && keyCollected === 5) {
        console.log("You escaped! Game won!");
        isGameOver = true;
    }

    // Check if player is near SMILE or FROWN
    if (smile.position.distanceTo(player.position) < 1 || (frown.position.distanceTo(player.position) < 1 && !hasGun)) {
        console.log("Caught by the monster. Game over!");
        isGameOver = true;
    } else if (frown.position.distanceTo(player.position) < 1 && hasGun) {
        scene.remove(frown);
        console.log("FROWN defeated!");
    }
}

function onKeyPress(event) {
    const speed = 0.2;
    switch (event.key) {
        case 'w': // Move forward
            player.translateZ(-speed);
            break;
        case 's': // Move backward
            player.translateZ(speed);
            break;
        case 'a': // Move left
            player.translateX(-speed);
            break;
        case 'd': // Move right
            player.translateX(speed);
            break;
    }
}

function onMouseMove(event) {
    if (document.pointerLockElement === document.getElementById('gameCanvas')) {
        // Rotate the player based on horizontal mouse movement
        player.rotation.y -= event.movementX * turnSpeed;
    }
}

function startGame() {
    document.getElementById('instructions').style.display = 'none';
    init();
}

