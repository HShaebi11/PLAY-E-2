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
    camera.position.z = 5; // Move camera back to see the model

    // Initialize renderer if not already done
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
    }
    
    // Setup renderer
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(renderer.domElement);

    // Style Three.js canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '2';
    renderer.domElement.style.pointerEvents = 'auto';

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

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (controls) {
            controls.update();
        }
        
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