import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

let particleSystemBG;

const particlesBG = new THREE.BufferGeometry();
const positionsBG = [];
const sizesBG = [];
const colorsBG = [];
const speedsBG = [];
const radiiBG = [];
const anglesBG = [];
const originalPositionsBG = [];

const params = {
  particleCount: 10000,
  particleSpread: 1,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.set(-500, 500, 800);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ antialias: false, canvas: canvas });
renderer.powerPreference = "high-performance";
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x020817);
document.body.appendChild(renderer.domElement);

const vertexShaderModel = `
          attribute float size;
          uniform float intro;
          uniform float uSize;
          uniform float uProgress;
          uniform vec2 uCursorPosition;
          varying vec3 vPos;
          uniform float strength;

          float random(float seed) {
              return fract(sin(seed) * 43758.5453123);
          }

          void main() {
              float scale = mix(1.0, 0.0, intro);
              vec4 scaledPosition = vec4(position * scale, 1.0);

              vec4 mvPosition = modelViewMatrix * scaledPosition;

              // Adjust these values to control the spread
              float maxDisplacement = 200.0; // Reduced from 1000.0
              float scatterScale = 50.0; // Reduced from 100.0
              float displacementFactor = smoothstep(0.0, 1.5, uProgress); // Scale uProgress by 4

              // Generate random factors for each component
              float randomFactorX = random(float(gl_VertexID) * 0.1);
              float randomFactorY = random(float(gl_VertexID) * 0.2);
              float randomFactorZ = random(float(gl_VertexID) * 0.3);

              vec3 scatterDisplacement = vec3(
                  normalize(position).x * displacementFactor * maxDisplacement * scatterScale * randomFactorX,
                  normalize(position).y * displacementFactor * maxDisplacement * scatterScale * randomFactorY,
                  normalize(position).z * displacementFactor * maxDisplacement * scatterScale * randomFactorZ
              );
              mvPosition.xyz += scatterDisplacement;

              gl_PointSize = size * uSize * (200.0 / -mvPosition.z);

              vec2 diff = mvPosition.xy - uCursorPosition;
              float diffLength = length(diff);

              vPos = position;

              float distTpc = smoothstep(25.0, 100.0, diffLength);

              float displacementStrength = strength;
              vec2 cursorDisplacement = normalize(diff) * distTpc * displacementStrength;

              mvPosition.xy += cursorDisplacement;

              gl_Position = projectionMatrix * mvPosition;
          }
          `;

const fragmentShaderModel = `
        precision highp float;

        varying vec3 vPos;
        uniform float uOpacity;
        uniform float uTime;
        uniform vec2 u_resolution;

        float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 perm(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float noise(vec3 p) {
            vec3 a = floor(p);
            vec3 d = p - a;
            d = d * d * (3.0 - 2.0 * d);

            vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
            vec4 k1 = perm(b.xyxy);
            vec4 k2 = perm(k1.xyxy + b.zzww);

            vec4 c = k2 + a.zzzz;
            vec4 k3 = perm(c);
            vec4 k4 = perm(c + 1.0);

            vec4 o1 = fract(k3 * (1.0 / 41.0));
            vec4 o2 = fract(k4 * (1.0 / 41.0));

            vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
            vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

            return o4.y * d.y + o4.x * (1.0 - d.y);
        }

        float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 0.0;
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(p);
                p *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        mat2 Rot(float a) {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }

        void main() {
            vec2 uv = vPos.xy / u_resolution.xy;
            float ratio = u_resolution.x / u_resolution.y;

            vec2 tuv = uv;
            tuv -= .5;

            float degree = fbm(vec3(uTime * 1.0, tuv.x * tuv.y, 0.0)); // Increased speed

            tuv.y *= 1. / ratio;
            tuv *= Rot(radians((degree - .5) * 720. + 180.));
            tuv.y *= ratio;

            float frequency = 5.0;
            float amplitude = 30.0;
            float speed = uTime * 2.0;
            tuv.x += sin(tuv.y * frequency * 1.618 + speed) / amplitude;
            tuv.y += sin(tuv.x * frequency + speed) / (amplitude * 0.5);

            vec3 colorOrange = vec3(0.95, 0.52, 0.0);
            vec3 colorPink = vec3(0.99, 0.28, 0.94);
            vec3 colorYellow = vec3(0.93, 0.74, 0.06);

            vec3 layer1 = mix(colorYellow, colorPink, smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));
            vec3 layer2 = mix(colorPink, colorOrange, smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));

            vec3 finalComp = mix(layer1, layer2, smoothstep(0.5, -0.3, tuv.y));

            vec3 color = mix(mix(colorOrange, colorPink, 0.2), colorOrange, 0.7); // Adjusted ratios
            float progress = (u_resolution.y - gl_FragCoord.y) / u_resolution.y;
            color = mix(color, finalComp, progress);

            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            float mask = smoothstep(0.5, 0.48, dist); // Smooth edges
            if (dist > 0.5) {
                discard;
            }
            float soft = 0.9;
            gl_FragColor = vec4(color, uOpacity * soft * mask);
        }
        `;

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShaderModel,
  fragmentShader: fragmentShaderModel,
  uniforms: {
    uOpacity: { value: 1.0 },
    uSize: { value: 1.0 },
    uCursorPosition: { value: new THREE.Vector2() },
    uTime: { value: 0.0 },
    uProgress: { value: 0.0 },
    intro: { value: 1.0 },
    u_resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    strength: { value: 0.0 },
  },
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

