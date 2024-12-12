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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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

// Load the 3D model
loader.load(
    'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
    function (gltf) {
        model = gltf.scene;
        
        // Apply scale
        model.scale.set(
            CONFIG.model.scale.x,
            CONFIG.model.scale.y,
            CONFIG.model.scale.z
        );
        
        // Apply initial position
        model.position.set(
            CONFIG.model.position.x,
            CONFIG.model.position.y,
            CONFIG.model.position.z
        );

        // Apply color to all materials
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: CONFIG.model.color,
                    emissive: 0x222222,
                    shininess: 30
                });
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
        // Apply rotation speeds
        model.rotation.x += CONFIG.model.rotation.x;
        model.rotation.y += CONFIG.model.rotation.y;
        model.rotation.z += CONFIG.model.rotation.z;
        
        // Mouse follow
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