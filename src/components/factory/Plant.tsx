import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { EQUIPMENT, VIEWS, type EqItem, type ViewId } from "./equipment";
import { cladMap, concMap } from "./materials";

const STEEL = "#8a969e";
const STEEL_HI = "#b0bbc2";
const CLAD = "#d8e0e6";
const YELLOW = "#e8c84a";
const RED_PIPE = "#c23b2e";
const BLUE_PIPE = "#2b6cb0";
const CONCRETE = "#c5c8bf";
const SAND = "#c9b896";

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
    const map = src.clone();
    map.repeat.set(repeat[0], repeat[1]);
    return map;
  }, [repeat[0], repeat[1]]);
}

function Tag({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Text
      position={position}
      fontSize={0.55}
      color="#1a1a1a"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.04}
      outlineColor="#ffffff"
    >
      {text}
    </Text>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, -0.02, 5]} receiveShadow>
        <planeGeometry args={[120, 90]} />
        <meshStandardMaterial color={SAND} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.01, 2]} receiveShadow>
        <planeGeometry args={[70, 42]} />
        <meshStandardMaterial color="#d0d3ca" roughness={0.88} />
      </mesh>
      {[[-20, 0, -18], [50, 0, -18], [-20, 0, 22], [50, 0, 22]].map(([x, , z], i) => (
        <mesh key={i} position={[x as number, 0.12, z as number]}>
          <boxGeometry args={[0.35, 0.22, 40]} />
          <meshStandardMaterial color={i % 2 === 0 ? YELLOW : "#1a1a1a"} />
        </mesh>
      ))}
    </group>
  );
}

function ConeTank({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 3.2) / 2;
  const shellH = 3.6;
  const coneH = 1.8;
  const sheet = useSheet([4, 3]);
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r * 0.72, coneH * 0.45, Math.sin(a) * r * 0.72]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, coneH * 0.9, 6]} />
            <meshStandardMaterial color="#3a4248" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
      <mesh position={[0, coneH / 2, 0]} castShadow>
        <cylinderGeometry args={[r, 0.25, coneH, 32]} />
        <meshStandardMaterial color={selected ? STEEL_HI : STEEL} map={sheet} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, coneH + shellH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, shellH, 40]} />
        <meshStandardMaterial color={selected ? "#e8eef2" : CLAD} map={sheet} metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0, coneH + shellH + 0.35, 0]} castShadow>
        <coneGeometry args={[r * 1.02, 0.7, 28]} />
        <meshStandardMaterial color={CLAD} metalness={0.48} roughness={0.4} />
      </mesh>
      {[0.9, 2.2, 3.5].map((y) => (
        <mesh key={y} position={[0, coneH + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + 0.04, 0.035, 8, 40]} />
          <meshStandardMaterial color="#7a858c" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, coneH + shellH / 2, -(r + 0.18)]}>
        <boxGeometry args={[0.04, shellH, 0.04]} />
        <meshStandardMaterial color="#6a757c" metalness={0.6} />
      </mesh>
    </group>
  );
}

function TallColumn({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 2.4) / 2;
  const h = item.height ?? 18;
  const sheet = useSheet([3, 10]);
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 36]} />
        <meshStandardMaterial color={selected ? STEEL_HI : STEEL} map={sheet} metalness={0.55} roughness={0.35} />
      </mesh>
      {[4, 8, 12, 15.5].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r + 0.05, r + 1.1, 32]} />
            <meshStandardMaterial color="#4a5560" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, y + 0.55, 0]}>
            <torusGeometry args={[r + 1.05, 0.04, 6, 40]} />
            <meshStandardMaterial color={YELLOW} metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, h + 0.6, 0]} castShadow>
        <sphereGeometry args={[r * 1.05, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={STEEL_HI} metalness={0.6} roughness={0.32} />
      </mesh>
    </group>
  );
}

function LargeTank({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 6.5) / 2;
  const h = item.height ?? 10;
  const sheet = useSheet([6, 5]);
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 48]} />
        <meshStandardMaterial color={selected ? "#eef3f6" : CLAD} map={sheet} metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0, h + 0.15, 0]} castShadow>
        <cylinderGeometry args={[r * 0.98, r * 0.98, 0.3, 40]} />
        <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.35} />
      </mesh>
      {[2.5, 5, 7.5].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + 0.05, 0.05, 8, 48]} />
          <meshStandardMaterial color="#7a858c" metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Silo({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 3.2) / 2;
  const h = item.height ?? 9;
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 28]} />
        <meshStandardMaterial color={selected ? STEEL_HI : "#9aa3aa"} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, h + 0.8, 0]} castShadow>
        <coneGeometry args={[r * 1.05, 1.6, 24]} />
        <meshStandardMaterial color="#8a939a" metalness={0.45} roughness={0.42} />
      </mesh>
      <mesh position={[r + 0.4, 4, 0]}>
        <boxGeometry args={[0.05, 1.2, 1.6]} />
        <meshStandardMaterial color="#e8eef2" />
      </mesh>
    </group>
  );
}

function Kiln({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 12, 24]} />
        <meshStandardMaterial color={selected ? "#c4a882" : "#a89070"} metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[-7.5, 1.4, 0]} castShadow>
        <boxGeometry args={[1.8, 1.6, 1.4]} />
        <meshStandardMaterial color="#1e5a9e" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-7.5, 2.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 0.8, 16]} />
        <meshStandardMaterial color="#2b6cb0" metalness={0.45} roughness={0.35} />
      </mesh>
      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 1, 1.2]} />
          <meshStandardMaterial color="#4a5560" />
        </mesh>
      ))}
    </group>
  );
}