let moji;
let particleSystem;
const particles = new THREE.BufferGeometry();
const positions = [];
const sizes = [];
const originalPositions = [];
const speeds = [];
const radii = [];

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "https://cdn.glitch.global/15f69d2b-33f7-4b87-9e89-a8937b175331/shoppingBag_seperate.glb?v=1725611219328",
  (gltf) => {
    moji = gltf.scene;
    moji.position.set(400, 250, 0);
    moji.visible = false;
    scene.add(moji);
    scene.traverse((e) => {
      e.isMesh && e.geometry.scale(15, 25, 25);
    });
    updateParticles();
  },
  undefined
);

const particleCountBG = 300;

const vertexShader = `
        attribute float size;
        attribute vec3 customColor;
        attribute float speed;
        attribute float radius;
        attribute float angle;
        varying vec3 vColor;
        uniform float time;
        uniform float intro;
        uniform vec2 uCursorPosition;
        uniform float strength;

        void main() {
            vColor = customColor;

            vec3 scaledPosition = mix(position, vec3(0.0, 0.0, 0.0), intro);

            float newAngle = angle + speed * time;
            vec3 pos = scaledPosition;
            pos.x += radius * cos(newAngle);
            pos.z += radius * sin(newAngle);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

            gl_PointSize = size * (100.0 / -mvPosition.z) * (1.0 - intro);

            vec2 diff = mvPosition.xy - uCursorPosition;
            float diffLength = length(diff);

            float distTpc = smoothstep(25.0, 100.0, diffLength);

            float displacementStrength = strength;
            vec2 cursorDisplacement = normalize(diff) * distTpc * displacementStrength;

            mvPosition.xy += cursorDisplacement;

            gl_Position = projectionMatrix * mvPosition;
        }
        `;

const fragmentShader = `
        varying vec3 vColor;

        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) {
                discard;
            }

            gl_FragColor = vec4(vColor, 1.0);
        }
        `;

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    intro: { value: 1 },
    uCursorPosition: { value: new THREE.Vector2() },
    strength: { value: 30.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  depthTest: false,
  depthWrite: true,
});

const colorOrange = new THREE.Color(0.95, 0.52, 0.0);
const colorPink = new THREE.Color(0.99, 0.28, 0.94);
const colorYellow = new THREE.Color(0.93, 0.74, 0.06);

for (let i = 0; i < particleCountBG; i++) {
  const x = THREE.MathUtils.randFloatSpread(2000);
  const y = THREE.MathUtils.randFloatSpread(1500);
  const z = THREE.MathUtils.randFloatSpread(1000);

  positionsBG.push(x, y, z);
  sizesBG.push(10 + Math.random() * 5);

  const speed = Math.random() * 0.6 + 0.03;
  speedsBG.push(speed);
  radiiBG.push(Math.random() * 150);

  anglesBG.push(Math.random() * Math.PI * 2);

  let color;
  const rand = Math.random();
  if (rand < 0.5) {
    color = colorOrange;
  } else if (rand < 0.8) {
    color = colorPink;
  } else {
    color = colorYellow;
  }
  colorsBG.push(color.r, color.g, color.b);

  originalPositionsBG.push(x, y, z);
}

particlesBG.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positionsBG, 3)
);
particlesBG.setAttribute("size", new THREE.Float32BufferAttribute(sizesBG, 1));
particlesBG.setAttribute(
  "customColor",
  new THREE.Float32BufferAttribute(colorsBG, 3)
);
particlesBG.setAttribute(
  "speed",
  new THREE.Float32BufferAttribute(speedsBG, 1)
);
particlesBG.setAttribute(
  "radius",
  new THREE.Float32BufferAttribute(radiiBG, 1)
);
particlesBG.setAttribute(
  "angle",
  new THREE.Float32BufferAttribute(anglesBG, 1)
);

particleSystemBG = new THREE.Points(particlesBG, particleMaterial);
scene.add(particleSystemBG);

