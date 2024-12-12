// Global variables
let controls;
let transformControls;
let model;
let scene;
let camera;

// Wait for THREE to be loaded before initializing
window.addEventListener('load', () => {
    // Initialize Three.js first
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Initialize renderer with alpha
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,  // Enable alpha
            preserveDrawingBuffer: true
        });
    }
    
    // Setup renderer for transparency
    renderer.setClearColor(0x000000, 0);  // Set clear color with 0 alpha
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(renderer.domElement);

    // Make scene background transparent
    scene.background = null;  // This makes the scene background transparent

    // Style Three.js canvas for transparency
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '2';
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.background = 'transparent';  // Ensure canvas background is transparent

    // Initialize controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Setup transform controls
    function setupTransformControls() {
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        scene.add(transformControls);

        transformControls.addEventListener('change', () => {
            renderer.render(scene, camera);
        });

        transformControls.addEventListener('dragging-changed', function (event) {
            if (controls) {
                controls.enabled = !event.value;
            }
        });
    }

    // Animation loop with transparency
    function animate() {
        requestAnimationFrame(animate);
        
        if (controls) {
            controls.update();
        }
        
        // Clear with transparency before rendering
        renderer.clear();
        renderer.render(scene, camera);
    }

    // Start animation
    animate();

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            setupTransformControls();
            transformControls.attach(model);
            createValueDisplay();
            addExportButton();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened:', error);
        }
    );

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
});

// Add WebGL compatibility check at the start
if ( !THREE.WEBGL.isWebGLAvailable() ) {
    const warning = THREE.WEBGL.getWebGLErrorMessage();
    document.getElementById('three-container').appendChild(warning);
}

// Set up renderer with specific Safari-friendly settings
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
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
            <div class="header-with-reset">
                <h4>Position</h4>
                <button class="reset-btn" id="resetPosition">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="posX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="posY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="posZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <div class="header-with-reset">
                <h4>Rotation</h4>
                <button class="reset-btn" id="resetRotation">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="rotX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="rotY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="rotZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <div class="header-with-reset">
                <h4>Scale</h4>
                <button class="reset-btn" id="resetScale">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="scaleX-text" step="0.1" value="1" min="0.1" style="color: black;">
                Y: <input type="number" id="scaleY-text" step="0.1" value="1" min="0.1" style="color: black;">
                Z: <input type="number" id="scaleZ-text" step="0.1" value="1" min="0.1" style="color: black;">
            </div>
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
        .header-with-reset {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        .reset-btn {
            background: #444;
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .reset-btn:hover {
            background: #666;
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

    // Add event listeners for all inputs including scale
    ['X', 'Y', 'Z'].forEach(axis => {
        // Position text inputs
        const posInput = document.getElementById(`pos${axis}-text`);
        posInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.position[axis.toLowerCase()] = value;
                document.getElementById(`pos${axis}`).value = value;
            }
        });

        // Rotation text inputs
        const rotInput = document.getElementById(`rot${axis}-text`);
        rotInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.rotation[axis.toLowerCase()] = value;
                document.getElementById(`rot${axis}`).value = value;
            }
        });

        // Scale text inputs
        const scaleInput = document.getElementById(`scale${axis}-text`);
        scaleInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = Math.max(0.1, parseFloat(e.target.value));
                model.scale[axis.toLowerCase()] = value;
                // Update uniform scale slider if it exists
                if (document.getElementById('modelScale')) {
                    document.getElementById('modelScale').value = value;
                }
            }
        });
    });

    // Update reset handlers
    document.getElementById('resetPosition').addEventListener('click', () => {
        if (model) {
            model.position.set(0, 0, 0);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`pos${axis}`).value = 0;
            });
        }
    });

    document.getElementById('resetRotation').addEventListener('click', () => {
        if (model) {
            model.rotation.set(0, 0, 0);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`rot${axis}`).value = 0;
            });
        }
    });

    document.getElementById('resetScale').addEventListener('click', () => {
        if (model) {
            model.scale.set(1, 1, 1);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`scale${axis}-text`).value = 1;
            });
            if (document.getElementById('modelScale')) {
                document.getElementById('modelScale').value = 1;
            }
        }
    });
}

// Add value update function
function updateValueDisplay() {
    if (model) {
        ['X', 'Y', 'Z'].forEach(axis => {
            // Position
            document.getElementById(`pos${axis}-text`).value = 
                model.position[axis.toLowerCase()].toFixed(2);
            
            // Rotation
            document.getElementById(`rot${axis}-text`).value = 
                model.rotation[axis.toLowerCase()].toFixed(2);
            
            // Scale
            document.getElementById(`scale${axis}-text`).value = 
                model.scale[axis.toLowerCase()].toFixed(2);
        });
    }
}

// Add export button to controls
function addExportButton() {
    const exportDiv = document.createElement('div');
    exportDiv.className = 'value-group';
    exportDiv.innerHTML = `
        <div class="header-with-reset">
            <h4>Export</h4>
            <button class="export-btn" id="exportPDF">Export as PDF</button>
        </div>
    `;
    
    // Add export button styles
    const style = document.createElement('style');
    style.textContent += `
        .export-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        .export-btn:hover {
            background: #45a049;
        }
    `;
    document.head.appendChild(style);
    
    document.querySelector('.controls').appendChild(exportDiv);
    
    // Add click event with console logging
    const exportButton = document.getElementById('exportPDF');
    exportButton.addEventListener('click', function() {
        console.log('Export button clicked');
        try {
            captureAndExport();
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Check console for details.');
        }
    });
}

// Updated capture and export function
function captureAndExport() {
    console.log('Starting export process');
    
    // Ensure jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded');
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }

    try {
        // Temporarily hide transform controls
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        
        // Force a render without controls
        renderer.render(scene, camera);
        
        // Get the canvas
        const canvas = renderer.domElement;
        console.log('Canvas captured:', canvas.width, 'x', canvas.height);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        // Get the image data
        const imgData = canvas.toDataURL('image/png', 1.0);
        console.log('Image data captured');
        
        // Calculate dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Add the image
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Add metadata
        const date = new Date();
        pdf.setFontSize(12);
        pdf.text(`Export Date: ${date.toLocaleString()}`, 10, pdfHeight + 20);
        
        // Save
        console.log('Saving PDF...');
        pdf.save(`3D_Model_${Date.now()}.pdf`);
        console.log('PDF saved');
        
        // Restore transform controls visibility
        transformControls.visible = wasVisible;
        
        // Re-render with controls
        renderer.render(scene, camera);
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Check console for details.');
        
        // Make sure to restore transform controls visibility even if export fails
        transformControls.visible = true;
        renderer.render(scene, camera);
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
        addExportButton();  // Add export button
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