function Exchanger({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[4.5, 1.6, 1.8]} />
        <meshStandardMaterial color={selected ? STEEL_HI : STEEL} metalness={0.5} roughness={0.38} />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 1.9, 12]} />
          <meshStandardMaterial color="#6a757c" metalness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[4.8, 0.5, 2]} />
        <meshStandardMaterial color="#3a4248" />
      </mesh>
    </group>
  );
}

function Pits({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[-3.5, -0.6, 0]} receiveShadow>
        <boxGeometry args={[5.5, 1.4, 4]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <mesh position={[-3.5, -0.1, 0]}>
        <boxGeometry args={[4.8, 0.3, 3.4]} />
        <meshStandardMaterial color="#5c4a38" roughness={0.7} />
      </mesh>
      <mesh position={[3.2, -0.6, 0]} receiveShadow>
        <boxGeometry args={[5.5, 1.4, 4]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <mesh position={[3.2, -0.15, 0]}>
        <boxGeometry args={[4.8, 0.25, 3.4]} />
        <meshStandardMaterial color="#2a7a6e" roughness={0.3} metalness={0.1} />
      </mesh>
      {[-6.3, 0, 6].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.7, -2.2]}>
            <boxGeometry args={[0.08, 1.3, 0.08]} />
            <meshStandardMaterial color={YELLOW} />
          </mesh>
          <mesh position={[x, 0.7, 2.2]}>
            <boxGeometry args={[0.08, 1.3, 0.08]} />
            <meshStandardMaterial color={YELLOW} />
          </mesh>
          <mesh position={[x, 1.3, 0]}>
            <boxGeometry args={[0.08, 0.08, 4.4]} />
            <meshStandardMaterial color={YELLOW} />
          </mesh>
        </group>
      ))}
      {[-2.2, 2.2].map((z) => (
        <mesh key={z} position={[0, 1.3, z]}>
          <boxGeometry args={[12.5, 0.08, 0.08]} />
          <meshStandardMaterial color={YELLOW} />
        </mesh>
      ))}
    </group>
  );
}

function Tanker() {
  return (
    <group position={[-28, 0, 6]} rotation={[0, 0.4, 0]}>
      <mesh position={[4.5, 1.5, 0]} castShadow>
        <boxGeometry args={[3.2, 2.4, 2.4]} />
        <meshStandardMaterial color="#e8eef2" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[-1.5, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.35, 1.35, 9, 28]} />
        <meshStandardMaterial color="#c5ccd2" metalness={0.55} roughness={0.32} />
      </mesh>
      {[-4.5, -1.5, 2.5, 4.2].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.55, 1.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[x, 0.55, -1.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
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
    return new THREE.TubeGeometry(path, Math.max(parts.length * 6, 10), r, 8, false);
  }, [key, r]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
    </mesh>
  );
}

function Background() {
  return (
    <group>
      <mesh position={[10, 2.5, -35]}>
        <boxGeometry args={[100, 5, 0.4]} />
        <meshStandardMaterial color="#b8b5a8" roughness={0.9} />
      </mesh>
      {[-30, -18, -5, 12, 28, 45, 58].map((x, i) => (
        <group key={i} position={[x, 0, -32]}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 3.6, 6]} />
            <meshStandardMaterial color="#4a3a28" />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[1.4 + (i % 3) * 0.2, 10, 8]} />
            <meshStandardMaterial color="#3d6b3a" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[55, 62, 70].map((x, i) => (
        <mesh key={i} position={[x, 8 + i * 2, -50]}>
          <cylinderGeometry args={[0.8, 1.1, 16 + i * 3, 12]} />
          <meshStandardMaterial color="#8a8680" roughness={0.85} />
        </mesh>
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
    camera.position.lerp(pos.current, 0.06);
    const look = new THREE.Vector3().copy(target.current);
    camera.lookAt(look);
  });

  return null;
}

export function Plant({ selected, view, onSelect, showTags, walking, shot }: Props) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[40, 50, 30]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <hemisphereLight args={["#b8d4f0", "#c9b896", 0.35]} />

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

      <Pipe pts={[[-2, 4.2, -2], [-2, 4.2, 4], [8, 4.2, 4], [8, 6, 12]]} r={0.12} color={RED_PIPE} />
      <Pipe pts={[[3.5, 4.2, -2], [3.5, 4.2, 3], [14, 4.2, 3], [22, 2.2, -6]]} r={0.1} color={RED_PIPE} />
      <Pipe pts={[[9, 4.2, -2], [9, 5.5, 6], [8, 8, 12]]} r={0.11} color={RED_PIPE} />
      <Pipe pts={[[14.5, 4.2, -2], [22, 4.2, -2], [32, 5, 6]]} r={0.1} color={RED_PIPE} />

      <Pipe pts={[[-2, 3.2, 0], [8, 3.2, 0], [22, 2.8, -4], [38, 2.2, -8]]} r={0.09} color={BLUE_PIPE} />
      <Pipe pts={[[32, 5.5, 6], [36, 5.5, 2], [38, 2.5, -6]]} r={0.1} color={BLUE_PIPE} />
      <Pipe pts={[[41, 5.5, 6], [45, 4, 8], [48, 5, 10]]} r={0.09} color={BLUE_PIPE} />
      <Pipe pts={[[22, 2.5, -8], [30, 2.5, -8], [38, 2.2, -8]]} r={0.11} color={BLUE_PIPE} />

      {showTags
        ? EQUIPMENT.map((item) => (
            <Tag
              key={item.tag}
              text={item.tag}
              position={[item.pos[0], (item.height ?? 4) + 1.6, item.pos[2]]}
            />
          ))
        : null}

      <ContactShadows position={[15, 0.03, 2]} opacity={0.28} scale={90} blur={2.4} far={30} color="#3d4a40" />
    </>
  );
}