function updateParticles() {
  positions.length = 0;
  sizes.length = 0;
  originalPositions.length = 0;
  speeds.length = 0;
  radii.length = 0;

  if (moji) {
    moji.traverse((object) => {
      if (object.isMesh) {
        const sampler = new MeshSurfaceSampler(object).build();
        const tempPosition = new THREE.Vector3();
        const particleCount =
          object.name === "Plane_Material002_0002_1"
            ? params.particleCount / 4
            : params.particleCount;

        for (let i = 0; i < particleCount; i++) {
          sampler.sample(tempPosition);

          originalPositions.push(
            tempPosition.x + (Math.random() - 0.5) * params.particleSpread,
            tempPosition.y + (Math.random() - 0.5) * params.particleSpread,
            tempPosition.z + (Math.random() - 0.5) * params.particleSpread
          );

          positions.push(0, 0, 0);
          sizes.push(5 + Math.random() * 5);

          speeds.push(1.0 + Math.random() * 0.5);
          radii.push(7.5 + Math.random() * 5.0);
        }
      }
    });

    particles.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    particles.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    if (particleSystem) {
      scene.remove(particleSystem);
    }

    particleSystem = new THREE.Points(particles, shaderMaterial);
    particleSystem.renderOrder = 1;
    particleSystem.scale.set(0.7, 0.7, 0.7);
    particleSystem.position.set(400, 275, 0);
    scene.add(particleSystem);

    gsap.to(shaderMaterial.uniforms.strength, {
      duration: 2.5,
      value: 50.0,
      ease: "power2.inOut",
    });

    gsap.to(particleMaterial.uniforms.intro, {
      duration: 1,
      value: 0,
      ease: "power2.inOut",
    });

    gsap.to(shaderMaterial.uniforms.intro, {
      duration: 1,
      value: 0,
      ease: "power2.inOut",
    });

    gsap.to(camera.position, {
      duration: 2.5,
      x: 0,
      y: 0,
      z: 800,
      onUpdate: () => camera.lookAt(0, 0, 0),
      ease: "power2.out",
    });
  }
}

const mouseShader = new THREE.Vector2();
const mouse = new THREE.Vector2();
const targetMouseShader = new THREE.Vector2(0, 0);
document.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));

  targetMouseShader.x = pos.x;
  targetMouseShader.y = pos.y;

  gsap.to(mouseShader, {
    x: targetMouseShader.x,
    y: targetMouseShader.y,
    duration: 0.5,
    onUpdate: () => {
      shaderMaterial.uniforms.uCursorPosition.value.copy(mouseShader);
      particleMaterial.uniforms.uCursorPosition.value.copy(mouseShader);
    },
  });
});

function animate() {
  requestAnimationFrame(animate);
  const targetRotationY = -(mouse.x * Math.PI) / 50;
  const targetRotationX = -(mouse.y * Math.PI) / 50;

  camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.1;
  camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.1;
  camera.up.set(0, 1, 0);
  camera.updateProjectionMatrix();

  const time = Date.now() * 0.001;

  if (moji) {
    moji.rotation.y = 0 + Math.sin(time * 1) * 0.15;
    moji.rotation.z = 0 + Math.sin(time * 1) * 0.15;

    particleSystem.rotation.y = moji.rotation.y;
    particleSystem.rotation.z = moji.rotation.z;
  }

  updateParticlePositions(time);

  renderer.render(scene, camera);
}

function updateParticlePositions(time) {
  if (particlesBG.attributes.position) {
    const positions = particlesBG.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositionsBG[i];
      const y = originalPositionsBG[i + 1];
      const z = originalPositionsBG[i + 2];

      const radius = radiiBG[i / 3];
      const speed = speedsBG[i / 3];

      positions[i] = x + radius * Math.cos(speed * time + i);
      positions[i + 1] = y + radius * Math.sin(speed * time + i);
      positions[i + 2] = z;
    }

    particlesBG.attributes.position.needsUpdate = true;
  }

  if (particles.attributes.position) {
    const positions = particles.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];
      const z = originalPositions[i + 2];

      const radius = radii[i / 3];
      const speed = speeds[i / 3];

      positions[i] = x + radius * Math.cos(speed * time + i);
      positions[i + 1] = y;
      positions[i + 2] = z + radius * Math.sin(speed * time + i);
    }

    particles.attributes.position.needsUpdate = true;
  }
}

function startAnimation() {
  const sections = document.querySelectorAll("section");

  particleSystem.position.x = 450;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      start: "top top",
      end: "bottom bottom",
      scrub: 4,
    },
  });

  sections.forEach(() => {
    tl.to(shaderMaterial.uniforms.uProgress, {
      duration: 1,
      value: 1.0,
      ease: "power3.inOut",
      onUpdate: () => {
        let progress = shaderMaterial.uniforms.uProgress.value;
        particleSystemBG.rotation.x = progress * Math.PI * 2;
        particleSystemBG.rotation.y = progress * Math.PI * 2;
      },
    });
  });
}

const checkInterval = setInterval(() => {
  if (particleSystem !== undefined && particleSystemBG !== undefined) {
    clearInterval(checkInterval);
    startAnimation();
  }
}, 100);

if (window.innerWidth < 768) {
  // Assume mobile breakpoint
  camera.position.set(0, 200, 500); // Adjust this to center on mobile
} else {
  camera.position.set(-500, 500, 800); // Original position for larger screens
}
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
moji.position.set(0, 100, 0); // Adjust this to center the model

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Adjust positions based on new screen size
  if (window.innerWidth < 768) {
    camera.position.set(0, 200, 500); // Adjust for mobile
    moji.position.set(0, 100, 0);
  } else {
    camera.position.set(-500, 500, 800); // Desktop view
    moji.position.set(400, 250, 0); // Original position
  }
});

animate();
