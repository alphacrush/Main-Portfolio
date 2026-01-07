import * as THREE from 'three';
import { GLTFLoader } from './libs/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from './libs/jsm/renderers/CSS3DRenderer.js';
import { EffectComposer } from './libs/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './libs/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './libs/jsm/postprocessing/UnrealBloomPass.js';

// --- CALIBRATION ---
const WEB_WIDTH = '500px';
const WEB_HEIGHT = '297px';
const SCREEN_SCALE = 0.008;
const SCREEN_X = 0;
const SCREEN_Y = 0;
const SCREEN_Z = 0.21;
const ROTATION_X = -18.9;
const ROTATION_Y = 0;
const ROTATION_Z = 0;
const BG_COLOR = 'transparent';

// 1. SCENE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Camera Position (Kept your value)
camera.position.set(0, 0, 4);

// 2. WEBGL RENDERER
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.domElement.style.position = 'absolute';
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 3. CSS RENDERER
const labelRenderer = new CSS3DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('css-container').appendChild(labelRenderer.domElement);

// 4. BLOOM (GLOW EFFECT)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ==========================================
// 5. CONTROLS (RELAXED MOVEMENT - Kept your values)
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- MOVEMENT SETTINGS ---
controls.enablePan = false;           // Keep console centered

// ZOOM LIMITS
controls.minDistance = 3.0;           // Allow getting closer
controls.maxDistance = 8.0;

// VERTICAL LIMITS (Up/Down) - RELAXED
// 0.1 = Almost top-down view
// Math.PI / 2 = Floor level (Horizontal)
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stop just before hitting floor

// HORIZONTAL LIMITS (Left/Right) - RELAXED
// Math.PI / 1.2 = Allows rotating almost to the back
controls.minAzimuthAngle = -Math.PI / 1.8;
controls.maxAzimuthAngle = Math.PI / 1.8;

// 6. LIGHTS
const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const rimLight = new THREE.SpotLight(0x8a8aff, 5);
rimLight.position.set(-5, 5, -5);
rimLight.lookAt(0, 0, 0);
scene.add(rimLight);

// 7. GROUP
const consoleGroup = new THREE.Group();
scene.add(consoleGroup);

const screenLight = new THREE.PointLight(0xffffff, 0.5, 2);
screenLight.position.set(SCREEN_X, SCREEN_Y, SCREEN_Z + 0.2);
consoleGroup.add(screenLight);

