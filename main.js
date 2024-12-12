// Global variables
let controls, transformControls, model, scene, camera, renderer;

// Initialize Three.js scene and components
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(renderer.domElement);

    scene.background = null;

    // Add lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 1, 1);
    scene.add(dirLight);

    // Style renderer canvas
    Object.assign(renderer.domElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '2',
        pointerEvents: 'auto'
    });
}

// Initialize controls
function initControls() {
    if (controls) controls.dispose();
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

// Setup transform controls
function setupTransformControls() {
    if (transformControls) transformControls.dispose();
    
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    transformControls.addEventListener('change', () => renderer.render(scene, camera));
    transformControls.addEventListener('dragging-changed', event => {
        if (controls) controls.enabled = !event.value;
    });
}

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
};

// Handle window resize
const onWindowResize = () => {
    const container = document.getElementById('three-container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

// Initialize everything on load
window.addEventListener('load', () => {
    // Check WebGL compatibility
    if (!THREE.WEBGL.isWebGLAvailable()) {
        const warning = THREE.WEBGL.getWebGLErrorMessage();
        document.getElementById('three-container').appendChild(warning);
        throw new Error('WebGL not available');
    }

    initThreeJS();
    initControls();
    animate();

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
        gltf => {
            model = gltf.scene;
            
            // Center model
            const box = new THREE.Box3().setFromObject(model);
            model.position.sub(box.getCenter(new THREE.Vector3()));
            
            scene.add(model);
            setupTransformControls();
            transformControls.attach(model);
            createValueDisplay();
            addExportButton();
            
            renderer.render(scene, camera);
        },
        xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        error => console.error('Loading error:', error)
    );

    window.addEventListener('resize', onWindowResize, false);
});

// Cleanup on unload
window.addEventListener('unload', () => {
    controls?.dispose();
    transformControls?.dispose();
    renderer?.dispose();
});

// Get container dimensions
const container = document.getElementById('three-container');
const parentWidth = container.clientWidth;
const parentHeight = container.clientHeight;

// Configuration 
const CONFIG = {
    version: '1.0.0',
    model: {
        position: {x: 0, y: 0, z: 0},
        rotation: {x: 0.01, y: 0.01, z: 0},
        scale: {x: 2, y: 2, z: 2},
    },
    camera: {
        position: {x: 0, y: 0, z: 10}
    }
};

// Control state
const controlState = {
    position: {x: 0, y: 0, z: 0},
    rotation: {x: 0, y: 0, z: 0},
    color: 0xff0000,
    scale: 1
};

// Setup UI controls
function setupControls() {
    const controlsDiv = document.querySelector('.controls') || createControlsDiv();
    
    setupPositionControls();
    setupRotationControls();
    setupScaleControls();
    setupColorControls();
}

function createControlsDiv() {
    const div = document.createElement('div');
    div.className = 'controls';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        padding: 20px;
        color: white;
        z-index: 100;
        pointer-events: auto;
    `;
    document.body.appendChild(div);
    return div;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupControls);

// Rest of the code remains the same...
// (The remaining functions like setupTransformControls, createValueDisplay, etc. 
// can be kept as is since they're already well-structured)