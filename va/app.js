import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let mixer;
const clock = new THREE.Clock();
let model;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF); // Set white background (#FFFFFF)

// Camera setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 5000); // Near plane set to 0.01 for close-up shots
camera.position.set(0, 0, 1); // Start closer to the model

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true; // Enable zooming
controls.enableRotate = true; // Allow rotation
controls.enablePan = true; // Allow panning

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Bright ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 2).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8); // Extra point light to illuminate model
pointLight.position.set(-2, -2, 3);
scene.add(pointLight);

// Load the model
const loader = new GLTFLoader();
loader.load(
    './assets/untitled.glb',  // Make sure the path is correct
    (gltf) => {
        model = gltf.scene;

        if (!model) {
            console.error("Model not loaded properly!");
            return;
        }

        console.log("Model loaded successfully!");

        // Scale and position adjustments if needed
        model.scale.set(1, 1, 1); // Ensure scale is appropriate
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.side = THREE.DoubleSide; // Disable backface culling
            }
        });

        // Center and fit model to camera view
        scene.add(model);  // Add model to the scene
        closeUpShot(model); // Set close-up shot
        console.log("Close-up shot set for model.");

        // Setup animations if available
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
    }
);

function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to set a close-up shot of the model
function closeUpShot(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Center the model in the scene
    model.position.sub(center);
    // Calculate the distance to fit a close-up shot
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180); // Convert to radians
    const closeupDistance = maxDim / (2 * Math.tan(fov / 2)); // Close-up camera distance

    // Set the camera close to the model for a close-up shot
    camera.position.set(0, 0, closeupDistance * 0.6); // Adjust distance for a close-up view
    camera.near = closeupDistance * 0.01; // Ensure near plane allows close zoom
    camera.far = closeupDistance * 1; // Ensure far plane covers the model depth
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    // Update OrbitControls min and max distances for close-up viewing
    controls.minDistance = closeupDistance * 0.1; // Allow very close zoom
    controls.maxDistance = closeupDistance * 1; // Limit zoom-out distance
}
