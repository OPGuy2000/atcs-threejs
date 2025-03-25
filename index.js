const canvas = document.querySelector('#c');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

// Define the frustum size for the orthographic camera
const frustumSize = 5;
const aspect = window.innerWidth / window.innerHeight;

// Create an orthographic camera
const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2, 
  (frustumSize * aspect) / 2,  
  frustumSize / 2,             
  -frustumSize / 2,            
  0.1,                         
  50                          
);

camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

// Create cubes
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cubes = [
    makeCube(geometry, 0x00FFFF, 0),
    makeCube(geometry, 0xFF00FF, -2),
    makeCube(geometry, 0xFFFF00, 2),
];

// Add lighting
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(5, 3, 2);
scene.add(light);

function makeCube(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    return cube;
}

function render() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// Handle window resize
window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / window.innerHeight;
    camera.left = (-frustumSize * newAspect) / 2;
    camera.right = (frustumSize * newAspect) / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
