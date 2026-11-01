import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { EQUIPMENT, VIEWS, type EqItem, type ViewId } from "./equipment";
import { cladMap } from "./materials";

const STEEL = "#9aa3aa";
const STEEL_DK = "#6a757c";
const CLAD = "#dce4ea";
const YELLOW = "#e6c23a";
const RED = "#c23028";
const BLUE = "#2563a8";
const CONCRETE = "#c8cbc2";
const SAND = "#cbb892";

type Shot = { pos: [number, number, number]; target: [number, number, number] };
type Props = {
  selected: string | null;
  view: ViewId;
  onSelect: (tag: string) => void;
  showTags: boolean;
  walking: boolean;
  shot: Shot | null;
};

function useSheet(repeat: [number, number]) {
  return useMemo(() => {
    const src = cladMap();
    if (!src) return null;
    const m = src.clone();
    m.repeat.set(repeat[0], repeat[1]);
    return m;
  }, [repeat[0], repeat[1]]);
}

function Tag({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Text position={position} fontSize={0.48} color="#111" anchorX="center" anchorY="middle" outlineWidth={0.035} outlineColor="#fff">
      {text}
    </Text>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.04, 4]} receiveShadow>
        <planeGeometry args={[140, 100]} />
        <meshStandardMaterial color={SAND} roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0.005, 1]} receiveShadow>
        <planeGeometry args={[72, 44]} />
        <meshStandardMaterial color="#d2d5cc" roughness={0.9} />
      </mesh>
    </group>
  );
}

function ConeTank({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 3.2) / 2;
  const sheet = useSheet([5, 3]);
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[r, 0.22, 1.7, 36]} />
        <meshStandardMaterial color={selected ? "#eef3f6" : STEEL} map={sheet ?? undefined} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[r, r, 3.5, 40]} />
        <meshStandardMaterial color={selected ? "#eef3f6" : CLAD} map={sheet ?? undefined} metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <coneGeometry args={[r * 1.03, 0.65, 28]} />
        <meshStandardMaterial color={CLAD} metalness={0.48} roughness={0.4} />
      </mesh>
    </group>
  );
}

function TallColumn({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 2.4) / 2;
  const h = item.height ?? 18;
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 36]} />
        <meshStandardMaterial color={selected ? "#eef3f6" : STEEL} metalness={0.55} roughness={0.35} />
      </mesh>
      {[3.5, 7, 10.5, 14].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r + 0.02, r + 1.2, 32]} />
          <meshStandardMaterial color="#4a5560" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function LargeTank({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 6.5) / 2;
  const h = item.height ?? 10;
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 48]} />
        <meshStandardMaterial color={selected ? "#eef3f6" : CLAD} metalness={0.5} roughness={0.38} />
      </mesh>
    </group>
  );
}

function Silo({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 3.2) / 2;
  const h = item.height ?? 9;
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 28]} />
        <meshStandardMaterial color={selected ? "#b0bbc2" : "#9aa3aa"} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, h + 0.85, 0]} castShadow>
        <coneGeometry args={[r * 1.06, 1.7, 24]} />
        <meshStandardMaterial color="#8a939a" metalness={0.45} roughness={0.42} />
      </mesh>
    </group>
  );
}

function Kiln({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, 1.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 13, 28]} />
        <meshStandardMaterial color={selected ? "#c9ad88" : "#a89070"} metalness={0.35} roughness={0.48} />
      </mesh>
      <mesh position={[-8, 1.5, 0]} castShadow>
        <boxGeometry args={[2.2, 1.9, 1.7]} />
        <meshStandardMaterial color="#1a4f96" metalness={0.4} roughness={0.38} />
      </mesh>
    </group>
  );
}

function Exchanger({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[5.2, 1.7, 2.0]} />
        <meshStandardMaterial color={selected ? "#b0bbc2" : STEEL} metalness={0.5} roughness={0.38} />
      </mesh>
    </group>
  );
}

