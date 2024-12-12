// Add WebGL compatibility check at the start
if ( !THREE.WEBGL.isWebGLAvailable() ) {
    const warning = THREE.WEBGL.getWebGLErrorMessage();
    document.getElementById('three-container').appendChild(warning);
}

// Global variables
let controls;
let transformControls;
let model;
let scene;
let camera;
let renderer;
let animationFrameId; // For cleanup

// Performance optimization
const clock = new THREE.Clock();
const FRAME_RATE = 60;
const frameTime = 1 / FRAME_RATE;
let delta = 0;

window.addEventListener('load', () => {
    initScene();
    initLights();
    initControls();
    loadModel();
    animate();
});

// Split initialization into functions
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance" // Optimize for performance
    });
    
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    threeContainer.appendChild(renderer.domElement);

    scene.background = null;

    // Style renderer
    Object.assign(renderer.domElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '2',
        pointerEvents: 'auto'
    });
}

function initLights() {
    // Use InstancedMesh for multiple lights if needed
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(ambientLight, directionalLight); // Batch add to scene
}

function initControls() {
    if (controls) controls.dispose();
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false; // Disable if not needed
    controls.enableZoom = true;
    controls.minDistance = 2; // Add limits if possible
    controls.maxDistance = 10;
}

function setupTransformControls() {
    if (transformControls) transformControls.dispose();
    
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    // Use object pooling for events
    const onTransformChange = () => renderer.render(scene, camera);
    const onDraggingChanged = (event) => {
        if (controls) controls.enabled = !event.value;
    };

    transformControls.addEventListener('change', onTransformChange);
    transformControls.addEventListener('dragging-changed', onDraggingChanged);
}

function animate() {
    delta += clock.getDelta();

    if (delta > frameTime) {
        if (controls) controls.update();
        renderer.render(scene, camera);
        delta = delta % frameTime; // Keep remainder for next frame
    }

    animationFrameId = requestAnimationFrame(animate);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    
    // Optional: Add loading manager for better resource handling
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
        console.log(`Loading: ${(loaded / total * 100)}%`);
    };

    loader.setLoadingManager(loadingManager);
    
    loader.load(
        'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
        (gltf) => {
            model = gltf.scene;
            
            // Optimize model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeBoundingBox();
                    child.geometry.computeVertexNormals();
                    // Optional: child.geometry.attributes.position.needsUpdate = false;
                }
            });
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            scene.add(model);
            setupTransformControls();
            transformControls.attach(model);
            createValueDisplay();
            addExportButton();
            
            renderer.render(scene, camera);
        },
        null,
        console.error
    );
}

// Efficient resize handler
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
});

resizeObserver.observe(document.getElementById('three-container'));

// Cleanup
window.addEventListener('unload', () => {
    if (controls) controls.dispose();
    if (transformControls) transformControls.dispose();
    if (renderer) renderer.dispose();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
});