import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { EQUIPMENT, VIEWS, type EqItem, type ViewId } from "./equipment";
import { cladMap, concMap } from "./materials";

const STEEL = "#5c6b78";
const STEEL_HI = "#7d8e9c";
const CLAD = "#d5dde4";
const CLAD_HI = "#eef3f6";
const SKIRT = "#2c3640";
const OIL = "#6b5340";

type Shot = { pos: [number, number, number]; target: [number, number, number] };

type Props = {
  selected: string | null;
  view: ViewId;
  onSelect: (tag: string) => void;
  showTags: boolean;
  walking: boolean;
  shot: Shot | null;
};

function useFrontCut(z: number, open: boolean) {
  return useMemo(() => (open ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), z)] : undefined), [z, open]);
}

function useSheet(repeat: [number, number]) {
  return useMemo(() => {
    const src = cladMap();
    if (!src) return null;
    const map = src.clone();
    map.repeat.set(repeat[0], repeat[1]);
    return map;
  }, [repeat[0], repeat[1]]);
}

function TankKit({
  r,
  top,
  clip,
}: {
  r: number;
  top: number;
  clip?: THREE.Plane[];
}) {
  const metal = () => (
    <meshStandardMaterial color="#8e979e" metalness={0.72} roughness={0.32} clippingPlanes={clip} />
  );
  const steps = Math.max(4, Math.floor(top / 0.32));
  return (
    <group>
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <cylinderGeometry args={[r + 0.55, r + 0.7, 0.28, 40]} />
        <meshStandardMaterial color="#c4c0b6" roughness={0.92} />
      </mesh>
      {[0.28, 0.5, 0.72].map((t) => (
        <mesh key={t} position={[0, top * t, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + 0.07, 0.04, 8, 48]} />
          {metal()}
        </mesh>
      ))}
      <mesh position={[0.18, top / 2, -(r + 0.16)]}>
        <boxGeometry args={[0.045, top, 0.045]} />
        {metal()}
      </mesh>
      <mesh position={[-0.18, top / 2, -(r + 0.16)]}>
        <boxGeometry args={[0.045, top, 0.045]} />
        {metal()}
      </mesh>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[0, (i + 0.5) * (top / steps), -(r + 0.16)]}>
          <boxGeometry args={[0.42, 0.025, 0.05]} />
          {metal()}
        </mesh>
      ))}
      <mesh position={[0, top + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 0.78, 0.025, 6, 40]} />
        {metal()}
      </mesh>
      <mesh position={[r * 0.78, top + 0.35, 0]}>
        <boxGeometry args={[0.03, 0.66, 0.03]} />
        {metal()}
      </mesh>
      <mesh position={[-(r * 0.78), top + 0.35, 0]}>
        <boxGeometry args={[0.03, 0.66, 0.03]} />
        {metal()}
      </mesh>
      <mesh position={[r + 0.02, top * 0.62, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
        <meshStandardMaterial color="#9aa3aa" metalness={0.6} roughness={0.38} clippingPlanes={clip} />
      </mesh>
      <mesh position={[r + 0.12, top * 0.28, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.35, 10]} />
        <meshStandardMaterial color="#6e787f" metalness={0.55} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Settling({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = 3.5;
  const tip = 1.5;
  const coneH = 2.02;
  const shellH = 4.28;
  const roofH = 0.8;
  const junction = tip + coneH;
  const shellTop = junction + shellH;
  const open = selected;
  const clip = useFrontCut(item.pos[2], open);
  const sheet = useSheet([7, 3]);
  const wall = (color: string) => (
    <meshStandardMaterial
      color={color}
      map={sheet}
      metalness={0.48}
      roughness={0.42}
      side={THREE.DoubleSide}
      clippingPlanes={clip}
    />
  );
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r * 0.86, junction / 2, Math.sin(a) * r * 0.86]} castShadow>
            <cylinderGeometry args={[0.11, 0.16, junction, 6]} />
            <meshStandardMaterial color={SKIRT} metalness={0.7} roughness={0.35} clippingPlanes={clip} />
          </mesh>
        );
      })}
      <mesh position={[0, tip + coneH / 2, 0]} castShadow>
        <cylinderGeometry args={[r, 0.2, coneH, 40]} />
        {wall(open ? "#9aa6b0" : CLAD)}
      </mesh>
      <mesh position={[0, junction + shellH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r + 0.05, r + 0.05, shellH, 48, 1, open]} />
        {wall(selected ? CLAD_HI : CLAD)}
      </mesh>
      <mesh position={[0, shellTop + roofH / 2, 0]} castShadow>
        <coneGeometry args={[r + 0.08, roofH, 32]} />
        {wall(CLAD)}
      </mesh>
      <TankKit r={r + 0.05} top={shellTop} clip={clip} />
      {open ? (
        <group>
          <mesh position={[0, tip + 1.81 / 2, 0]}>
            <cylinderGeometry args={[3.14, 0.22, 1.81, 32]} />
            <meshStandardMaterial color="#6e7e88" roughness={0.55} clippingPlanes={clip} />
          </mesh>
          <mesh position={[0, tip + (1.81 + 4.39) / 2, 0]}>
            <cylinderGeometry args={[3.28, 3.14, 4.39 - 1.81, 32]} />
            <meshStandardMaterial color="#c49655" roughness={0.48} clippingPlanes={clip} />
          </mesh>
          <mesh position={[0, tip + 1.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 3.05, 40]} />
            <meshBasicMaterial color="#d5dde2" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, tip + 4.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 3.28, 40]} />
            <meshBasicMaterial color="#8a5a22" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function Separator({
  item,
  selected,
  onSelect,
}: {
  item: EqItem;
  selected: boolean;
  onSelect: (t: string) => void;
}) {
  const r = 5.294 / 2;
  const open = selected;
  const clip = useFrontCut(item.pos[2], open);
  const tip = 1.5;
  const coneH = 2.217;
  const shellH = 7.704;
  const junction = 3.717;
  const tangent = 11.421;
  const sheet = useSheet([6, 8]);
  const steel = (color: string) => (
    <meshStandardMaterial
      color={color}
      map={sheet}
      metalness={0.5}
      roughness={0.38}
      side={THREE.DoubleSide}
      clippingPlanes={clip}
    />
  );
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, tip / 2, 0]} castShadow>
        <cylinderGeometry args={[r * 0.78, r * 0.92, tip, 28]} />
        <meshStandardMaterial color={SKIRT} metalness={0.6} roughness={0.4} clippingPlanes={clip} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, tip + coneH / 2, 0]} castShadow>
        <cylinderGeometry args={[r, 0.16, coneH, 40]} />
        {steel(STEEL)}
      </mesh>
      <mesh position={[0, junction + shellH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, shellH, 48, 1, open]} />
        {steel(open ? "#c5ced4" : "#d5dee4")}
      </mesh>
      <mesh position={[0, junction + shellH / 2, 0]}>
        <cylinderGeometry args={[r - 0.08, r - 0.08, shellH, 48, 1, true]} />
        {steel("#243038")}
      </mesh>
      <mesh position={[0, tangent + 0.42, 0]} castShadow>
        <sphereGeometry args={[r, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        {steel(STEEL_HI)}
      </mesh>
      <TankKit r={r} top={tangent} clip={clip} />
      {open ? (
        <group>
          <mesh position={[0, (tip + 7.561) / 2, 0]}>
            <cylinderGeometry args={[2.2, 0.28, 7.561 - tip, 36]} />
            <meshStandardMaterial color="#d2b072" roughness={0.62} clippingPlanes={clip} />
          </mesh>
          <mesh position={[0, 6.415, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 2.15, 40]} />
            <meshBasicMaterial color="#f4efe4" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 7.561, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 2.2, 40]} />
            <meshBasicMaterial color="#6b4a28" side={THREE.DoubleSide} />
          </mesh>
          {[
            [10.42, "T-1"],
            [9.62, "T-3"],
            [8.82, "T-5"],
          ].map(([el]) => (
            <mesh key={String(el)} position={[0, Number(el), 0]}>
              <cylinderGeometry args={[2.35, 2.35, 0.06, 48]} />
              <meshStandardMaterial color="#1e2c36" metalness={0.45} roughness={0.4} />
            </mesh>
          ))}
          {[10.02, 9.22].map((el) => (
            <mesh key={el} position={[0, el, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.225, r - 0.02, 56]} />
              <meshStandardMaterial color="#314550" metalness={0.4} roughness={0.45} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <mesh position={[0, 8.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.225, 2.617, 56]} />
            <meshStandardMaterial color="#1a4a42" metalness={0.35} roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.3, 10.77, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.5, 28]} />
            <meshStandardMaterial color="#5e6e7a" metalness={0.5} roughness={0.38} />
          </mesh>
          <mesh position={[0.3, 10.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.68, 24]} />
            <meshStandardMaterial color="#2a3338" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[1.15, 11.05, 0]}>
            <boxGeometry args={[0.8, 0.35, 0.35]} />
            <meshStandardMaterial color="#6a7882" metalness={0.4} roughness={0.4} />
          </mesh>
          {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
            <mesh key={x} position={[x, 11.295, 0]} rotation={[0.5, 0, 0.35]}>
              <boxGeometry args={[0.08, 0.22, 0.45]} />
              <meshStandardMaterial color="#e7edf1" metalness={0.15} roughness={0.45} />
            </mesh>
          ))}
          <Curtain top={10.52} bot={10.44} rTop={0.45} rBot={0.2} />
          <Curtain top={10.42} bot={10.02} rTop={2.32} rBot={2.52} />
          <Curtain top={10.02} bot={9.62} rTop={1.28} rBot={0.45} />
          <Curtain top={9.62} bot={9.22} rTop={2.32} rBot={2.52} />
          <Curtain top={9.22} bot={8.82} rTop={1.28} rBot={0.45} />
          <Curtain top={8.82} bot={8.42} rTop={2.32} rBot={2.55} />
          <mesh position={[0, (8.42 + 7.561) / 2, 0]}>
            <cylinderGeometry args={[2.58, 2.58, 8.42 - 7.561, 40, 1, true]} />
            <meshStandardMaterial color="#e0a04a" transparent opacity={0.45} roughness={0.25} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, (11.02 + 11.2) / 2, 0]}>
            <cylinderGeometry args={[0.85, 1.1, 0.22, 20, 1, true]} />
            <meshStandardMaterial color="#d7e2ea" transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function AtmTank({ item, selected, onSelect }: { item: EqItem; selected: boolean; onSelect: (t: string) => void }) {
  const r = (item.diameter ?? 6) / 2;
  const h = item.height ?? 8;
  const shellH = h * 0.78;
  const roofH = h * 0.16;
  const open = selected;
  const clip = useFrontCut(item.pos[2], open);
  const sheet = useSheet([6, 5]);
  return (
    <group
      position={item.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.tag);
      }}
    >
      <mesh position={[0, shellH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, shellH, 48, 1, open]} />
        <meshStandardMaterial
          color={selected ? CLAD_HI : CLAD}
          map={sheet}
          metalness={0.5}
          roughness={0.4}
          side={THREE.DoubleSide}
          clippingPlanes={clip}
        />
      </mesh>
      <mesh position={[0, shellH + roofH / 2, 0]} castShadow>
        <coneGeometry args={[r * 1.02, roofH, 32]} />
        <meshStandardMaterial color={CLAD} map={sheet} metalness={0.46} roughness={0.42} side={THREE.DoubleSide} clippingPlanes={clip} />
      </mesh>
      <TankKit r={r} top={shellH} clip={clip} />
      {open ? (
        <mesh position={[0, shellH * 0.32, 0]}>
          <cylinderGeometry args={[r - 0.15, r - 0.15, shellH * 0.62, 32]} />
          <meshStandardMaterial
            color={item.tag.startsWith("TK-8") ? "#c4a15a" : "#6d8f72"}
            roughness={0.5}
            clippingPlanes={clip}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function Curtain({ top, bot, rTop, rBot }: { top: number; bot: number; rTop: number; rBot: number }) {
  const h = Math.max(0.05, top - bot);
  return (
    <mesh position={[0, bot + h / 2, 0]}>
      <cylinderGeometry args={[rTop, rBot, h, 28, 1, true]} />
      <meshStandardMaterial color="#e0a04a" transparent opacity={0.5} roughness={0.22} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Ps03Skid() {
  return (
    <group position={[52, 0, 0]}>
      {[-1.6, 0, 1.6].map((z, i) => (
        <group key={z} position={[-6.2, 0, z - 3]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.1, 0.35, 0.7]} />
            <meshStandardMaterial color="#3e4a52" metalness={0.45} roughness={0.4} />
          </mesh>
          <mesh position={[0.15, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.7, 16]} />
            <meshStandardMaterial color="#5c6b76" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[-0.55, 0.7, 0]} castShadow>
            <boxGeometry args={[0.45, 0.4, 0.4]} />
            <meshStandardMaterial color={i === 2 ? "#8a6a32" : "#1f4d40"} metalness={0.3} roughness={0.45} />
          </mesh>
        </group>
      ))}
      <mesh position={[-6.4, 1.35, 2.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 4.2, 20]} />
        <meshStandardMaterial color="#c5ccd2" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh position={[-4.2, 1.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3.2, 8]} />
        <meshStandardMaterial color={OIL} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Pit({ onSelect, selected }: { onSelect: (t: string) => void; selected: boolean }) {
  const concrete = selected ? "#d5d8d0" : "#c4c7bf";
  const wall = (px: number, py: number, pz: number, sx: number, sy: number, sz: number, key: string) => (
    <mesh key={key} position={[px, py, pz]} castShadow receiveShadow>
      <boxGeometry args={[sx, sy, sz]} />
      <meshStandardMaterial color={concrete} roughness={0.86} metalness={0.02} />
    </mesh>
  );
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect("T-101");
      }}
    >
      {wall(0, -1.55, 0, 8.4, 0.35, 5.4, "floor")}
      {wall(0, -0.7, -2.7, 8.4, 1.7, 0.32, "n")}
      {wall(0, -0.7, 2.7, 8.4, 1.7, 0.32, "s")}
      {wall(-4.05, -0.7, 0, 0.32, 1.7, 5.4, "w")}
      {wall(4.05, -0.7, 0, 0.32, 1.7, 5.4, "e")}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <boxGeometry args={[7.5, 0.12, 4.6]} />
        <meshStandardMaterial color="#3a2c22" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.15, 4.55]} receiveShadow>
        <boxGeometry args={[8.2, 0.18, 3.4]} />
        <meshStandardMaterial color="#b7bbb4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 4.55]} castShadow>
        <boxGeometry args={[8.2, 0.18, 3.4]} />
        <meshStandardMaterial color="#d8dbd4" roughness={0.8} />
      </mesh>
      {[-2.6, -1.3, 0, 1.3, 2.6].map((x, i) => (
        <group key={i} position={[x, -0.55, 4.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.55, 0.45]} />
            <meshStandardMaterial color="#4d5963" metalness={0.55} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.22, 16]} />
            <meshStandardMaterial color="#6a767f" metalness={0.7} roughness={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bund({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const h = 1.15;
  const t = 0.28;
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#c9cdc4" roughness={0.92} />
      </mesh>
      {[
        [0, h / 2, d / 2, w, h, t],
        [0, h / 2, -d / 2, w, h, t],
        [w / 2, h / 2, 0, t, h, d],
        [-w / 2, h / 2, 0, t, h, d],
      ].map(([px, py, pz, sx, sy, sz], i) => (
        <mesh key={i} position={[px as number, py as number, pz as number]} castShadow receiveShadow>
          <boxGeometry args={[sx as number, sy as number, sz as number]} />
          <meshStandardMaterial color="#b7bdb4" roughness={0.84} />
        </mesh>
      ))}
    </group>
  );
}

function Route({ pts, r, color }: { pts: [number, number, number][]; r: number; color: string }) {
  const key = pts.map((p) => p.join(",")).join("|");
  const geo = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    const parts = key.split("|").map((row) => row.split(",").map(Number) as [number, number, number]);
    for (let i = 0; i < parts.length - 1; i++) {
      path.add(new THREE.LineCurve3(new THREE.Vector3(...parts[i]), new THREE.Vector3(...parts[i + 1])));
    }
    return new THREE.TubeGeometry(path, Math.max(parts.length * 8, 12), r, 8, false);
  }, [key, r]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} metalness={0.62} roughness={0.32} />
    </mesh>
  );
}

