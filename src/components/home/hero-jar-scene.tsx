"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type SceneColors = { neon: string; neon2: string; leaf: string; agar: string };

function Jar({ colors }: { colors: SceneColors }) {
  const group = useRef<Group>(null);
  const drag = useRef({ active: false, lastX: 0, velocity: 0.004 });

  useFrame((_, delta) => {
    if (!group.current) return;
    // เดิมไม่รับ delta ทำให้ความเร็วหมุนผูกกับเฟรมเรตจอ (จอ 120Hz หมุนเร็วเป็น 2 เท่าของจอ 60Hz)
    // velocity 0.004 ถูกตั้งไว้โดยอ้างอิงจอ 60fps จึงคูณด้วย 60 * delta เพื่อคงความเร็วที่เห็นเท่าเดิม
    // ไม่ว่าเฟรมเรตจริงจะเป็นเท่าไร
    if (!drag.current.active) group.current.rotation.y += drag.current.velocity * 60 * delta;
  });

  return (
    <group
      ref={group}
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.lastX = e.clientX;
        (e.target as Element).setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        drag.current.active = false;
        const target = e.target as Element;
        // ปล่อยเฉพาะตอนที่ยึด capture ไว้จริง เรียก release เปล่า ๆ ตอนไม่มี capture (เช่นถูกยกเลิกไปก่อน
        // จาก pointercancel) โยน DOMException ใน browser บางตัว
        if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => { drag.current.active = false; }}
      onPointerLeave={() => { drag.current.active = false; }}
      onPointerMove={(e) => {
        if (!drag.current.active || !group.current) return;
        group.current.rotation.y += (e.clientX - drag.current.lastX) * 0.01;
        drag.current.lastX = e.clientX;
      }}
    >
      {/* ตัวโหลแก้ว */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.85, 0.8, 2.1, 48, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.25} roughness={0.05} metalness={0} transmission={0.9} thickness={0.2} color="#bfeff7" side={2} />
      </mesh>
      {/* ฝาโลหะ */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.22, 48]} />
        <meshStandardMaterial color="#39434f" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* วุ้นอาหารเรืองแสง */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.78, 0.74, 0.4, 48]} />
        <meshStandardMaterial color={colors.agar} emissive={colors.neon} emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
      {/* ต้นอ่อน: ก้าน + ใบสามใบ */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.9, 8]} />
        <meshStandardMaterial color={colors.leaf} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.1) * 0.3, 0.25 + i * 0.18, Math.cos(i * 2.1) * 0.3]} rotation={[0.5, i * 2.1, 0.3]}>
          <sphereGeometry args={[0.26, 16, 12]} />
          <meshStandardMaterial color={colors.leaf} emissive={colors.neon2} emissiveIntensity={0.12} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroJarScene(colors: SceneColors) {
  return (
    <Canvas camera={{ position: [0, 0.4, 4], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={30} color={colors.neon} />
      <pointLight position={[-3, -1, 2]} intensity={18} color={colors.neon2} />
      <Jar colors={colors} />
    </Canvas>
  );
}
