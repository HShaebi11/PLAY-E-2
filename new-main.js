// =============================================
//              CONFIGURATION
// =============================================
const CONFIG = {
    GRID: { 
        COLS: 20, 
        ROWS: 20, 
        ALPHA: 200 
    },
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        POSITION_Z: 5
    },
    MODEL_URL: 'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb'
};

export { CONFIG };

// =============================================
//              P5.JS SETUP
// =============================================
let grid = [];
let p5Canvas;

const P5Functions = {
    init() {
        return new p5(function(p) {
            p.setup = function() {
                P5Functions.setupCanvas(p);
                P5Functions.initializeGrid(p);
            };

            p.draw = function() {
                P5Functions.drawInteractiveGrid(p);
            };

            p.windowResized = function() {
                P5Functions.resizeCanvas(p);
            };
        });
    },

    setupCanvas(p) {
        const container = document.querySelector('#p5-container');
        p5Canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        p5Canvas.parent('p5-container');
        p5Canvas.style('display', 'block');
        p5Canvas.style('position', 'absolute');
        p5Canvas.style('top', '0');
        p5Canvas.style('left', '0');
        p5Canvas.style('z-index', '1');
        p.noStroke();
    },

    initializeGrid(p) {
        grid = [];
        const cellWidth = p.width / CONFIG.GRID.COLS;
        const cellHeight = p.height / CONFIG.GRID.ROWS;

        for (let i = 0; i < CONFIG.GRID.COLS; i++) {
            for (let j = 0; j < CONFIG.GRID.ROWS; j++) {
                grid.push({
                    x: i * cellWidth + cellWidth / 2,
                    y: j * cellHeight + cellHeight / 2,
                    baseRadius: cellWidth / 3
                });
            }
        }
    },

    drawInteractiveGrid(p) {
        p.background(30, CONFIG.GRID.ALPHA);
        
        grid.forEach(cell => {
            let d = p.dist(p.mouseX, p.mouseY, cell.x, cell.y);
            let maxDist = p.width / CONFIG.GRID.COLS;
            let radius = cell.baseRadius + p.map(p.constrain(d, 0, maxDist), 0, maxDist, 10, 0);
            let col = p.map(p.constrain(d, 0, maxDist), 0, maxDist, 255, 100);
            
            p.fill(col, 150, 255 - col, CONFIG.GRID.ALPHA);
            p.ellipse(cell.x, cell.y, radius);
        });
    },

    resizeCanvas(p) {
        const container = document.querySelector('#p5-container');
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        this.initializeGrid(p);
    }
};

export { P5Functions, p5Canvas };

// =============================================
//              THREE.JS SETUP
// =============================================
let scene, camera, renderer;
let controls, transformControls, model;
const threeContainer = document.getElementById('three-container');

const ThreeFunctions = {
    init() {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.loadModel();
        this.animate();
    },

    setupScene() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            threeContainer.offsetWidth / threeContainer.offsetHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        camera.position.z = CONFIG.CAMERA.POSITION_Z;

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        
        this.configureRenderer();
    },

    configureRenderer() {
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeContainer.appendChild(renderer.domElement);
        scene.background = null;

        Object.assign(renderer.domElement.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: '2',
            pointerEvents: 'auto'
        });
    },

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        scene.add(ambientLight, directionalLight);
    },

    setupControls() {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        Object.assign(controls, {
            enableDamping: true,
            dampingFactor: 0.05,
            enablePan: false,
            enableZoom: true,
            minDistance: 2,
            maxDistance: 10
        });
    },

    loadModel() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            CONFIG.MODEL_URL,
            this.handleModelLoad.bind(this),
            progress => console.log((progress.loaded / progress.total * 100) + '% loaded'),
            error => console.error('Model load error:', error)
        );
    },

    handleModelLoad(gltf) {
        model = gltf.scene;
        this.optimizeModel();
        this.centerModel();
        scene.add(model);
        UIFunctions.init();
    },

    optimizeModel() {
        model.traverse(child => {
            if (child.isMesh) {
                child.geometry.computeBoundingBox();
                child.geometry.computeVertexNormals();
            }
        });
    },

    centerModel() {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
    },

    animate() {
        animationFrameId = requestAnimationFrame(this.animate.bind(this));
        controls?.update();
        renderer.render(scene, camera);
    }
};

export { ThreeFunctions, scene, camera, renderer, model, controls };

// =============================================
//              UI SETUP
// =============================================
const UIFunctions = {
    init() {
        this.setupTransformControls();
        this.setupTweakPane();
        this.setupExportButton();
    },

    setupTransformControls() {
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        scene.add(transformControls);
        transformControls.attach(model);

        transformControls.addEventListener('change', () => renderer.render(scene, camera));
        transformControls.addEventListener('dragging-changed', 
            event => controls.enabled = !event.value
        );
    },

    setupTweakPane() {
        const pane = new Tweakpane.Pane();
        // Your existing Tweakpane setup...
    },

    setupExportButton() {
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export as PDF';
        exportButton.onclick = ExportFunctions.exportToPDF;
        document.body.appendChild(exportButton);
    }
};

export { UIFunctions };

// =============================================
//              EXPORT FUNCTIONS
// =============================================
const ExportFunctions = {
    exportToPDF() {
        const pdf = new jsPDF();
        pdf.addImage(renderer.domElement.toDataURL('image/png'), 'PNG', 10, 10);
        pdf.save('3d-model.pdf');
    }
};

export { ExportFunctions };

// =============================================
//              MAIN ENTRY POINT
// =============================================
let animationFrameId;

window.addEventListener('load', () => {
    P5Functions.init();
    ThreeFunctions.init();
});

// Resize handling
const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

resizeObserver.observe(threeContainer);

// Cleanup
window.addEventListener('unload', () => {
    controls?.dispose();
    transformControls?.dispose();
    renderer?.dispose();
    cancelAnimationFrame(animationFrameId);
    p5Canvas?.remove();
    resizeObserver.disconnect();
});