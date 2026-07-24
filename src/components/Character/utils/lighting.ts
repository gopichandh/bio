import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0x5eead4, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x22d3ee, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Fallback real lights so the character is visible even if the HDR
  // environment map or scene.environmentIntensity is not honoured by the
  // browser's WebGL implementation (notably some Safari builds where the
  // three.js r155+ scene.environmentIntensity / environmentRotation Scene
  // properties do not affect rendering). These are animated on in
  // turnOnLights() so the reveal timing matches the original intro.
  const ambientLight = new THREE.AmbientLight(0xffffff, 0);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222233, 0);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0);
  keyLight.position.set(2, 10, 8);
  scene.add(keyLight);

  // Ensure the property exists as a number before any GSAP tween reads it,
  // so tweening never starts from `undefined` (which would produce NaN).
  scene.environmentIntensity = 0;

  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr?v=2", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0;
      if (scene.environmentRotation) {
        scene.environmentRotation.set(5.76, 85.85, 1);
      }
    });

  function setPointLight(screenLight: any) {
    if (screenLight.material.opacity > 0.9) {
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      pointLight.intensity = 0;
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights() {
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });
    // Bring up the fallback lights so the model is properly lit on browsers
    // that ignore scene.environmentIntensity.
    gsap.to(ambientLight, {
      intensity: 0.55,
      duration: duration,
      ease: ease,
    });
    gsap.to(hemiLight, {
      intensity: 0.8,
      duration: duration,
      ease: ease,
    });
    gsap.to(keyLight, {
      intensity: 1.1,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;
