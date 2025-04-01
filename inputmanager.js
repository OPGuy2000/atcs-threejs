import { player, camera, cameraOffset, createTrailParticle, boulders } from './index.js';

const moveSpeed = 0.20;
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

let lastTrailTime = 0;
const trailInterval = 20; // milliseconds between trail particles


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
    // Store original position for collision detection
    const originalPosition = player.position.clone();

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
    if (keys['Shift'] && !isDashing && dashUp) {
        isDashing = true;
        dashEndTime = Date.now() + dashDuration;
        dashUpTime = dashEndTime + dashCooldown;
        dashUp = false;
    }

    // Calculate current speed (normal or dash speed)
    let currentSpeed = isDashing ? moveSpeed * dashSpeed : moveSpeed;
    
    // Track if any movement key is pressed
    let isMoving = false;

    // Player movement relative to camera
    if (keys['w'] || keys['ArrowUp']) {
        player.position.addScaledVector(cameraForward, currentSpeed);
        isMoving = true;
    }
    else if (keys['s'] || keys['ArrowDown']) {
        player.position.addScaledVector(cameraForward, -currentSpeed);
        isMoving = true;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        player.position.addScaledVector(cameraRight, currentSpeed);
        isMoving = true;
    }
    else if (keys['d'] || keys['ArrowRight']) {
        player.position.addScaledVector(cameraRight, -currentSpeed);
        isMoving = true;
    }

    // Check for collisions after movement
    checkCollisions(originalPosition);

    // If no movement keys are pressed during dash, cancel the dash
    if (isDashing && !isMoving) {
        isDashing = false;
    }
    // Otherwise, check if dash should end based on duration
    else if (isDashing && Date.now() > dashEndTime) {
        isDashing = false;
    }

    if (isDashing && Date.now() - lastTrailTime > trailInterval) {
        createTrailParticle();
        lastTrailTime = Date.now();
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

// Add this new collision detection function
function checkCollisions(originalPosition) {
    // Player's bounding box (simplified to a sphere for this example)
    const playerRadius = 0.5; // Half of player's width
    
    for (const boulder of boulders) {
        // Get boulder dimensions from its geometry
        const boulderSize = boulder.geometry.parameters.width; // Assuming box geometry
        const boulderRadius = boulderSize / 2;
        
        // Calculate distance between player and boulder
        const distance = player.position.distanceTo(boulder.position);
        
        // If distance is less than sum of radii, we have a collision
        if (distance < playerRadius + boulderRadius) {
            // Calculate push-back direction
            const direction = new THREE.Vector3()
                .subVectors(player.position, boulder.position)
                .normalize();
            
            // Move player to edge of boulder
            const newPosition = new THREE.Vector3()
                .copy(boulder.position)
                .add(direction.clone().multiplyScalar(playerRadius + boulderRadius));
            
            // Only update X and Z to keep player on ground
            player.position.x = newPosition.x;
            player.position.z = newPosition.z;
            
            // Optional: Add a small visual feedback
            boulder.material.color.setHex(0xff0000);
            setTimeout(() => {
                boulder.material.color.setHex(0x888888);
            }, 200);
            
            break; // Stop after first collision (optional)
        }
    }
}

function updateCameraPosition() {
    // Calculate new camera offset based on rotation angle
    const radius = Math.sqrt(cameraOffset.x * cameraOffset.x + cameraOffset.z * cameraOffset.z);
    cameraOffset.x = radius * Math.sin(angle);
    cameraOffset.z = radius * Math.cos(angle);
}

// Start the movement loop
updateMovement();