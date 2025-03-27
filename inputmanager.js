import { player, camera, cameraOffset } from './index.js';

const moveSpeed = 0.15;
const rotSpeed = 0.04;
const keys = {};
let angle = 0;

const dashSpeed = 5.0;  // Speed multiplier during dash
const dashDuration = 150; // Duration of dash in milliseconds
let isDashing = false;
let dashEndTime = 0;
let dashUp = true;
let dashCooldown = 3000;
let dashUpTime = 0;

document.addEventListener('contextmenu', event => event.preventDefault());

// Track key presses
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    //keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    //keys[event.code] = false;
});
function updateMovement() {
    // Calculate camera forward and right vectors (ignore Y-axis for ground movement)
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraForward);
    cameraRight.normalize();

    if (!dashUp && Date.now() > dashUpTime) {
        dashUp = true;
    }

    // Check for dash input (left shift)
    if ((keys['Shift'] || keys['ShiftLeft']) && !isDashing && dashUp) {
        isDashing = true;
        dashEndTime = Date.now() + dashDuration;

        dashUpTime = dashEndTime + dashCooldown;
        dashUp = false;
    }
    

    // Calculate current speed (normal or dash speed)
    const currentSpeed = isDashing ? moveSpeed * dashSpeed : moveSpeed;

    // Player movement relative to camera
    if (keys['w'] || keys['ArrowUp']) {
        player.position.addScaledVector(cameraForward, currentSpeed);
    }
    if (keys['s'] || keys['ArrowDown']) {
        player.position.addScaledVector(cameraForward, -currentSpeed);
    }
    if (keys['a'] || keys['ArrowLeft']) {
        player.position.addScaledVector(cameraRight, currentSpeed);
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.position.addScaledVector(cameraRight, -currentSpeed);
    }

    // Check if dash should end
    if (isDashing && Date.now() > dashEndTime) {
        isDashing = false;
    }

    // Camera rotation
    if (keys['e']) {
        angle -= rotSpeed;
        updateCameraPosition();
    }
    else if (keys['q']) {
        angle += rotSpeed;
        updateCameraPosition();
    } else if (keys['z']) {
        angle = 0;
        updateCameraPosition();
    }

    requestAnimationFrame(updateMovement);
}

function updateCameraPosition() {
    // Calculate new camera offset based on rotation angle
    const radius = Math.sqrt(cameraOffset.x * cameraOffset.x + cameraOffset.z * cameraOffset.z);
    cameraOffset.x = radius * Math.sin(angle);
    cameraOffset.z = radius * Math.cos(angle);
}

// Start the movement loop
updateMovement();