// 8. LOAD MODEL
const loader = new GLTFLoader();
loader.load('game_console.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);

    model.traverse((node) => {
        if (node.isMesh) {
            node.material.transparent = false;
            node.material.opacity = 1.0;
            node.material.roughness = 0.5;
            node.material.metalness = 0.5;
            node.material.side = THREE.FrontSide;

            if (node.material.color) {
                const color = node.material.color;
                const brightness = color.r + color.g + color.b;

                if (brightness > 2.0) {
                    node.material.emissive = new THREE.Color(0xffffff);
                    node.material.emissiveIntensity = 3.0;
                    node.material.toneMapped = false;
                }
                else {
                    node.material.emissive = new THREE.Color(0x000000);
                    node.material.emissiveIntensity = 0;
                }
            }
        }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    consoleGroup.add(model);
}, undefined, (error) => { console.error("Error:", error); });

// 9. CREATE WEBSITE
const div = document.createElement('div');
div.style.width = WEB_WIDTH;
div.style.height = WEB_HEIGHT;
div.style.backgroundColor = BG_COLOR;

div.style.pointerEvents = 'auto';
// Stop rotation when hovering the screen
div.addEventListener('mouseenter', () => { controls.enabled = false; });
div.addEventListener('mouseleave', () => { controls.enabled = true; });

const iframe = document.createElement('iframe');
iframe.src = 'portfolio.html';
iframe.style.width = '100%';
iframe.style.height = '100%';
iframe.style.border = '0';
iframe.style.pointerEvents = 'auto';
div.appendChild(iframe);

const object3D = new CSS3DObject(div);
object3D.position.set(SCREEN_X, SCREEN_Y, SCREEN_Z);
object3D.scale.set(SCREEN_SCALE, SCREEN_SCALE, SCREEN_SCALE);
object3D.rotation.x = ROTATION_X * (Math.PI / 180);
object3D.rotation.y = ROTATION_Y * (Math.PI / 180);
object3D.rotation.z = ROTATION_Z * (Math.PI / 180);

consoleGroup.add(object3D);

// ==========================================
// 🖱️ ADDED: MOUSE TRACKING FOR HOVER EFFECT
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // This is used for clicking AND hovering now

// Update mouse position constantly
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// 10. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // --- ADDED: HOVER PARALLAX LOGIC ---
    // Gently rotates the console based on mouse position
    const targetX = mouse.y * 0.1; // Vertical tilt amount
    const targetY = mouse.x * 0.1; // Horizontal tilt amount

    // Smoothly interpolate current rotation to target (0.05 = smoothing speed)
    consoleGroup.rotation.x += 0.05 * (targetX - consoleGroup.rotation.x);
    consoleGroup.rotation.y += 0.05 * (targetY - consoleGroup.rotation.y);
    // ------------------------------------

    const screenDirection = new THREE.Vector3(0, 0, 1);
    screenDirection.applyQuaternion(consoleGroup.quaternion);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const dotProduct = screenDirection.dot(cameraDirection);

    if (dotProduct < -0.1) {
        div.style.opacity = 1;
    } else {
        div.style.opacity = 0;
    }

    composer.render();
    labelRenderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 🎮 CONSOLE BUTTON LOGIC
// ==========================================

window.addEventListener('click', (event) => {
    // Mouse is already updated via 'mousemove' listener above, 
    // but we set it again here just to be safe for clicks.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(consoleGroup.children, true);

    if (intersects.length > 0) {
        let buttonHit = null;

        for (let i = 0; i < intersects.length; i++) {
            const name = intersects[i].object.name;
            if (name.includes("Button") || name.includes("D_Pad") || name.includes("Circle")) {
                buttonHit = intersects[i];
                break;
            }
        }

        if (buttonHit) {
            handleSmartClick(buttonHit);
        }
    }
});

function handleSmartClick(hit) {
    const name = hit.object.name;
    const web = iframe.contentWindow;
    const doc = iframe.contentWindow.document;

    // Updated selector for T10 Structure
    const scrollBox = doc.getElementById('main-scroll') || doc.querySelector('.scroll-content') || web.document.body;

    console.log("🖱️ CLICKED:", name);

    if (name.includes("D_Pad")) {
        const localPoint = hit.object.worldToLocal(hit.point.clone());
        const sensitivity = 0.005;

        if (localPoint.y > sensitivity) {
            scrollBox.scrollBy({ top: -100, behavior: 'smooth' }); // Scroll Up
        }
        else if (localPoint.y < -sensitivity) {
            scrollBox.scrollBy({ top: 100, behavior: 'smooth' }); // Scroll Down
        }
    }

    if (name.includes("Button_A") || name.includes("Circle")) {
        // T10 uses 'main-btn' class
        const primaryBtn = doc.querySelector('.main-btn') || doc.querySelector('button');
        if (primaryBtn) {
            primaryBtn.click();
            primaryBtn.style.transform = "scale(0.95)";
            setTimeout(() => primaryBtn.style.transform = "scale(1)", 100);
        }
    }

    if (name.includes("Button_B")) {
        scrollBox.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// 🔀 2D/3D SWITCHER LOGIC (Keep this exposed)
// ==========================================
window.toggleDimensions = function () {
    const body = document.body;
    const icon = document.getElementById('toggle-icon');
    const text = document.getElementById('toggle-text');

    body.classList.toggle('flat-mode');

    if (body.classList.contains('flat-mode')) {
        // Switch to 2D Mode
        if (icon) icon.className = 'fas fa-cube';
        if (text) text.innerText = "RETURN TO 3D";
        controls.enabled = false; // Disable 3D Controls
    } else {
        // Switch to 3D Mode
        if (icon) icon.className = 'fas fa-expand';
        if (text) text.innerText = "SWITCH TO 2D";
        controls.enabled = true; // Enable 3D Controls
    }
}