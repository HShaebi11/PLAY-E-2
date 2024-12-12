// Add WebGL compatibility check at the start
if ( !THREE.WEBGL.isWebGLAvailable() ) {
    const warning = THREE.WEBGL.getWebGLErrorMessage();
    document.getElementById('three-container').appendChild(warning);
}

// Set up renderer with specific Safari-friendly settings
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true
});

// Add pixel ratio handling for Retina displays
renderer.setPixelRatio(window.devicePixelRatio);

// Start directly with Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,  // Field of view (smaller for more natural perspective)
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Set better camera position
camera.position.set(0, 2, 5);  // Adjusted position
camera.lookAt(0, 0, 0);  // Make camera look at center

// Enhance lighting setup
const light = new THREE.DirectionalLight(0xffffff, 1); // Increased intensity
light.position.set(5, 5, 5);
scene.add(light);

// Add more lights for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Brighter ambient light
scene.add(ambientLight);

// Add subtle front light
const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
frontLight.position.set(0, 0, 5);
scene.add(frontLight);

// Get parent element dimensions
const container = document.getElementById('three-container');
const parentWidth = container.clientWidth;
const parentHeight = container.clientHeight;

renderer.setSize(parentWidth, parentHeight);
container.appendChild(renderer.domElement);

// Add GLTFLoader
const loader = new THREE.GLTFLoader();

let model; // Define model variable to use it in animation

// Configuration Variables
const CONFIG = {
    version: '1.0.0',
    model: {
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0.01,
            y: 0.01,
            z: 0
        },
        scale: {
            x: 2,
            y: 2,
            z: 2
        },
    },
    camera: {
        position: {
            x: 0,
            y: 0,
            z: 10
        }
    }
};

// Simple color variable at the top
const modelColor = 0xff0000; // Red color (change this hex value as needed)

// Control variables
let controls = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color: 0xff0000
};

// Setup control listeners
function setupControls() {
    // Position controls
    document.getElementById('posX').addEventListener('input', (e) => {
        controls.position.x = parseFloat(e.target.value);
        if (model) model.position.x = controls.position.x;
    });
    document.getElementById('posY').addEventListener('input', (e) => {
        controls.position.y = parseFloat(e.target.value);
        if (model) model.position.y = controls.position.y;
    });
    document.getElementById('posZ').addEventListener('input', (e) => {
        controls.position.z = parseFloat(e.target.value);
        if (model) model.position.z = controls.position.z;
    });

    // Rotation controls
    document.getElementById('rotX').addEventListener('input', (e) => {
        controls.rotation.x = parseFloat(e.target.value);
        if (model) model.rotation.x = controls.rotation.x;
    });
    document.getElementById('rotY').addEventListener('input', (e) => {
        controls.rotation.y = parseFloat(e.target.value);
        if (model) model.rotation.y = controls.rotation.y;
    });
    document.getElementById('rotZ').addEventListener('input', (e) => {
        controls.rotation.z = parseFloat(e.target.value);
        if (model) model.rotation.z = controls.rotation.z;
    });

    // Color control
    document.getElementById('modelColor').addEventListener('input', (e) => {
        controls.color = e.target.value;
        if (model) {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.setStyle(controls.color);
                    child.material.emissive.setStyle(controls.color);
                }
            });
        }
    });
}

// Call setup after DOM is loaded
document.addEventListener('DOMContentLoaded', setupControls);

// Load the 3D model
loader.load(
    'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
    function (gltf) {
        model = gltf.scene;
        
        // Apply initial position
        model.position.set(controls.position.x, controls.position.y, controls.position.z);
        
        // Apply initial rotation
        model.rotation.set(controls.rotation.x, controls.rotation.y, controls.rotation.z);

        // Apply material and color
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: controls.color,
                    metalness: 0.3,
                    roughness: 0.4,
                    emissive: controls.color,
                    emissiveIntensity: 0.2
                });
                child.material.needsUpdate = true;
            }
        });
        
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened:', error);
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'absolute';
        errorMessage.style.top = '50%';
        errorMessage.style.width = '100%';
        errorMessage.style.textAlign = 'center';
        errorMessage.innerHTML = 'Error loading 3D content';
        document.getElementById('three-container').appendChild(errorMessage);
    }
);

// Update camera position
camera.position.set(
    CONFIG.camera.position.x,
    CONFIG.camera.position.y,
    CONFIG.camera.position.z
);

// Mouse interaction variables
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();

// Handle mouse movement
function onMouseMove(event) {
    // Calculate mouse position relative to container
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / parentWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / parentHeight) * 2 + 1;
    
    // Smooth follow
    target.x = mouse.x * 0.5;
    target.y = mouse.y * 0.5;
}
window.addEventListener('mousemove', onMouseMove);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (model) {
        // Only apply mouse follow, rotations now controlled by sliders
        model.position.x += (target.x - model.position.x) * 0.05;
        model.position.y += (target.y - model.position.y) * 0.05;
    }
    
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Add proper cleanup for Safari
window.addEventListener('beforeunload', function() {
    renderer.dispose();
    if (model) {
        model.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
    }
});