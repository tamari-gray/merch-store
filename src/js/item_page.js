import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const canvas = document.getElementById('three-canvas-2');
const loader = new GLTFLoader();

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); 
renderer.setAnimationLoop(animate);

// Set up lighting
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

let model;

// Load GLTF model
loader.load(
  'blue.glb',
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
    model.position.set(0, -0.8, 2.05);
    model.scale.set(1, 1, 1);  // Adjust as needed
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('An error occurred while loading the GLTF model:', error);
  }
);

// Orthographic camera setup
const aspectRatio = canvas.clientWidth / canvas.clientHeight;
const zoom = 1; // Adjust the zoom level based on your scene

const camera = new THREE.OrthographicCamera(
  -aspectRatio * zoom,  // Left
  aspectRatio * zoom,   // Right
  zoom,                 // Top
  -zoom,                // Bottom
  0.1,                  // Near plane
  1000                  // Far plane
);

camera.position.set(0, 0, 10); // Adjust position based on your scene
camera.lookAt(0, 0, 0); // Make sure the camera is looking at the model
scene.add(camera);

// Animate and render the scene
function animate() {
  renderer.render(scene, camera);
}

// Emote button functionality with synced audio
const rotateButton = document.getElementById('emote-2');
const audio = new Audio('emote.mp3'); // Replace with the correct path to your audio file
audio.volume = 0.7;

rotateButton.addEventListener('click', () => {
  playEmoteWithAudio();
});

let isRotating = false;
const numberOfSpins = 3; 

function playEmoteWithAudio() {
  if (!model || isRotating) return;
  isRotating = true;

  const startRotation = model.rotation.y;
  const targetRotation = startRotation + (Math.PI * 2 * numberOfSpins); // 360 degrees in radians

  let startTime = null;

  // Play the audio when the emote starts
  audio.currentTime = 0;
  audio.play();

  function rotate(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / 7000;
    model.rotation.y = startRotation + progress * (Math.PI * 2 * numberOfSpins);

    if (progress < 1) {
      requestAnimationFrame(rotate);
    } else {
      model.rotation.y = targetRotation;
      isRotating = false;
      // Optional: Stop the audio once the rotation is done
      audio.pause();
    }
  }

  requestAnimationFrame(rotate);
}







// load content in
document.addEventListener('DOMContentLoaded', () => {
  handleQuantity();
  handleSizeChoice();
  handleColorChoice();
  
  // Get the query parameter (item ID)
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  if (!itemId) {
    console.error('No item ID found in the URL.');
    return;
  }

  // Fetch the data from your merch.json file
  fetch('./merch.json')
    .then(response => response.json())
    .then(data => {
      // Find the item based on the item ID
      const selectedItem = data.merch.find(item => item.id === parseInt(itemId));

      if (!selectedItem) {
        console.error('Item not found.');
        return;
      }

      // Display the item's details on the page
      displayItemDetails(selectedItem);
    })
    .catch(error => console.error('Error fetching item data:', error));

  // Function to update the item details on the page
  function displayItemDetails(item) {
    const itemName = document.querySelector('.item-title');
    const itemPrice = document.querySelector('.item-outfit-title');
    console.log(item.price)

    // Set the content based on the selected item's data
    itemName.textContent = item.streamer_name;
    itemPrice.textContent = `$${item.price}`;
  }
});

function handleQuantity(){
  const quantityElement = document.getElementById('quantity');
  const increaseBtn = document.getElementById('increase');
  const decreaseBtn = document.getElementById('decrease');

  // Convert the quantity text to a number for calculations
  let quantity = parseInt(quantityElement.textContent, 10);

  // Handle increase button click
  increaseBtn.addEventListener('click', () => {
    quantity += 1; // Increment the quantity
    quantityElement.textContent = quantity; // Update the displayed value
  });

  // Handle decrease button click
  decreaseBtn.addEventListener('click', () => {
    if (quantity > 1) { // Prevent quantity from going below 1
      quantity -= 1; // Decrement the quantity
      quantityElement.textContent = quantity; // Update the displayed value
    }
  });
}

function handleSizeChoice(){
  const sizeCards = document.querySelectorAll('.mini-card-size');

  sizeCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove 'selected' class from all cards
      sizeCards.forEach(c => c.classList.remove('selected'));

      // Add 'selected' class to the clicked card
      card.classList.add('selected');
    });
  });
}

function handleColorChoice(){
  const colorCards = document.querySelectorAll('.color-card');

  colorCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove 'selected' class from all color cards
      colorCards.forEach(c => c.classList.remove('selected'));

      // Add 'selected' class to the clicked color card
      card.classList.add('selected');
    });
  });

}
