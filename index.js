const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

// Set renderer size to match window
function resizeRenderer() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Orthographic camera setup
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 17.5; // Controls how much of the scene is visible
const cameraOffset = new THREE.Vector3(0, 2, 5);
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, // left
    frustumSize * aspect / 2,  // right
    frustumSize / 2,           // top
    frustumSize / -2,          // bottom
    -100,                      // near
    100                       // far
);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Update player position (center, on top of ground)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshPhongMaterial({color: 0x00aaff});
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.5, 0); // Half height (0.5) above ground (0)
scene.add(player);

// Update the ground position and size
const groundGeometry = new THREE.BoxGeometry(100, 0.1, 100); // Thinner ground (height 0.1)
const groundMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(0, 0, 0); // Ground sits at y=0
scene.add(ground);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

gltf.scene.traverse(function(child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
})


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 100, -200);
scene.add(directionalLight);

// // Add grid helper
const gridHelper = new THREE.GridHelper(150, 50);
scene.add(gridHelper);

// Add axes helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);


// Add this near the top with other scene variables
const trailParticles = [];
const trailMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    transparent: true, 
    opacity: 0.7 
});

// Add this function to create trail particles
function createTrailParticle() {
    const size = 0.3 + Math.random() * 0.2;
    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const particle = new THREE.Mesh(geometry, trailMaterial);
    particle.position.copy(player.position);
    particle.position.y += 0.2; // Raise slightly above ground
    scene.add(particle);
    trailParticles.push({
        mesh: particle,
        lifetime: 0,
        maxLifetime: 300 + Math.random() * 200 // Random lifetime between 300-500ms
    });
    return particle;
}

// Add this function to update trail particles
function updateTrailParticles() {
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const particle = trailParticles[i];
        particle.lifetime += 16; // Assuming ~60fps
        particle.mesh.material.opacity = 0.7 * (1 - (particle.lifetime / particle.maxLifetime));
        
        if (particle.lifetime >= particle.maxLifetime) {
            scene.remove(particle.mesh);
            trailParticles.splice(i, 1);
        }
    }
}

// Update boulder generation to place them on ground
function generateBoulders(count, areaSize) {
    const boulders = [];
    const boulderMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    
    for (let i = 0; i < count; i++) {
        const size = 0.5 + Math.random() * 2;
        const boulderGeometry = new THREE.BoxGeometry(size, size, size);
        
        boulderGeometry.scale(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        
        const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
        
        const x = (Math.random() - 0.5) * areaSize;
        const z = (Math.random() - 0.5) * areaSize;
        
        // Position on ground (y = half height)
        boulder.position.set(x, size/2, z);
        
        scene.add(boulder);
        boulders.push(boulder);
    }
    
    return boulders;
}

// Generate 50 boulders in a 80x80 area
const boulders = generateBoulders(50, 80);

// Add this near the top with other scene variables
const enemies = [];
const enemySpeed = 0.1; // Movement speed of enemies

// Update enemy generation to place them on ground
function generateEnemies(count, areaSize) {
    const enemyMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    
    for (let i = 0; i < count; i++) {
        const size = 1;
        const enemyGeometry = new THREE.BoxGeometry(size, size, size);
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        
        let x, z;
        do {
            x = (Math.random() - 0.5) * areaSize;
            z = (Math.random() - 0.5) * areaSize;
        } while (Math.abs(x) < 5 && Math.abs(z) < 5);
        
        // Position on ground (y = half height)
        enemy.position.set(x, size/2, z);
        scene.add(enemy);
        enemies.push({
            mesh: enemy,
            size: size
        });
    }
}

// Generate 10 enemies in an 80x80 area
generateEnemies(10, 80);


function animate() {
    requestAnimationFrame(animate);

    let newCameraPos = player.position.clone().add(cameraOffset);
    camera.position.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    camera.lookAt(player.position);

    directionalLight.lookAt(player.position);
    
    updateTrailParticles();
    //updateEnemies(); // Add this line to update enemy movement
    renderer.render(scene, camera);
}

animate();

export { scene, player, camera, cameraOffset, createTrailParticle, boulders, enemies };