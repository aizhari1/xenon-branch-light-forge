import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EQUIPMENT, VIEWS, type ViewId } from "./equipment";
import { Plant } from "./Plant";

const ORDER = Object.keys(VIEWS) as ViewId[];

type Shot = { pos: [number, number, number]; target: [number, number, number] };

function shotFor(tag: string): Shot | null {
  const eq = EQUIPMENT.find((e) => e.tag === tag);
  if (!eq) return null;
  if (eq.kind === "column") {
    return { pos: [eq.pos[0] + 10, 10, eq.pos[2] + 16], target: [eq.pos[0], 8, eq.pos[2]] };
  }
  if (eq.kind === "settling") {
    return { pos: [eq.pos[0], 5, eq.pos[2] + 12], target: [eq.pos[0], 3, eq.pos[2]] };
  }
  if (eq.kind === "tank" || eq.kind === "silo") {
    return { pos: [eq.pos[0], 8, eq.pos[2] + 14], target: [eq.pos[0], 5, eq.pos[2]] };
  }
  if (eq.kind === "kiln") {
    return { pos: [eq.pos[0], 6, eq.pos[2] - 14], target: [eq.pos[0], 2, eq.pos[2]] };
  }
  if (eq.kind === "pit") {
    return { pos: [eq.pos[0] - 8, 6, eq.pos[2] + 10], target: [eq.pos[0], 0, eq.pos[2]] };
  }
  const y = (eq.height ?? 5) * 0.4;
  return { pos: [eq.pos[0], y + 3, eq.pos[2] + 12], target: [eq.pos[0], y, eq.pos[2]] };
}

