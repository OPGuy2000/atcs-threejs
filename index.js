const canvas = document.querySelector('#c');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 2.5;

const scene = new THREE.Scene();

//create cubes
const geometry = new THREE.BoxGeometry(1, 1, 1)
const cubes = [
    makeCube(geometry, 0x00FFFF, 0),
    makeCube(geometry, 0xFF00FF, -2),
    makeCube(geometry, 0xFFFF00, 2),
];


//add lighting
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

function makeCube(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
}

function render(time) {
    time *= 0.001;

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);