function Sleepers() {
  const xs = [-2, 8, 18, 30, 42, 54, 66, 78];
  return (
    <group>
      {xs.map((x) => (
        <mesh key={x} position={[x, 0.55, -4]} castShadow>
          <boxGeometry args={[0.35, 1.1, 1.15]} />
          <meshStandardMaterial color="#b7b3a8" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Tk901({ selected, onSelect }: { selected: boolean; onSelect: (t: string) => void }) {
  const clip = useFrontCut(16, true);
  return (
    <group
      position={[11, 0, 16]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("TK-901");
      }}
    >
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[12.2, 0.16, 7.2]} />
        <meshStandardMaterial color={selected ? "#d5d8d0" : "#c3c7be"} roughness={0.88} clippingPlanes={clip} />
      </mesh>
      <mesh position={[-1.2, 0.2, 0]}>
        <boxGeometry args={[5.2, 0.08, 4.2]} />
        <meshStandardMaterial color="#9aa098" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.15, 0]}>
        <boxGeometry args={[10.2, 2.3, 5.6]} />
        <meshStandardMaterial color="#8f978e" roughness={0.86} side={THREE.DoubleSide} clippingPlanes={clip} />
      </mesh>
      <mesh position={[-1.4, -1.15, 0]}>
        <boxGeometry args={[5.6, 1.7, 5.1]} />
        <meshStandardMaterial color="#6f8b92" roughness={0.4} clippingPlanes={clip} />
      </mesh>
      <mesh position={[-1.4, -0.22, 0]}>
        <boxGeometry args={[5.5, 0.12, 5.0]} />
        <meshStandardMaterial color="#c49655" roughness={0.45} />
      </mesh>
      <mesh position={[3.2, -1.35, 0]}>
        <boxGeometry args={[3.2, 1.35, 5.1]} />
        <meshStandardMaterial color="#8eb0b4" roughness={0.35} clippingPlanes={clip} />
      </mesh>
      <mesh position={[1.15, -1.5, 0]}>
        <boxGeometry args={[0.18, 1.5, 5.2]} />
        <meshStandardMaterial color="#6d756c" roughness={0.8} />
      </mesh>
      {[2.5, 3.8].map((x) => (
        <mesh key={x} position={[x, -1.55, 0.4]}>
          <cylinderGeometry args={[0.22, 0.22, 0.7, 12]} />
          <meshStandardMaterial color="#2f3a40" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-2.2, 0.45, 1.6]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.45]} />
        <meshStandardMaterial color="#3d4c46" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[8.2, 0.7, 0]} castShadow>
        <boxGeometry args={[2.4, 1.3, 1.5]} />
        <meshStandardMaterial color="#6a6256" roughness={0.75} />
      </mesh>
    </group>
  );
}

