'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MARK_POLYGONS, MARK_VIEWBOX } from '@/config/brandMark';
import { colors } from '@/config/tokens';

const CX = MARK_VIEWBOX.x + MARK_VIEWBOX.width / 2;
const CY = MARK_VIEWBOX.y + MARK_VIEWBOX.height / 2;
const SCALE = 1 / 42;

function shapeFrom(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => {
    const X = (x - CX) * SCALE;
    const Y = -(y - CY) * SCALE;
    if (i === 0) shape.moveTo(X, Y);
    else shape.lineTo(X, Y);
  });
  shape.closePath();
  return shape;
}

/**
 * The ZEOTON Z mark extruded in 3D. Loaded with next/dynamic only on capable
 * desktop devices; renders on demand and pauses when off-screen or tab hidden.
 */
export default function HeroScene({ onReady }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const group = new THREE.Group();
    scene.add(group);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b2235,
      metalness: 0.9,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: colors.blue500,
      emissive: colors.blue500,
      emissiveIntensity: 1.6,
      metalness: 0.3,
      roughness: 0.35,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: colors.blue400, transparent: true, opacity: 0.28 });

    const disposables = [bodyMat, accentMat, edgeMat, envTexture, pmrem];
    const extrude = { depth: 0.6, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 3, curveSegments: 1 };

    const add = (points, material, z = 0, depth = extrude.depth) => {
      const geo = new THREE.ExtrudeGeometry(shapeFrom(points), { ...extrude, depth });
      geo.translate(0, 0, -depth / 2 + z);
      const mesh = new THREE.Mesh(geo, material);
      group.add(mesh);
      disposables.push(geo);
      if (material === bodyMat) {
        const edges = new THREE.EdgesGeometry(geo, 30);
        group.add(new THREE.LineSegments(edges, edgeMat));
        disposables.push(edges);
      }
    };
    add(MARK_POLYGONS.upper, bodyMat);
    add(MARK_POLYGONS.lower, bodyMat);
    add(MARK_POLYGONS.stripe, accentMat, 0.18, 0.45);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(colors.blue500, 40, 20);
    rim.position.set(3.5, -1.5, -2.5);
    scene.add(rim);
    const fill = new THREE.PointLight(colors.blue400, 18, 18);
    fill.position.set(-3, -3, 4);
    scene.add(fill);

    // Pointer-follow with easing; idle float when the pointer is still.
    const target = { x: 0, y: 0 };
    const onPointer = (e) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.35;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let frame = 0;
    let running = false;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      group.rotation.y += (target.x - 0.28 + Math.sin(t * 0.5) * 0.12 - group.rotation.y) * 0.05;
      group.rotation.x += (target.y + Math.sin(t * 0.7) * 0.05 - group.rotation.x) * 0.05;
      group.position.y = Math.sin(t * 0.9) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      clock.start();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    renderer.render(scene, camera);
    onReady?.();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
