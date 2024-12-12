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

// Enhance lighting setup
const light = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
light.position.set(5, 5, 5);
scene.add(light);

// Add more lights for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Brighter ambient light
scene.add(ambientLight);

// Add a point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

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
    color: 0xff0000,
    scale: 1
};

// Setup control listeners
function setupControls() {
    const controlsDiv = document.querySelector('.controls');
    if (!controlsDiv) {
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
    }
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

    // Add scale slider HTML
    const scaleDiv = document.createElement('div');
    scaleDiv.innerHTML = `
        <h3>Scale</h3>
        <label>Size: <input type="range" id="modelScale" min="0.1" max="5" step="0.1" value="1"></label>
    `;
    document.querySelector('.controls').appendChild(scaleDiv);

    // Add scale slider listener
    document.getElementById('modelScale').addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        if (model) {
            model.scale.set(scale, scale, scale);
        }
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

// Add transform controls variable
let transformControls;

// After scene setup, add this function
function setupTransformControls() {
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    transformControls.addEventListener('change', () => {
        if (model) {
            // Update position sliders
            document.getElementById('posX').value = model.position.x;
            document.getElementById('posY').value = model.position.y;
            document.getElementById('posZ').value = model.position.z;

            // Update rotation sliders
            document.getElementById('rotX').value = model.rotation.x;
            document.getElementById('rotY').value = model.rotation.y;
            document.getElementById('rotZ').value = model.rotation.z;
        }
        renderer.render(scene, camera);
    });

    // Add mode buttons to controls
    const transformDiv = document.createElement('div');
    transformDiv.innerHTML = `
        <h3>Transform Mode</h3>
        <button id="translateBtn">Translate</button>
        <button id="rotateBtn">Rotate</button>
        <button id="scaleBtn">Scale</button>
    `;
    document.querySelector('.controls').appendChild(transformDiv);

    // Add button event listeners
    document.getElementById('translateBtn').addEventListener('click', () => {
        transformControls.setMode('translate');
    });
    document.getElementById('rotateBtn').addEventListener('click', () => {
        transformControls.setMode('rotate');
    });
    document.getElementById('scaleBtn').addEventListener('click', () => {
        transformControls.setMode('scale');
    });
}

// Add display element creation
function createValueDisplay() {
    const displayDiv = document.createElement('div');
    displayDiv.id = 'valueDisplay';
    displayDiv.innerHTML = `
        <h3>Model Values</h3>
        <div class="value-group">
            <h4>Position</h4>
            <div class="input-group">
                X: <input type="number" id="posX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="posY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="posZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <h4>Rotation</h4>
            <div class="input-group">
                X: <input type="number" id="rotX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="rotY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="rotZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <h4>Scale</h4>
            <div id="scaleValues">X: 1, Y: 1, Z: 1</div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .value-group {
            margin: 10px 0;
            background: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 5px;
        }
        .input-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            margin-top: 5px;
        }
        .input-group input {
            width: 60px;
            background: rgba(255,255,255,0.9);
            border: 1px solid #666;
            padding: 3px;
            border-radius: 3px;
            color: black;
            cursor: text;
            pointer-events: auto;
        }
        .input-group input:focus {
            outline: 2px solid #0066ff;
            background: white;
        }
        h4 {
            margin: 0;
            font-size: 14px;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
    document.querySelector('.controls').appendChild(displayDiv);

    // Add event listeners for text inputs
    ['X', 'Y', 'Z'].forEach(axis => {
        // Position text inputs
        const posInput = document.getElementById(`pos${axis}-text`);
        posInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.position[axis.toLowerCase()] = value;
                document.getElementById(`pos${axis}`).value = value; // Update slider
            }
        });

        // Rotation text inputs
        const rotInput = document.getElementById(`rot${axis}-text`);
        rotInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.rotation[axis.toLowerCase()] = value;
                document.getElementById(`rot${axis}`).value = value; // Update slider
            }
        });
    });
}

// Add value update function
function updateValueDisplay() {
    if (model) {
        // Update text inputs
        ['X', 'Y', 'Z'].forEach(axis => {
            // Position
            document.getElementById(`pos${axis}-text`).value = 
                model.position[axis.toLowerCase()].toFixed(2);
            
            // Rotation
            document.getElementById(`rot${axis}-text`).value = 
                model.rotation[axis.toLowerCase()].toFixed(2);
        });

        // Update scale display
        document.getElementById('scaleValues').textContent = 
            `Scale: X: ${model.scale.x.toFixed(2)}, Y: ${model.scale.y.toFixed(2)}, Z: ${model.scale.z.toFixed(2)}`;
    }
}

// Load the 3D model
loader.load(
    'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
    function (gltf) {
        model = gltf.scene;
        
        // Apply initial scale
        model.scale.set(controls.scale, controls.scale, controls.scale);
        
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
        
        // Attach transform controls to model
        setupTransformControls();
        createValueDisplay();  // Add value display
        transformControls.attach(model);
        
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateValueDisplay();
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

// Add some CSS for the transform buttons
const style = document.createElement('style');
style.textContent = `
    .controls button {
        margin: 5px;
        padding: 5px 10px;
        background: #444;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    .controls button:hover {
        background: #666;
    }
`;
document.head.appendChild(style);

// Add transform controls change listener
transformControls.addEventListener('change', () => {
    updateValueDisplay();
    renderer.render(scene, camera);
});

// Add event listener for transform controls
transformControls.addEventListener('objectChange', () => {
    updateValueDisplay();
});