function SpineRoad() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0.04, -9]} receiveShadow>
        <planeGeometry args={[140, 7]} />
        <meshStandardMaterial color="#4a514c" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0.045, -12.35]}>
        <planeGeometry args={[140, 0.12]} />
        <meshStandardMaterial color="#efe6c4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0.045, -5.65]}>
        <planeGeometry args={[140, 0.12]} />
        <meshStandardMaterial color="#efe6c4" />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 8, 0.05, -9]}>
          <planeGeometry args={[3.1, 0.14]} />
          <meshStandardMaterial color="#e4d48a" />
        </mesh>
      ))}
    </group>
  );
}

function Tanker() {
  const wheel = (x: number, z: number) => (
    <mesh key={`${x}-${z}`} position={[x, 0.48, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.48, 0.48, 0.28, 16]} />
      <meshStandardMaterial color="#1c1f22" roughness={0.85} />
    </mesh>
  );
  return (
    <group position={[0, 0, -9]}>
      {[-11.2, -9.4, 2.2, 3.8].map((x) => [wheel(x, -1.05), wheel(x, 1.05)])}
      <mesh position={[-10.2, 1.15, 0]} castShadow>
        <boxGeometry args={[3.4, 1.7, 2.35]} />
        <meshStandardMaterial color="#1f3f38" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[-8.7, 1.55, 0]}>
        <boxGeometry args={[0.9, 0.7, 2.15]} />
        <meshStandardMaterial color="#9ec4d4" metalness={0.1} roughness={0.15} />
      </mesh>
      <mesh position={[-3.2, 1.85, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.22, 1.22, 8.6, 28]} />
        <meshStandardMaterial color="#d7dbe0" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[-7.55, 1.85, 0]} castShadow>
        <sphereGeometry args={[1.18, 20, 12]} />
        <meshStandardMaterial color="#d7dbe0" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[1.15, 1.85, 0]} castShadow>
        <sphereGeometry args={[1.18, 20, 12]} />
        <meshStandardMaterial color="#d7dbe0" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[-3.2, 3.15, 0]}>
        <boxGeometry args={[7.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#8b9398" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.5, 1.15, 0.9]} rotation={[0.5, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 4.2, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function YardBuildings() {
  return (
    <group>
      <mesh position={[6, 1.7, 16]} castShadow receiveShadow>
        <boxGeometry args={[10, 3.4, 6]} />
        <meshStandardMaterial color="#d9ddd6" roughness={0.8} />
      </mesh>
      <mesh position={[6, 2.4, 13.05]}>
        <boxGeometry args={[7.2, 0.7, 0.08]} />
        <meshStandardMaterial color="#24343a" metalness={0.2} roughness={0.2} />
      </mesh>
      <mesh position={[78, 1.4, 18]} castShadow>
        <boxGeometry args={[8, 2.8, 5]} />
        <meshStandardMaterial color="#c8cec6" roughness={0.82} />
      </mesh>
      {[-8, 20, 48, 78, 104].map((x) => (
        <mesh key={x} position={[x, 1.1, 26]} castShadow>
          <boxGeometry args={[0.12, 2.2, 0.12]} />
          <meshStandardMaterial color="#5c6560" />
        </mesh>
      ))}
      <mesh position={[48, 2.05, 26]}>
        <boxGeometry args={[116, 0.06, 0.06]} />
        <meshStandardMaterial color="#5c6560" />
      </mesh>
    </group>
  );
}

function Tag({ text, position }: { text: string; position: [number, number, number] }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 72;
    const g = canvas.getContext("2d");
    if (!g) return null;
    g.fillStyle = "rgba(245,246,237,0.94)";
    g.fillRect(0, 0, 256, 72);
    g.strokeStyle = "#bcc9ba";
    g.strokeRect(2, 2, 252, 68);
    g.fillStyle = "#203b38";
    g.font = "600 32px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 128, 38);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text]);
  if (!map) return null;
  return (
    <sprite position={position} scale={[3.1, 0.86, 1]}>
      <spriteMaterial map={map} transparent depthTest={false} />
    </sprite>
  );
}

function Walk({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useFrame((_, dt) => {
    if (!enabled) return;
    const speed = 9 * dt;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-4) return;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    if (keys.current.w || keys.current.arrowup) camera.position.addScaledVector(forward, speed);
    if (keys.current.s || keys.current.arrowdown) camera.position.addScaledVector(forward, -speed);
    if (keys.current.d || keys.current.arrowright) camera.position.addScaledVector(right, speed);
    if (keys.current.a || keys.current.arrowleft) camera.position.addScaledVector(right, -speed);
    camera.position.y = Math.max(1.7, Math.min(camera.position.y, 18));
  });
  return null;
}

function Rig({ view, walking, shot }: { view: ViewId; walking: boolean; shot: Shot | null }) {
  const { camera, controls } = useThree();
  const started = useRef(0);
  const fromPos = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3(42, 2, 0));
  const active = useRef(true);
  const prev = useRef<string>("");
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const key = `${view}|${shot ? shot.pos.join(",") : ""}|${shot ? shot.target.join(",") : ""}`;

  useFrame((_, dt) => {
    if (prev.current !== key) {
      prev.current = key;
      fromPos.current.copy(camera.position);
      const orbit = controls as { target?: THREE.Vector3 } | null;
      if (orbit?.target) fromTarget.current.copy(orbit.target);
      started.current = 0;
      active.current = true;
    }
    if (!active.current || walking) return;

    const dest = new THREE.Vector3(...(shot ? shot.pos : VIEWS[view].pos));
    const look = new THREE.Vector3(...(shot ? shot.target : VIEWS[view].target));
    const orbit = controls as { target?: THREE.Vector3 } | null;

    if (reduce) {
      camera.position.copy(dest);
      if (orbit?.target) orbit.target.copy(look);
      camera.lookAt(look);
      active.current = false;
      return;
    }

    started.current += dt;
    const t = Math.min(1, started.current / 1.15);
    const ease = 1 - (1 - t) ** 3;
    camera.position.lerpVectors(fromPos.current, dest, ease);
    if (orbit?.target) orbit.target.lerpVectors(fromTarget.current, look, ease);
    camera.lookAt(orbit?.target ?? look);
    if (t >= 1) active.current = false;
  });

  return null;
}

