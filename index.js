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

// Add a player
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({color: 0x00aaff});
const player = new THREE.Mesh(geometry, material);
scene.add(player);

const groundGeometry = new THREE.BoxGeometry(100, 1, 100); // Increase y value from 0.1 to 1
const groundMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(0, player.position.y-1, 0); // Adjust position to account for thicker ground
scene.add(ground);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

// // Add grid helper
// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// // Add axes helper
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

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

function generateBoulders(count, areaSize) {
    const boulders = [];
    const boulderMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    
    for (let i = 0; i < count; i++) {
        // Random size between 0.5 and 2.5
        const size = 0.5 + Math.random() * 2;
        const boulderGeometry = new THREE.BoxGeometry(size, size, size);
        
        // Add some randomness to the shape
        boulderGeometry.scale(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        
        const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
        
        // Random position within the area
        const x = (Math.random() - 0.5) * areaSize;
        const z = (Math.random() - 0.5) * areaSize;
        
        // Position on top of the ground
        boulder.position.set(x, size/2, z);
        
        
        scene.add(boulder);
        boulders.push(boulder);
    }
    
    return boulders;
}

// Generate 50 boulders in a 80x80 area
const boulders = generateBoulders(50, 80);




// Animation loop
function animate() {
    requestAnimationFrame(animate);

    let newCameraPos = player.position.clone().add(cameraOffset);
    camera.position.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    camera.lookAt(player.position);

    directionalLight.lookAt(player.position);
    
    updateTrailParticles(); // Add this line
    renderer.render(scene, camera);
}

animate();

export { scene, player, camera, cameraOffset, createTrailParticle, boulders };