export function FactoryView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>("overview");
  const [open, setOpen] = useState(true);
  const [about, setAbout] = useState(false);
  const [mode, setMode] = useState<"orbit" | "walk">("orbit");
  const [tour, setTour] = useState(false);
  const [tags, setTags] = useState(true);
  const [shot, setShot] = useState<Shot | null>(null);
  const item = EQUIPMENT.find((e) => e.tag === selected) ?? null;

  useEffect(() => {
    if (!tour) return;
    const id = window.setInterval(() => {
      setShot(null);
      setView((current) => {
        const i = ORDER.indexOf(current);
        return ORDER[(i + 1) % ORDER.length];
      });
    }, 4800);
    return () => window.clearInterval(id);
  }, [tour]);

  return (
    <main className="spatial">
      <div className="viewport">
        <Canvas
          shadows
          dpr={[1, 1.6]}
          gl={{ localClippingEnabled: true }}
          camera={{ position: [12, 28, 42], fov: 38, near: 0.1, far: 400 }}
          onPointerMissed={() => {
            setSelected(null);
            setShot(null);
          }}
        >
          <Suspense fallback={null}>
            <Plant
              selected={selected}
              view={view}
              onSelect={(tag) => {
                setSelected(tag);
                setShot(shotFor(tag));
              }}
              showTags={tags}
              walking={mode === "walk"}
              shot={shot}
            />
          </Suspense>
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={mode === "walk" ? 0.4 : 6}
            maxDistance={180}
            target={[15, 2, 2]}
            enableZoom={mode === "orbit"}
            enablePan={mode === "orbit"}
          />
        </Canvas>
      </div>

      <header className="topbar">
        <a className="brand" href="#top" onClick={(e) => e.preventDefault()}>
          <span className="brandmark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <strong>
            SEVERO
            <span>SPATIAL EXPERIENCE</span>
          </strong>
        </a>
        <div className="project-title">
          <span className="live-dot" />
          WM OIL PROJECT
          <span>
            <span className="slash">/</span>REFERENCE MATCH · REV P1
          </span>
        </div>
        <button className="icon" type="button" aria-label="About this model" title="About this model" onClick={() => setAbout(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6M12 8h.01" />
          </svg>
        </button>
      </header>

      <div className="heading">
        <div className="eyebrow">
          SITE EXPLORER
          <span>T-21 · T-22 · T-24 · T-6.001 · T-K.002</span>
        </div>
        <h1>SEVERO plant — reference layout</h1>
        <p>Settling train · process column · storage · kiln · reception pits</p>
      </div>

      <aside className={open ? "explorer" : "explorer collapsed"}>
        <button className="panel-title" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 7h16M4 12h10M4 17h16" />
            </svg>
            Explore the facility
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            {open ? <path d="M6 14l6-6 6 6" /> : <path d="M6 10l6 6 6-6" />}
          </svg>
        </button>
        {open ? (
          <>
            <div className="section-label">SAVED PERSPECTIVES</div>
            <nav>
              {ORDER.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  className={view === id ? "view-card active" : "view-card"}
                  onClick={() => {
                    setShot(null);
                    setView(id);
                  }}
                >
                  <span className="view-number">0{i + 1}</span>
                  <span>
                    <b>{VIEWS[id].label}</b>
                    <small>{VIEWS[id].sub}</small>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </nav>
            <div className="divider" />
            <div className="section-label">KEY EQUIPMENT {String(EQUIPMENT.length).padStart(2, "0")}</div>
            <div className="equipment-grid">
              {EQUIPMENT.map((eq) => (
                <button
                  key={eq.tag}
                  type="button"
                  className={selected === eq.tag ? "chosen" : ""}
                  onClick={() => {
                    setSelected(eq.tag);
                    setShot(shotFor(eq.tag));
                  }}
                >
                  <i className="tiny-dot" />
                  {eq.tag}
                </button>
              ))}
            </div>
            <div className="panel-foot">
              Reference-matched layout
              <b>REV P1</b>
            </div>
          </>
        ) : null}
      </aside>

      {item ? (
        <aside className="detail-card">
          <button className="close" type="button" aria-label="Close equipment details" onClick={() => { setSelected(null); setShot(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h3>{item.unit}</h3>
          <h2>{item.tag}</h2>
          <p>{item.name}. {item.service}</p>
          <div className="detail-spec">
            {item.diameter ? <div>Diameter {item.diameter} m</div> : null}
            {item.height ? <div>Height {item.height} m</div> : null}
            {item.volume ? <div>Volume {item.volume} m³</div> : null}
            <div>{item.type}</div>
          </div>
          <small>
            {item.dimStatus} · {item.source}
            {item.notes ? ` · ${item.notes}` : ""}
          </small>
        </aside>
      ) : null}

      <div className="bottom">
        <div className="mode-switch">
          <button type="button" className={mode === "orbit" ? "selected" : ""} onClick={() => setMode("orbit")}>
            Orbit mode
          </button>
          <button type="button" className={mode === "walk" ? "selected" : ""} onClick={() => setMode("walk")}>
            Walk mode
          </button>
        </div>
        <button type="button" className={tour ? "tour-button on" : "tour-button"} onClick={() => setTour((v) => !v)}>
          {tour ? "Stop tour" : "Take a guided tour"}
          <span className="tour-duration">{ORDER.length} VIEWS</span>
        </button>
        <button
          className="reset"
          type="button"
          aria-label="Reset view"
          title="Reset view"
          onClick={() => {
            setView("overview");
            setSelected(null);
            setTour(false);
            setMode("orbit");
            setShot(null);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5" />
          </svg>
        </button>
        <button className="reset" type="button" aria-label="Toggle equipment tags" title="Toggle equipment tags" onClick={() => setTags((v) => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
      </div>

      <div className="instruction">
        <div>{mode === "walk" ? "Use arrows to move · Drag to look" : "Drag to orbit · Scroll to zoom · Right-drag to pan"}</div>
        <span>REFERENCE MATCH · REV P1</span>
      </div>

      {about ? (
        <div className="modal-backdrop" onClick={() => setAbout(false)}>
          <div className="about" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="about-title">
            <h2 id="about-title">About this model</h2>
            <p>
              Interactive 3D reconstruction matching the reference plant layout: T-21, T-22, T-24 settling tanks,
              process column, T-6.001 / T-K.002 storage, Cement Silo, rotary kiln, heat exchanger, and reception pits.
            </p>
            <p>Orbit and walk modes available. Click any equipment for details.</p>
            <div className="about-note">
              Geometry is approximate and built to match the visual reference. Not a surveyed GA or photogrammetry scan.
            </div>
            <button className="tour-button" type="button" style={{ marginTop: 18 }} onClick={() => setAbout(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
