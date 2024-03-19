import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { IIIFManifest } from "./iiif";

let renderer;
let scene;
let camera;
let iiifManifest;

// window.addEventListener("resize", onWindowResize, false);

const firstManifestUrl = document.querySelector("input#manifest-url").value;
loadScene(firstManifestUrl);

export async function loadScene(manifestUrlOrJson) {
  init();
  await loadIIIFManifest(manifestUrlOrJson);
  animate();

  if (iiifManifest) {
    document.querySelector("textarea#manifest-text").value = JSON.stringify(
      iiifManifest.manifest.__jsonld,
      undefined,
      4
    );
  }
}

function init() {
  const canvas = document.getElementById("canvas");
  // remove any previous children
  while (canvas.children.length > 0) {
    canvas.removeChild(canvas.children[0]);
  }

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    35,
    canvas.clientWidth / canvas.clientHeight,
    0.01,
    100
  );
  scene.add(camera);

  const light = new THREE.AmbientLight(0x404040, 100); // soft white light
  scene.add(light);

  const light2 = new THREE.DirectionalLight("white", 0.5);
  light.position.set(1, 1, 1);
  scene.add(light2);

  const grid = new THREE.GridHelper(20, 20);
  scene.add(grid);

  const axes = new THREE.AxesHelper(10);
  axes.material.depthFunc = THREE.AlwaysDepth; // prevent z-fighting with grid, axes win
  scene.add(axes);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  canvas.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 20;
  camera.position.y = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

async function loadIIIFManifest(manifestUrlOrJson) {
  iiifManifest = new IIIFManifest(manifestUrlOrJson);
  await iiifManifest.loadManifest();

  if (iiifManifest.scenes.length > 0) {
    // Root scene
    const manifestScene = iiifManifest.scenes[0];

    // Add scene BG color
    const bgColor = await manifestScene.getBackgroundColor();
    if (
      bgColor &&
      "red" in bgColor &&
      "green" in bgColor &&
      "blue" in bgColor
    ) {
      scene.background = new THREE.Color(
        `rgb(${bgColor.red}, ${bgColor.green}, ${bgColor.blue})`
      );
    }

    // Load individual model annotations
    iiifManifest
      .annotationsFromScene(manifestScene)
      .filter((anno) => {
        const body = anno.getBody3D();
        return (
          anno.getMotivation()?.[0] === "painting" &&
          body?.getType() === "model" &&
          body?.id &&
          anno.getTarget()
        );
      })
      .forEach((modelAnnotation) => {
        loadModel(modelAnnotation);
      });
  }
}

function loadModel(modelAnnotation) {
  const modelUrl = modelAnnotation.getBody3D().id;
  const modelTarget = modelAnnotation.getTarget();
  if (modelUrl && modelTarget) {
    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      scene.add(gltf.scene);
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
