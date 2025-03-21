let velx = 0;
let vely = 0;
let velz = 0;
let velrotate = 0;

const spd = 0.075;
const rotationspd = 1;

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

// Mouse event listeners
document.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        let deltaX = event.clientX - previousMouseX;
        let deltaY = event.clientY - previousMouseY;
        
        camera.rotation.y -= deltaX * 0.005;
        camera.rotation.x -= deltaY * 0.005;
        
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
});

document.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "w":
            velz = spd;
            break;
        case "a":
            velx = -spd;
            break;
        case "s":
            velz = -spd;
            break;
        case "d":
            velx = spd;
            break;
        case "ArrowRight":
            velrotate = rotationspd;
            break;
        case "ArrowLeft":
            velrotate = -rotationspd;
            break;
        default:
            console.log(event.key);
            break;
    }
});

document.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "w":
        case "s":
            velz = 0;
            break;
        case "a":
        case "d":
            velx = 0;
            break;
        case "ArrowRight":
        case "ArrowLeft":
            velrotate = 0;
            break;
    }
});

document.addEventListener("wheel", function(event) {
    const deltay = event.deltaY;
    if (deltay > 0) {
        camera.position.z += 1;
    } else if (deltay < 0) {
        camera.position.z -= 1;
    }
});

function update(time) {
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    
    // Move forward/backward
    camera.position.add(forward.clone().multiplyScalar(velz));
    
    // Calculate the right vector perpendicular to the forward direction
    let right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    
    console.log(forward.dot(right));
    
    // Move left/right
    camera.position.add(right.clone().multiplyScalar(velx));
    
    // Apply vertical movement (if any)
    camera.position.y += vely;
    
    // Apply rotation
    camera.rotation.y -= velrotate * Math.PI / 180;
    
    requestAnimationFrame(update);
}

requestAnimationFrame(update);