function Pits({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group position={item.pos} onClick={(e) => { e.stopPropagation(); onSelect(item.tag); }}>
      <mesh position={[-3.6, -0.55, 0]} receiveShadow>
        <boxGeometry args={[5.8, 1.5, 4.2]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <mesh position={[-3.6, -0.05, 0]}>
        <boxGeometry args={[5.1, 0.35, 3.6]} />
        <meshStandardMaterial color="#5a4836" roughness={0.7} />
      </mesh>
      <mesh position={[3.4, -0.55, 0]} receiveShadow>
        <boxGeometry args={[5.8, 1.5, 4.2]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <mesh position={[3.4, -0.08, 0]}>
        <boxGeometry args={[5.1, 0.28, 3.6]} />
        <meshStandardMaterial color="#1f7a6c" roughness={0.25} />
      </mesh>
    </group>
  );
}

function Tanker() {
  return (
    <group position={[-28, 0, 7]} rotation={[0, 0.35, 0]}>
      <mesh position={[5.2, 1.55, 0]} castShadow>
        <boxGeometry args={[3.4, 2.5, 2.5]} />
        <meshStandardMaterial color="#eef2f5" metalness={0.15} roughness={0.4} />
      </mesh>
      <mesh position={[-1.2, 1.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, 10, 28]} />
        <meshStandardMaterial color="#c8d0d6" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Pipe({ pts, r, color }: { pts: [number, number, number][]; r: number; color: string }) {
  const key = pts.map((p) => p.join(",")).join("|");
  const geo = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    const parts = key.split("|").map((row) => row.split(",").map(Number) as [number, number, number]);
    for (let i = 0; i < parts.length - 1; i++) {
      path.add(new THREE.LineCurve3(new THREE.Vector3(...parts[i]), new THREE.Vector3(...parts[i + 1])));
    }
    return new THREE.TubeGeometry(path, Math.max(parts.length * 6, 12), r, 8, false);
  }, [key, r]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.32} />
    </mesh>
  );
}

function Background() {
  return (
    <group>
      <mesh position={[10, 2.2, -38]}>
        <boxGeometry args={[110, 4.4, 0.45]} />
        <meshStandardMaterial color="#b5b2a5" roughness={0.9} />
      </mesh>
      {[-35, -20, 0, 20, 40].map((x, i) => (
        <group key={i} position={[x, 0, -34]}>
          <mesh position={[0, 1.9, 0]}>
            <cylinderGeometry args={[0.14, 0.2, 3.8, 6]} />
            <meshStandardMaterial color="#4a3a28" />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <sphereGeometry args={[1.5, 10, 8]} />
            <meshStandardMaterial color="#3a6b38" roughness={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraRig({ view, shot, walking }: { view: ViewId; shot: Shot | null; walking: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());
  useEffect(() => {
    if (shot) {
      pos.current.set(...shot.pos);
      target.current.set(...shot.target);
    } else {
      const v = VIEWS[view];
      pos.current.set(...v.pos);
      target.current.set(...v.target);
    }
  }, [view, shot]);
  useFrame(() => {
    if (walking) return;
    camera.position.lerp(pos.current, 0.055);
    camera.lookAt(target.current);
  });
  return null;
}

export function Plant({ selected, view, onSelect, showTags, walking, shot }: Props) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[45, 55, 25]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
      <hemisphereLight args={["#b0d0f0", "#cbb892", 0.4]} />
      <CameraRig view={view} shot={shot} walking={walking} />
      <Ground />
      <Background />
      <Tanker />
      {EQUIPMENT.map((item) => {
        const on = selected === item.tag;
        if (item.kind === "pit") return <Pits key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "settling") return <ConeTank key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "column") return <TallColumn key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "tank") return <LargeTank key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "silo") return <Silo key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "kiln") return <Kiln key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "exchanger") return <Exchanger key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        return null;
      })}
      <Pipe pts={[[-2, 4.3, -2], [-2, 4.3, 5], [8, 4.3, 5], [8, 7, 12]]} r={0.13} color={RED} />
      <Pipe pts={[[3.5, 4.3, -2], [3.5, 4.3, 4], [14, 4.3, 4], [22, 2.4, -6]]} r={0.11} color={RED} />
      <Pipe pts={[[9, 4.3, -2], [9, 6, 7], [8, 9, 12]]} r={0.12} color={RED} />
      <Pipe pts={[[14.5, 4.3, -2], [22, 4.3, -2], [32, 5.2, 6]]} r={0.11} color={RED} />
      <Pipe pts={[[-2, 3.1, 0], [8, 3.1, 0], [22, 2.6, -5], [38, 2.1, -8]]} r={0.1} color={BLUE} />
      <Pipe pts={[[32, 5.8, 6], [36, 5.8, 2], [38, 2.4, -6]]} r={0.11} color={BLUE} />
      <Pipe pts={[[22, 2.4, -8], [30, 2.4, -8], [38, 2.1, -8]]} r={0.12} color={BLUE} />
      {showTags
        ? EQUIPMENT.map((item) => (
            <Tag key={item.tag} text={item.tag} position={[item.pos[0], (item.height ?? 4) + 1.5, item.pos[2]]} />
          ))
        : null}
      <ContactShadows position={[12, 0.03, 2]} opacity={0.3} scale={95} blur={2.3} far={32} color="#3d4a40" />
    </>
  );
}
