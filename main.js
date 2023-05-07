// create the scene

const OBJLoader = THREE.OBJLoader;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
scene.background = new THREE.Color(211 / 255, 211 / 255, 211 / 255);

// // create the camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);

scene.add(camera);

// create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// //load the texture
const previewTexture = textureLoader.load('assets/silk_scarf/silk_scarf_preview.png');
previewTexture.minFilter = THREE.LinearMipmapLinearFilter;
previewTexture.anisotropy = 16;// const adjustedTexture = adjustTextureBrightness(previewTexture, 1);
const planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ map: previewTexture, side: THREE.DoubleSide });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

// define an array of textures
const textures = [
  {
    name: 'pattern',
    file: 'assets/patterns/1_texture_3d.jpg',
  },
];

let currentTextureIndex = 0;

// create a function to update the shirt material with the current texture
function updateShirtMaterial() {
  const shirtTexture = textureLoader.load(textures[currentTextureIndex].file);
  const previewTexture = textureLoader.load('assets/patterns/1_texture_13d.jpg');

  const shirtMaterial = new THREE.MeshPhongMaterial({
    map: shirtTexture,
    alphaMap: previewTexture,
    transparent: true,
    side: THREE.DoubleSide,
    shininess: 10,
  });
    

  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.material = shirtMaterial;
    }
  });
}
    //load the 3d model
const objLoader = new THREE.OBJLoader();
objLoader.load('assets/silk_scarf/silk_scarf_3d_model.obj', (shirtMesh) => {
  shirtMesh.name = 'Fabric_Plane.002';
  scene.add(shirtMesh);
  updateShirtMaterial();
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

});



// define a variable to store the scale of the texture
let textureScale = 4;
let hue = 0;
let saturation = 0;
let lightness = 0;
let textureOffset = new THREE.Vector2(0, 0);
// create a function to update the texture scale
function updateTextureScale() {
  const patternTexture = textureLoader.load(textures.find(texture => texture.name === 'pattern').file);
  patternTexture.wrapS = THREE.RepeatWrapping;
  patternTexture.wrapT = THREE.RepeatWrapping;
  patternTexture.repeat.set(textureScale, textureScale);
  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.material.map = patternTexture;
    }
  });
}
function updateHue() {
  // load the pattern texture
  const patternTexture = textureLoader.load(textures.find(texture => texture.name === 'pattern').file);

  // create a new color based on the current hue value
  const color = new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
  // create a material that uses the pattern texture and the updated color
  const patternMaterial = new THREE.MeshBasicMaterial({
    map: patternTexture,
    color: color
  });
  
  // find the shirt mesh and set its material to the new material
  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.material = patternMaterial;
    }
  });
}
//SHADOW & HIGHLIGHT
function updateHighlightAndShadow() {
  // load the pattern texture
  const patternTexture = textureLoader.load(textures.find(texture => texture.name === 'pattern').file);

  // create a new color based on the current hue, saturation, and lightness values
  const color = new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);

  // get the current highlight and shadow values
  const highlight = Number(document.getElementById('highlight-range').value);
  const shadow = Number(document.getElementById('shadow-range').value);

  // calculate the new color with adjusted highlight and shadow values
  const newColor = new THREE.Color().setRGB(
    color.r * (1 - shadow) + highlight,
    color.g * (1 - shadow) + highlight,
    color.b * (1 - shadow) + highlight
  );

  // create a material that uses the pattern texture and the updated color
  const patternMaterial = new THREE.MeshBasicMaterial({
    map: patternTexture,
    color: newColor
  });

  // find the shirt mesh and set its material to the new material
  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.material = patternMaterial;
    }
  });
}
document.getElementById('highlight-range').addEventListener('input', updateHighlightAndShadow);
document.getElementById('shadow-range').addEventListener('input', updateHighlightAndShadow);


