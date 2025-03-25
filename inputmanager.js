import { player , camera } from './index.js';

const moveSpeed = 0.1;
const rotSpeed = 0.05;
const keys = {};

// Track key presses
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Function to smoothly update movement
function updateMovement() {
    if (keys['w'] || keys['ArrowUp']) {
        player.position.z -= moveSpeed;
    }
    if (keys['s'] || keys['ArrowDown']) {
        player.position.z += moveSpeed;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        player.position.x -= moveSpeed;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.position.x += moveSpeed;
    }
    //Rotate camera around player
    if (keys['e']) {
        camera.position.x = player.position.x + Math.cos(rotSpeed) * (camera.position.x - player.position.x) - Math.sin(rotSpeed) * (camera.position.z - player.position.z);
        camera.position.z = player.position.z + Math.sin(rotSpeed) * (camera.position.x - player.position.x) + Math.cos(rotSpeed) * (camera.position.z - player.position.z);
        camera.lookAt(player.position);
    }
    else if (keys['q']) {
        camera.position.x = player.position.x + Math.cos(-rotSpeed) * (camera.position.x - player.position.x) - Math.sin(-rotSpeed) * (camera.position.z - player.position.z);
        camera.position.z = player.position.z + Math.sin(-rotSpeed) * (camera.position.x - player.position.x) + Math.cos(-rotSpeed) * (camera.position.z - player.position.z);
        camera.lookAt(player.position);
    }

    requestAnimationFrame(updateMovement);
}

// Start the movement loop
updateMovement();
