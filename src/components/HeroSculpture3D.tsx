import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, Float, Sparkles, ContactShadows, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * Cinematic Scene 1 & 2: The Glass Monolith & Fragmentation
 */

function Monolith({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const smoothScroll = useRef(0);
  
  // Load textures
  const tex1 = useTexture('/ai_ui_1.jpg');
  const tex2 = useTexture('/ai_ui_2.jpg');
  const tex3 = useTexture('/ai_ui_3.jpg');
  const tex4 = useTexture('/ai_ui_4.jpg');
  const textures = useMemo(() => [tex1, tex2, tex3, tex4], [tex1, tex2, tex3, tex4]);
  
  // 27 pieces (3x3x3 grid)
  const pieces = useMemo(() => {
    const arr = [];
    const w = 3 / 3;
    const h = 5 / 3;
    const d = 1.5 / 3;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const px = (x - 1) * w;
          const py = (y - 1) * h;
          const pz = (z - 1) * d;
          // 3D T-shape: Top row (y=2) OR Middle column (x=1) across all depths (Z)
          const isTShape = y === 2 || (x === 1 && y < 2);
          arr.push({
            position: [px, py, pz],
            scale: [w, h, d],
            offset: [px, py, pz],
            isTShape,
            textureIndex: Math.floor(Math.random() * 4)
          });
        }
      }
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Smooth scroll interpolation
    smoothScroll.current = THREE.MathUtils.lerp(smoothScroll.current, scrollRef.current, delta * 5);
    const s = smoothScroll.current;
    
    // Phase 1 (0 to 0.04): Monolith shatters radially
    const explodeProgress = Math.min(s / 0.04, 1);
    
    // Phase 2 (0.04 to 0.10): Fragments align into a tunnel/gallery
    const structureProgress = Math.max(0, Math.min((s - 0.04) / 0.06, 1));

    // Phase 3 (0.10 to 0.30): Camera flies through the gallery (01 / Practice)
    const flyProgress = Math.max(0, Math.min((s - 0.10) / 0.20, 1));
    
    // Phase 4 (0.30 to 0.40): Gallery morphs into 3D Dashboard/Bar Chart
    const dashProgress = Math.max(0, Math.min((s - 0.30) / 0.10, 1));
    
    // Phase 5 (0.40 to 0.55): Camera pushes into the Dashboard
    const dashFlyProgress = Math.max(0, Math.min((s - 0.40) / 0.15, 1));

    // Phase 6 (0.55 to 0.65): Dashboard morphs into the Floating Museum
    const museumProgress = Math.max(0, Math.min((s - 0.55) / 0.10, 1));

    // Phase 7 (0.65 to 0.75): Camera flies through the Floating Museum
    const museumFlyProgress = Math.max(0, Math.min((s - 0.65) / 0.10, 1));

    // Phase 8 (0.75 to 0.85): Pricing Pedestal
    const pedestalProgress = Math.max(0, Math.min((s - 0.75) / 0.10, 1));

    // Phase 9 (0.85 to 0.95): Contact Ring
    const ringProgress = Math.max(0, Math.min((s - 0.85) / 0.10, 1));
    
    // Calculate base rotation
    let baseY = state.clock.elapsedTime * 0.05 + explodeProgress * Math.PI * 0.25;
    baseY = THREE.MathUtils.lerp(baseY, 0, structureProgress);
    
    let baseZ = Math.sin(state.clock.elapsedTime * 0.2) * 0.05 + explodeProgress * Math.PI * 0.15;
    baseZ = THREE.MathUtils.lerp(baseZ, 0, structureProgress);

    group.current.rotation.y = baseY;
    group.current.rotation.z = baseZ;
    // (We removed the cursor parallax responsiveness as it was too intense)

    // Camera movement pipeline
    const zBase = THREE.MathUtils.lerp(8, 22, explodeProgress);
    const zGallery = THREE.MathUtils.lerp(zBase, -40, flyProgress);
    const zDash = THREE.MathUtils.lerp(zGallery, -90, dashFlyProgress);
    const zMuseum = THREE.MathUtils.lerp(zDash, -280, museumFlyProgress);
    const zPedestal = THREE.MathUtils.lerp(zMuseum, -315, pedestalProgress);
    state.camera.position.z = THREE.MathUtils.lerp(zPedestal, -360, ringProgress);
    
    // Camera pan slightly on Y
    const yBase = THREE.MathUtils.lerp(0, -2, flyProgress);
    const yDash = THREE.MathUtils.lerp(yBase, 2, dashFlyProgress);
    const yMuseum = THREE.MathUtils.lerp(yDash, 0, museumFlyProgress);
    // Pan up slightly to look down at pedestals
    const yPedestal = THREE.MathUtils.lerp(yMuseum, 6, pedestalProgress);
    // Pan back to center for ring
    state.camera.position.y = THREE.MathUtils.lerp(yPedestal, 0, ringProgress);
    
    // Camera rotation X (look down slightly for pedestal)
    state.camera.rotation.x = THREE.MathUtils.lerp(0, -0.15, pedestalProgress);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, 0, ringProgress);

    // Calculate target opacity for AI UIs
    // Appears during gallery phase (structureProgress), disappears for dashboard phase (dashProgress)
    const targetOpacity = Math.max(0, structureProgress - dashProgress);
    matRefs.current.forEach(mat => {
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 10);
      }
    });

    // Animate each fragment
    group.current.children.forEach((child, i) => {
      const piece = pieces[i];
      
      // Target 1: Explode position
      const pushX = piece.offset[0] * 12 * explodeProgress;
      const pushY = piece.offset[1] * 12 * explodeProgress;
      const pushZ = piece.offset[2] * 12 * explodeProgress;
      
      const explodeX = piece.position[0] + pushX;
      const explodeY = piece.position[1] + pushY;
      const explodeZ = piece.position[2] + pushZ;

      // Target 2: Gallery Structure Position (Staggered along Z axis)
      // Alternating left and right slightly
      const side = (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.5);
      const height = ((i % 5) - 2) * 1.5;
      const depth = -i * 2 + 10; // Z spreads from 10 backwards to -44

      const structureX = side * 6;
      const structureY = height;
      const structureZ = depth;

      // Target 3: 3D Dashboard / Bar Chart
      const col = i % 9;
      const row = Math.floor(i / 9);
      
      // Semi-circle layout
      const theta = ((col - 4) / 4) * (Math.PI / 2.5); // Spread across arc
      const radius = 25 + row * 4; // Rows are further back
      
      const dashX = Math.sin(theta) * radius;
      const dashZ = -Math.cos(theta) * radius - 55; // Placed deep at z = -80 roughly
      // Height based on row and some sine math for a "data" look
      const dashY = Math.sin(col * 0.8 + state.clock.elapsedTime * 0.5) * 3 + (row * 1.5) - 4;

      // Target 4: Floating Museum (Portfolio displays)
      const museumCol = i % 3;
      const museumX = (museumCol - 1) * 16; 
      const museumY = (museumCol === 1 ? -3 : 3) + Math.sin(i) * 2;
      const museumZ = -120 - i * 6; // Deep z spread from -120 to -282

      // Target 5: Pricing Pedestal
      const pedCol = i % 3; // 0, 1, 2
      const pedStack = Math.floor(i / 3); // 0 to 8
      const pedX = (pedCol - 1) * 12;
      const pedY = -12 + pedStack * 0.4;
      const pedZ = -330 - (pedCol === 1 ? 5 : 0); // Center pedestal is deeper/highlighted

      // Target 6: Contact Ring
      const ringTheta = (i / 27) * Math.PI * 2;
      const ringRadius = 18;
      const ringX = Math.cos(ringTheta) * ringRadius;
      const ringY = Math.sin(ringTheta) * ringRadius;
      const ringZ = -380;

      // Final target position
      const targetX1 = THREE.MathUtils.lerp(explodeX, structureX, structureProgress);
      const targetY1 = THREE.MathUtils.lerp(explodeY, structureY, structureProgress);
      const targetZ1 = THREE.MathUtils.lerp(explodeZ, structureZ, structureProgress);

      const targetX2 = THREE.MathUtils.lerp(targetX1, dashX, dashProgress);
      const targetY2 = THREE.MathUtils.lerp(targetY1, dashY, dashProgress);
      const targetZ2 = THREE.MathUtils.lerp(targetZ1, dashZ, dashProgress);

      const targetX3 = THREE.MathUtils.lerp(targetX2, museumX, museumProgress);
      const targetY3 = THREE.MathUtils.lerp(targetY2, museumY, museumProgress);
      const targetZ3 = THREE.MathUtils.lerp(targetZ2, museumZ, museumProgress);

      const targetX4 = THREE.MathUtils.lerp(targetX3, pedX, pedestalProgress);
      const targetY4 = THREE.MathUtils.lerp(targetY3, pedY, pedestalProgress);
      const targetZ4 = THREE.MathUtils.lerp(targetZ3, pedZ, pedestalProgress);

      const targetX = THREE.MathUtils.lerp(targetX4, ringX, ringProgress);
      const targetY = THREE.MathUtils.lerp(targetY4, ringY, ringProgress);
      const targetZ = THREE.MathUtils.lerp(targetZ4, ringZ, ringProgress);

      child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, delta * 10);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, delta * 10);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, delta * 10);

      // Rotations
      const rotX = piece.offset[0] * explodeProgress * 1;
      const rotY = piece.offset[1] * explodeProgress * 1;
      const rotZ = piece.offset[2] * explodeProgress * 1;
      
      const structRotX = 0;
      const structRotY = side > 0 ? -0.2 : 0.2; 
      const structRotZ = 0;

      const dashRotX = 0;
      const dashRotY = theta;
      const dashRotZ = 0;

      const museumRotX = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      const museumRotY = (museumCol === 0 ? 0.3 : museumCol === 2 ? -0.3 : 0) + Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.05;
      const museumRotZ = 0;

      const pedRotX = 0;
      const pedRotY = 0;
      const pedRotZ = 0;

      const ringRotX = 0;
      const ringRotY = 0;
      const ringRotZ = ringTheta + state.clock.elapsedTime * 0.15;

      const rX1 = THREE.MathUtils.lerp(rotX, structRotX, structureProgress);
      const rY1 = THREE.MathUtils.lerp(rotY, structRotY, structureProgress);
      const rZ1 = THREE.MathUtils.lerp(rotZ, structRotZ, structureProgress);

      const rX2 = THREE.MathUtils.lerp(rX1, dashRotX, dashProgress);
      const rY2 = THREE.MathUtils.lerp(rY1, dashRotY, dashProgress);
      const rZ2 = THREE.MathUtils.lerp(rZ1, dashRotZ, dashProgress);

      const rX3 = THREE.MathUtils.lerp(rX2, museumRotX, museumProgress);
      const rY3 = THREE.MathUtils.lerp(rY2, museumRotY, museumProgress);
      const rZ3 = THREE.MathUtils.lerp(rZ2, museumRotZ, museumProgress);

      const rX4 = THREE.MathUtils.lerp(rX3, pedRotX, pedestalProgress);
      const rY4 = THREE.MathUtils.lerp(rY3, pedRotY, pedestalProgress);
      const rZ4 = THREE.MathUtils.lerp(rZ3, pedRotZ, pedestalProgress);

      child.rotation.x = THREE.MathUtils.lerp(rX4, ringRotX, ringProgress);
      child.rotation.y = THREE.MathUtils.lerp(rY4, ringRotY, ringProgress);
      child.rotation.z = THREE.MathUtils.lerp(rZ4, ringRotZ, ringProgress);

      // Morph scale
      const scaleGalX = 4 / piece.scale[0];
      const scaleGalY = 3 / piece.scale[1];
      const scaleGalZ = 0.05 / piece.scale[2];

      const barHeight = Math.abs(Math.sin(col * 1.2 + row * 0.5)) * 4 + 2;
      const scaleDashX = 1.2 / piece.scale[0];
      const scaleDashY = barHeight / piece.scale[1];
      const scaleDashZ = 1.2 / piece.scale[2];

      // Museum panel scale (large portrait displays)
      const scaleMuseumX = 8 / piece.scale[0];
      const scaleMuseumY = 10 / piece.scale[1];
      const scaleMuseumZ = 0.2 / piece.scale[2];

      // Pedestal scale (flat wide slabs stacked)
      const scalePedX = 10 / piece.scale[0];
      const scalePedY = 0.4 / piece.scale[1];
      const scalePedZ = 8 / piece.scale[2];

      // Ring scale (curved blocks framing screen)
      const scaleRingX = 5 / piece.scale[0];
      const scaleRingY = 0.5 / piece.scale[1];
      const scaleRingZ = 1.5 / piece.scale[2];

      const sX1 = THREE.MathUtils.lerp(1, scaleGalX, structureProgress);
      const sY1 = THREE.MathUtils.lerp(1, scaleGalY, structureProgress);
      const sZ1 = THREE.MathUtils.lerp(1, scaleGalZ, structureProgress);

      const sX2 = THREE.MathUtils.lerp(sX1, scaleDashX, dashProgress);
      const sY2 = THREE.MathUtils.lerp(sY1, scaleDashY, dashProgress);
      const sZ2 = THREE.MathUtils.lerp(sZ1, scaleDashZ, dashProgress);
      
      const sX3 = THREE.MathUtils.lerp(sX2, scaleMuseumX, museumProgress);
      const sY3 = THREE.MathUtils.lerp(sY2, scaleMuseumY, museumProgress);
      const sZ3 = THREE.MathUtils.lerp(sZ2, scaleMuseumZ, museumProgress);

      const sX4 = THREE.MathUtils.lerp(sX3, scalePedX, pedestalProgress);
      const sY4 = THREE.MathUtils.lerp(sY3, scalePedY, pedestalProgress);
      const sZ4 = THREE.MathUtils.lerp(sZ3, scalePedZ, pedestalProgress);

      const sX = THREE.MathUtils.lerp(sX4, scaleRingX, ringProgress);
      const sY = THREE.MathUtils.lerp(sY4, scaleRingY, ringProgress);
      const sZ = THREE.MathUtils.lerp(sZ4, scaleRingZ, ringProgress);

      child.scale.set(sX, sY, sZ);
    });
  });

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={group}>
        {pieces.map((piece, i) => (
          <group key={i}>
            <mesh>
              <boxGeometry args={[piece.scale[0] * 0.98, piece.scale[1] * 0.98, piece.scale[2] * 0.98]} />
              <meshPhysicalMaterial 
                transmission={1} 
                roughness={piece.isTShape ? 0.15 : 0.05} 
                thickness={2} 
                ior={1.5} 
                color="#ffffff"
                emissive={piece.isTShape ? "#8B7DFF" : "#2a1c6a"}
                emissiveIntensity={piece.isTShape ? 2.5 : 1.0}
                envMapIntensity={1.5}
              />
            </mesh>
            {/* The floating AI dashboard screenshot */}
            <mesh position={[0, 0, (piece.scale[2] * 0.98) / 2 + 0.01]}>
              <planeGeometry args={[piece.scale[0] * 0.98, piece.scale[1] * 0.98]} />
              <meshBasicMaterial 
                ref={(el) => { matRefs.current[i] = el; }} 
                map={textures[piece.textureIndex]} 
                transparent 
                opacity={0} 
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}

function CursorLight({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const { viewport, camera } = useThree();

  useEffect(() => {
    // Add target to scene
    camera.add(targetRef.current);
    return () => {
      camera.remove(targetRef.current);
    };
  }, [camera]);

  useFrame(() => {
    if (!lightRef.current) return;
    
    // Smooth damp the light position to the cursor
    const targetX = (pointer.current.x * viewport.width) / 2;
    const targetY = (pointer.current.y * viewport.height) / 2;
    
    // Lerp light position
    lightRef.current.position.x += (targetX - lightRef.current.position.x) * 0.05;
    lightRef.current.position.y += (targetY - lightRef.current.position.y) * 0.05;
    
    // Update target
    targetRef.current.position.set(lightRef.current.position.x, lightRef.current.position.y, 0);
    lightRef.current.target = targetRef.current;
  });

  return (
    <spotLight
      ref={lightRef}
      position={[0, 0, 5]}
      penumbra={1}
      distance={25}
      angle={0.7}
      attenuation={5}
      anglePower={4}
      intensity={12}
      color="#ffffff"
      castShadow
    />
  );
}

export default function HeroSculpture3D() {
  const pointer = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Initial call to set correct scroll on load
    onScroll();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen bg-black">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false, depth: false }}
        camera={{ position: [0, 0, 8], fov: 45 }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 8, 30]} />
        
        {/* Subtle ambient light just to see shapes faintly when light is away */}
        <ambientLight intensity={0.02} />
        
        {/* The cursor light */}
        <CursorLight pointer={pointer} />

        {/* The Monolith */}
        <Monolith scrollRef={scrollRef} />

        {/* Cinematic Particles */}
        <Sparkles count={300} scale={20} size={2} speed={0.2} opacity={0.15} color="#ffffff" />
        
        {/* Environment Map for glass reflections */}
        <Environment preset="city" environmentIntensity={0.1} />

        {/* Post Processing */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
