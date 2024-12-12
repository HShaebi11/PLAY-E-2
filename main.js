alert("Hello, It's Play (E) Tiny 01");

// Set up Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Create geometry and material
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Green color
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Position camera
camera.position.z = 5;

// Mouse interaction variables
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();

// Handle mouse movement
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Smooth follow
    target.x = mouse.x * 0.5;
    target.y = mouse.y * 0.5;
}
window.addEventListener('mousemove', onMouseMove);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth cube rotation based on mouse position
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.position.x += (target.x - cube.position.x) * 0.05;
    cube.position.y += (target.y - cube.position.y) * 0.05;
    
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});