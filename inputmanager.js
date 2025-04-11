import { player, camera, cameraOffset, createTrailParticle, boulders, enemies } from './index.js';
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
    keys[event.key.toLowerCase()] = true;
    //[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
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
    if (keys['shift'] && !isDashing && dashUp) {
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
// Updated collision detection function
function checkCollisions(originalPosition) {
    // Player's bounding sphere
    const playerRadius = 0.5;
    const playerSphere = new THREE.Sphere(player.position.clone(), playerRadius);
    
    // Check player collisions with boulders
    for (const boulder of boulders) {
        const boulderSize = boulder.geometry.parameters.width;
        const boulderRadius = boulderSize / 2;
        const boulderSphere = new THREE.Sphere(boulder.position.clone(), boulderRadius);
        
        if (playerSphere.intersectsSphere(boulderSphere)) {
            const direction = new THREE.Vector3()
                .subVectors(player.position, boulder.position)
                .normalize();
            
            const newPosition = new THREE.Vector3()
                .copy(boulder.position)
                .add(direction.clone().multiplyScalar(playerRadius + boulderRadius));
            
            player.position.x = newPosition.x;
            player.position.z = newPosition.z;
            
            // Visual feedback
            boulder.material.color.setHex(0xff0000);
            setTimeout(() => boulder.material.color.setHex(0x888888), 200);
            break;
        }
    }
    
    // Check player collisions with enemies
    for (const enemy of enemies) {
        const enemyRadius = enemy.size / 2;
        const enemySphere = new THREE.Sphere(enemy.mesh.position.clone(), enemyRadius);
        
        if (playerSphere.intersectsSphere(enemySphere)) {
            // Game over or health reduction would go here
            console.log("Player hit by enemy!");
            
            // Push player away from enemy
            const direction = new THREE.Vector3()
                .subVectors(player.position, enemy.mesh.position)
                .normalize();
            
            player.position.addScaledVector(direction, 1.0);
        }
    }
    
    // Check enemy collisions with boulders and other enemies
    for (const enemy of enemies) {
        const enemyRadius = enemy.size / 2;
        const enemySphere = new THREE.Sphere(enemy.mesh.position.clone(), enemyRadius);
        
        // Enemy vs boulders
        for (const boulder of boulders) {
            const boulderSize = boulder.geometry.parameters.width;
            const boulderRadius = boulderSize / 2;
            const boulderSphere = new THREE.Sphere(boulder.position.clone(), boulderRadius);
            
            if (enemySphere.intersectsSphere(boulderSphere)) {
                const direction = new THREE.Vector3()
                    .subVectors(enemy.mesh.position, boulder.position)
                    .normalize();
                
                const newPosition = new THREE.Vector3()
                    .copy(boulder.position)
                    .add(direction.clone().multiplyScalar(enemyRadius + boulderRadius));
                
                enemy.mesh.position.x = newPosition.x;
                enemy.mesh.position.z = newPosition.z;
            }
        }
        
        // Enemy vs other enemies
        for (const otherEnemy of enemies) {
            if (enemy === otherEnemy) continue;
            
            const otherRadius = otherEnemy.size / 2;
            const otherSphere = new THREE.Sphere(otherEnemy.mesh.position.clone(), otherRadius);
            
            if (enemySphere.intersectsSphere(otherSphere)) {
                const direction = new THREE.Vector3()
                    .subVectors(enemy.mesh.position, otherEnemy.mesh.position)
                    .normalize();
                
                // Push both enemies apart
                const pushDistance = (enemyRadius + otherRadius) * 0.5;
                enemy.mesh.position.addScaledVector(direction, pushDistance * 0.5);
                otherEnemy.mesh.position.addScaledVector(direction, -pushDistance * 0.5);
            }
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