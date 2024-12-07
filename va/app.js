import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// Camera setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1.2, 3); // Set camera at waist level

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Ambient light
scene.add(ambientLight);

// Additional directional lights to illuminate the model evenly
const lightPositions = [
  [2, 5, 5],  // Front-right
  [-2, 5, 5], // Front-left
  [2, 5, -5], // Back-right
  [-2, 5, -5], // Back-left
];

lightPositions.forEach((pos) => {
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(...pos);
  scene.add(light);
});

// Load 3D model
const loader = new GLTFLoader();
loader.load(
  'assets/untitled.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1); // Adjust scale if needed
    model.position.set(0, 0, 0); // Center the model
    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('An error occurred:', error);
  }
);

// Orbit Controls for rotating the model, but no zoom or pan
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth controls
controls.enableRotate = true; // Enable rotation
controls.enableZoom = false; // Disable zooming
controls.enablePan = false;  // Disable panning
controls.target.set(0, 1, 0); // Focus on the center of the model
controls.maxDistance = 10; // Maximum zoom-out (won't be used since zooming is disabled)
controls.minDistance = 1.5; // Minimum zoom-in (won't be used since zooming is disabled)
controls.minPolarAngle = Math.PI / 4; // Prevent camera from looking too high
controls.maxPolarAngle = Math.PI / 1.8; // Prevent camera from looking too low

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to handle prompt submission and display a response
const handlePrompt = () => {
  const prompt = document.getElementById('chatbox').value;
  const responseDiv = document.getElementById('response');
  
  if (prompt.trim()) {
    // In a real case, here you'd send the prompt to a backend or process it further
    // For now, we simply show the prompt as the response
    responseDiv.textContent = `You said: ${prompt}`;
  }
};

// Listen for Enter key press to trigger prompt submission
document.getElementById('chatbox').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handlePrompt();
  }
});

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update(); // Update controls for smooth animation
  renderer.render(scene, camera);
};

animate();
