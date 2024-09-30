import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const canvas = document.getElementById('three-canvas');
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
const rotateButton = document.getElementById('emote');
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

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.carousel');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  let items = [];
  let indicators = [];
  let isScrolling = false;


  // Fetch JSON data from your file
  fetch('./merch.json')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Create carousel items and indicators based on fetched data
      createCarouselItems(data.merch);
      updateCarouselIndicators();
      addScrollListener();  // Attach the scroll listener once items are created
    })
    .catch(error => console.error('Error fetching data:', error));

  // Create carousel items dynamically
  function createCarouselItems(merch) {
    const carouselWrapper = document.querySelector('.carousel');
    carouselWrapper.innerHTML = '';  // Clear existing items

    let currentItem = document.createElement('div');
    currentItem.classList.add('carousel-item', 'active');  // Start with active item

    merch.forEach((item, index) => {
      const itemCard = document.createElement('div');
      itemCard.classList.add('item-card');

      itemCard.innerHTML = `
        <a href="./item_page.html?id=${item.id}">
          <div class="item-card">
            <div class="image-container">
              <img src="${item.image}" alt="${item.streamer_name}">
              <p class="text-overlay top-text small-text">${item.streamer_name}</p>
              <p class="text-overlay bottom-text small-text">
                <img src="./money_icon.png" alt="menu" class="icon-image"> ${item.price}
              </p>
            </div>
          </div>
        </a>
      `;

      currentItem.appendChild(itemCard);

      // Group cards in sets of 3
      if ((index + 1) % 3 === 0) {
        carouselWrapper.appendChild(currentItem);
        currentItem = document.createElement('div');
        currentItem.classList.add('carousel-item');
      }
    });

    // Append any remaining cards
    if (currentItem.children.length > 0) {
      carouselWrapper.appendChild(currentItem);
    }

    // Update items array after creation
    items = document.querySelectorAll('.carousel-item');
  }

  // Create and update carousel indicators
  function updateCarouselIndicators() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    indicatorsContainer.innerHTML = '';  // Clear existing indicators

    carouselItems.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('carousel-indicator');
      if (index === 0) indicator.classList.add('active');  // Set first as active
      indicatorsContainer.appendChild(indicator);

      // Add event listener for indicator click
      indicator.addEventListener('click', () => changeActiveSlide(index));
    });

    // Update indicators array after creation
    indicators = document.querySelectorAll('.carousel-indicator');
  }

  // Change active slide based on indicator click
  function changeActiveSlide(index) {
    if (isScrolling) return; // Prevent new click events while scrolling
  
    const carouselItems = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.carousel-indicator');
  
    // Update the active class for carousel items
    carouselItems.forEach((item, i) => {
      if (i === index) {
          item.classList.add('active');
          item.style.pointerEvents = 'auto'; // Enable clicks for active item
      } else {
          item.classList.remove('active');
          item.style.pointerEvents = 'none'; // Disable clicks for inactive items
      }
  });
  
    // Update the active class for indicators
    indicators.forEach((indicator, i) => {
      if (i === index) indicator.classList.add('active');
      else indicator.classList.remove('active');
  });
  
    // Scroll to the correct carousel item
    carouselItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
    // Ensure proper scrolling completion
    isScrolling = true;
    setTimeout(() => {
      isScrolling = false;
    }, 500); // Adjust the time based on scroll duration
  }
  

  // Handle scroll behavior for carousel
  function addScrollListener() {
    carousel.addEventListener('scroll', () => {
      let activeIndex = -1;  // Track active slide index
      const isTablet = window.innerWidth <= 1300 && window.innerWidth > 560;
      const isMobile = window.innerWidth <= 560;
      let paddingOffset = 0;

      if (isTablet) paddingOffset = window.innerHeight * 0.2;
      else if (isMobile) paddingOffset = window.innerHeight * 0.08;

      // Determine which item is currently visible
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const halfway = (window.innerHeight / 2) + paddingOffset;

        if (rect.top <= halfway && rect.bottom >= halfway) {
          item.classList.add('active');
          indicators[index]?.classList.add('active');
          activeIndex = index;
        } else {
          item.classList.remove('active');
          indicators[index]?.classList.remove('active');
        }
      });

      // Update opacity based on active index
      items.forEach((item, index) => {
        if (index < activeIndex) {
          item.style.opacity = (isTablet || isMobile) ? '0' : '0.5';
        } else if (index === activeIndex) {
          item.style.opacity = '1';
        } else {
          item.style.opacity = '0.5';
        }
      });
    });
  }

  // Handle wrapping sections based on screen width
  function wrapSections() {
    const screenWidth = window.innerWidth;
    const section1 = document.querySelector('.section-1');
    const section2 = document.querySelector('.section-2');
    const parentDiv = document.querySelector('.mobile-section-view');

    if (screenWidth <= 1300 && !parentDiv) {
      const newParentDiv = document.createElement('div');
      newParentDiv.classList.add('mobile-section-view');
      section1.parentNode.insertBefore(newParentDiv, section1);
      newParentDiv.appendChild(section1);
      newParentDiv.appendChild(section2);
    } else if (screenWidth > 1300 && parentDiv) {
      parentDiv.parentNode.insertBefore(section1, parentDiv);
      parentDiv.parentNode.insertBefore(section2, parentDiv);
      parentDiv.remove();
    }
  }

  // Call wrapSections initially and on window resize
  wrapSections();
  window.addEventListener('resize', wrapSections);
});


