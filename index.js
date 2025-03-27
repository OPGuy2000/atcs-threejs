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
const cameraOffset = new THREE.Vector3(0, 4, 5);
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, // left
    frustumSize * aspect / 2,  // right
    frustumSize / 2,           // top
    frustumSize / -2,          // bottom
    0.1,                      // near
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    let newCameraPos = player.position.clone().add(cameraOffset);
    camera.position.set(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    camera.lookAt(player.position);

    directionalLight.lookAt(player.position);
    
    renderer.render(scene, camera);
}

animate();

export { scene, player, camera, cameraOffset };