// Define the rotateTexture function
function rotateTexture(degrees) {
  const radians = THREE.MathUtils.degToRad(degrees);
  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.geometry.faceVertexUvs[0].forEach((faceUvs) => {
        faceUvs.forEach((uv) => {
          const u = uv.x - 0.5;
          const v = uv.y - 0.5;
          uv.x = 0.5 + u * Math.cos(radians) - v * Math.sin(radians);
          uv.y = 0.5 + u * Math.sin(radians) + v * Math.cos(radians);
        });
      });
      child.geometry.uvsNeedUpdate = true;
    } else {
      console.log('No UV coordinates found for the 3D model.');
    }
  });
}
// Add event listener for rotation selection
const rotationSelect = document.getElementById('rotation-select');
rotationSelect.addEventListener('change', function() {
  rotateTexture(this.value);
});

// }
// add an event listener to the scale input
const scaleInput = document.getElementById('scale');
scaleInput.addEventListener('input', (event) => {
  const minValue = parseFloat(scaleInput.min);
  const maxValue = parseFloat(scaleInput.max);
  const value = parseFloat(event.target.value);
  const reversedValue = maxValue - value + minValue;
  // set the textureScale to the value of the input
  textureScale = reversedValue;  // update the texture scale
  updateTextureScale();
});

// // get the range inputs from the DOM
const hueRangeInput = document.getElementById('hue-range');
const saturationRangeInput = document.getElementById('saturation-range');
const lightnessRangeInput = document.getElementById('lightness-range');

// add event listeners to the range inputs
hueRangeInput.addEventListener('input', () => {
  // update the hue value and call the updateHue() function
  hue = parseInt(hueRangeInput.value);
  updateHue();
});

saturationRangeInput.addEventListener('input', () => {
  // update the saturation value and call the updateSaturation() function
  saturation = parseInt(saturationRangeInput.value);
  updateHue();
});

lightnessRangeInput.addEventListener('input', () => {
  // update the lightness value and call the updateLightness() function
  lightness = parseInt(lightnessRangeInput.value);
  updateHue();
});

// create a function to update the texture position and repeat-MOVE THE PATTERNS
// create a function to update the texture position and repeat
function updateTexturePositionAndRepeat() {
  const patternTexture = textureLoader.load(textures.find(texture => texture.name === 'pattern').file);
  patternTexture.wrapS = THREE.RepeatWrapping;
  patternTexture.wrapT = THREE.RepeatWrapping;

  // set the texture offset (position) based on the x and y inputs
  const xOffset = parseFloat(document.getElementById('x').value);
  const yOffset = parseFloat(document.getElementById('y').value);
  patternTexture.offset.set(xOffset, yOffset);

  // set the texture repeat based on the scale input
  const textureScale = parseFloat(document.getElementById('scale').value);
  patternTexture.repeat.set(textureScale, textureScale);

  // update the texture on the shirt mesh
  scene.traverse((child) => {
    if (child.name === 'Fabric_Plane.002') {
      child.material.map = patternTexture;
    }
  });
}

// add event listeners to the x, y, and scale inputs
const xInput = document.getElementById('x');
xInput.addEventListener('input', (event) => {
  updateTexturePositionAndRepeat();
});

const yInput = document.getElementById('y');
yInput.addEventListener('input', (event) => {
  updateTexturePositionAndRepeat();
});




// modify the onDocumentMouseMove function to only rotate the shirt when not dragging on the scale input
function onDocumentMouseMove(event) {
  // check if the mouse is dragging the scale input
  if (event.target === scaleInput && isDragging) {
    // calculate the delta move
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };
    // set the textureScale to the current value plus the delta move
    textureScale += deltaMove.y * 0.01;
    // update the texture scale
    updateTextureScale();
  } else if (isDragging) {
    // calculate the delta move
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };
    // update the rotation
    rotationX += deltaMove.y * 0.01;
    rotationY += deltaMove.x * 0.01;
    const shirtMesh = scene.getObjectByName('Fabric_Plane.002');
    shirtMesh.rotation.x = rotationX;
    shirtMesh.rotation.y = rotationY;
  }

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
}


    
        // create the light
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 5);
        scene.add(light);

        // create the controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);





        // animate the scene
        const animate = function () {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();





