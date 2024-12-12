// Start directly with Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Get parent element dimensions
const container = document.getElementById('three-container');
const parentWidth = container.clientWidth;
const parentHeight = container.clientHeight;

renderer.setSize(parentWidth, parentHeight);
container.appendChild(renderer.domElement);

// Add GLTFLoader
const loader = new THREE.GLTFLoader();

let model; // Define model variable to use it in animation

// Load the 3D model
loader.load(
    'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
    function (gltf) {
        model = gltf.scene;
        
        // Scale the model (adjust these values as needed)
        model.scale.set(2, 2, 2);  // Makes the model 2x larger
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x += model.position.x - center.x;
        model.position.y += model.position.y - center.y;
        model.position.z += model.position.z - center.z;

        // Apply color to all materials in the model
        model.traverse((child) => {
            if (child.isMesh) {
                // Create a new material with the desired color
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x00ff00,  // Green color (change this to any hex color)
                    emissive: 0x222222,  // Slight glow
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
    }
);

// Adjust camera position to see the model better
camera.position.z = 10;  // Move camera further back

// Enhance lighting
const light = new THREE.DirectionalLight(0xffffff, 1.5);  // Increased intensity
light.position.set(5, 5, 5);  // Adjusted light position
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 2);  // Increased ambient light
scene.add(ambientLight);

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
        // Smooth model rotation and position based on mouse position
        model.rotation.x += 0.01;
        model.rotation.y += 0.01;
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