export function Plant({ selected, view, onSelect, showTags, walking, shot }: Props) {
  const yard = useMemo(() => {
    const src = concMap();
    if (!src) return null;
    const map = src.clone();
    map.repeat.set(24, 16);
    return map;
  }, []);
  return (
    <>
      <Rig view={view} walking={walking} shot={shot} />
      <Walk enabled={walking} />
      <color attach="background" args={["#b7c4c6"]} />
      <fog attach="fog" args={["#c5d0cc", 40, 220]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[70, 48, 24]}
        intensity={1.85}
        color="#fff4e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-far={220}
        shadow-camera-left={-30}
        shadow-camera-right={110}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
      <hemisphereLight intensity={0.55} color="#e7f1f6" groundColor="#b7c2b0" />
      <directionalLight position={[-40, 22, -20]} intensity={0.35} color="#d5e4ee" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0, 4]} receiveShadow>
        <planeGeometry args={[180, 120]} />
        <meshStandardMaterial color="#d5d8d0" map={yard} roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, 0.02, -22]} receiveShadow>
        <planeGeometry args={[170, 7]} />
        <meshStandardMaterial color="#8e948c" roughness={0.86} />
      </mesh>

      <SpineRoad />
      <Tanker />
      <YardBuildings />
      <Sleepers />

      <Bund x={22} z={0} w={26} d={36} />
      <Bund x={82} z={0} w={22} d={24} />
      <Bund x={62} z={24} w={12} d={12} />

      {EQUIPMENT.map((item) => {
        const on = selected === item.tag;
        if (item.kind === "pit") return <Pit key={item.tag} selected={on} onSelect={onSelect} />;
        if (item.kind === "effluent") return <Tk901 key={item.tag} selected={on} onSelect={onSelect} />;
        if (item.kind === "settling") return <Settling key={item.tag} item={item} selected={on} onSelect={onSelect} />;
        if (item.kind === "separator")
          return (
            <Separator
              key={item.tag}
              item={item}
              selected={on || view === "ps03Internals" || view === "ps03Films"}
              onSelect={onSelect}
            />
          );
        return <AtmTank key={item.tag} item={item} selected={on} onSelect={onSelect} />;
      })}

      <Ps03Skid />

      {showTags
        ? EQUIPMENT.map((item) => (
            <Tag
              key={item.tag}
              text={item.tag}
              position={[item.pos[0], (item.height ?? 3) + 1.4, item.pos[2]]}
            />
          ))
        : null}

      <Route
        pts={[
          [3.6, 0.3, 4.2],
          [3.6, 1.45, 4.2],
          [3.6, 1.45, -4],
          [20, 1.45, -4],
          [20, 2.6, -4],
          [22, 2.6, -4],
        ]}
        r={0.11}
        color="#b7c0c6"
      />
      <Route
        pts={[
          [24, 2.4, 0],
          [36, 2.4, 0],
          [36, 1.45, 0],
          [49, 1.45, 0],
          [49, 3.4, 0],
          [52, 3.4, 0],
        ]}
        r={0.1}
        color="#b7c0c6"
      />
      <Route
        pts={[
          [54.6, 2.8, 0],
          [64, 2.8, 0],
          [64, 1.45, 0],
          [82, 1.45, 0],
          [82, 2.4, -6],
          [82, 2.4, -9],
        ]}
        r={0.1}
        color="#8ea396"
      />
      <Route
        pts={[
          [22, 1.1, 10],
          [22, 1.1, 16],
          [16, 0.35, 16],
          [14, -0.35, 16],
        ]}
        r={0.08}
        color="#6d8b96"
      />
      <Route
        pts={[
          [8.8, -0.3, 16],
          [4, -0.3, 16],
          [4, 0.45, 8],
          [1, 0.45, 4.2],
        ]}
        r={0.03}
        color={OIL}
      />

      <ContactShadows position={[42, 0.02, 2]} opacity={0.22} scale={140} blur={2.6} far={28} color="#3d4a40" />
    </>
  );
}
