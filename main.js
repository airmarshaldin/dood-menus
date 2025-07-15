import { GLTFLoader } from './libs/GLTFLoader.js';

const THREE = window.MINDAR.IMAGE.THREE;

const MODELS = {
  lunch:   './airplane/LUNCH.glb',
  juice:   './airplane/juice.glb',
  cupcake: './airplane/fast-food.glb'
};

// Individual scale values
const MODEL_SCALES = {
  lunch:   14.5,
  juice:   1.5,
  cupcake: 5.5
};

// Individual position values
const MODEL_POSITIONS = {
  lunch:   { x: 0, y: -1.4, z: 0 },
  juice:   { x: 0.2, y: 0, z: 0 },
  cupcake: { x: 0.2, y: -0.4, z: 0 }
};

// Individual rotation values (in radians)
const MODEL_ROTATIONS = {
  lunch:   { x: -0.1, y: 0, z: 0 },
  juice:   { x: 0, y: 0, z: 0 },
  cupcake: { x: 0.1, y: Math.PI / 2, z: 0 }
};

let currentKey = 'lunch';
const loadedModels = {};
const modelRefs = {};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Build the AR session
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: './QR.mind'
  });
  const { renderer, scene, camera } = mindarThree;

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);

  const anchor = mindarThree.addAnchor(0);

  // 2. Load all models
  const loader = new GLTFLoader();
  for (const [key, url] of Object.entries(MODELS)) {
    loader.load(url, (gltf) => {
      const model = gltf.scene;

      // Set scale
      const scale = MODEL_SCALES[key] || 4.5;
      model.scale.set(scale, scale, scale);

      // Set position
      const pos = MODEL_POSITIONS[key] || { x: 0, y: 0, z: 0 };
      model.position.set(pos.x, pos.y, pos.z);

      // Set initial rotation
      const rot = MODEL_ROTATIONS[key] || { x: 0, y: 0, z: 0 };
      model.rotation.set(rot.x, rot.y, rot.z);

      // Add to group
      const group = new THREE.Group();
      group.rotation.set(0, 0, 0);
      group.position.set(0, -1, 0);
      group.add(model);
      group.visible = key === currentKey;

      anchor.group.add(group);
      loadedModels[key] = group;
      modelRefs[key] = model;
    });
  }

  await mindarThree.start();

  // 3. Animation loop (self Y-axis spin)
  renderer.setAnimationLoop(() => {
    const activeModel = modelRefs[currentKey];
    if (activeModel) {
      activeModel.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  });

  // 4. Wire toggle buttons
  for (const btn of document.querySelectorAll('.toggle-btn')) {
    btn.addEventListener('click', () => {
      const key = btn.dataset.model;
      if (key === currentKey || !loadedModels[key]) return;

      Object.values(loadedModels).forEach(g => g.visible = false);
      loadedModels[key].visible = true;
      currentKey = key;
    });
  }
});
