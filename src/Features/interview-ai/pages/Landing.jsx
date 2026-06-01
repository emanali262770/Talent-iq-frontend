import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import "./Landing.scss";
import { useAuth } from "../../auth/hooks/useAuth";

const featureCards = [
  {
    title: "Role Intelligence",
    copy: "Extract hiring signals, expectations, and role priorities from any job description before you start prep.",
  },
  {
    title: "Resume Fit Mapping",
    copy: "Map your strongest evidence directly to the role so your interview narrative is clear and relevant.",
  },
  {
    title: "Theme Prediction",
    copy: "Surface likely interview themes and question directions based on role requirements and profile context.",
  },
  {
    title: "Strength Signals",
    copy: "Identify what to highlight first so your most convincing stories appear early in the conversation.",
  },
  {
    title: "Gap Visibility",
    copy: "Spot weak areas and prepare clear responses before they become blockers during interviews.",
  },
  {
    title: "Saved Reports",
    copy: "Store generated strategies and revisit them across multiple opportunities without starting from zero.",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste the target role",
    copy: "Share the job description to capture responsibilities, hiring criteria, and contextual expectations.",
  },
  {
    number: "02",
    title: "Upload your profile",
    copy: "Add your resume with optional notes on wins, project outcomes, transitions, and role preferences.",
  },
  {
    number: "03",
    title: "Generate strategy",
    copy: "Receive a focused interview plan with fit score, role narrative, preparation priorities, and risks.",
  },
];

const faqs = [
  {
    q: "What does Talent IQ generate?",
    a: "Talent IQ generates a role-specific interview strategy using your job description, resume, and optional profile context.",
  },
  {
    q: "Does this support non-technical roles?",
    a: "Yes. The workflow works for technical and non-technical roles because it adapts analysis to the role description.",
  },
  {
    q: "Can I manage multiple interview reports?",
    a: "Yes. Generated reports are saved so you can compare and revisit preparation plans for different roles.",
  },
];

/* ─────────────────────────────────────────────────────────────────
   NETWORK VISUAL  — fixed version
   Fixes applied:
     1. Fibonacci-sphere node distribution → proper round 3-D shape
     2. Mouse parallax uses window-relative clientX/Y → stable on scroll
     3. overflow: visible on .hero-visual → no edge clipping
───────────────────────────────────────────────────────────────── */
const NetworkVisual = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ──────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Palette ────────────────────────────────────────────────
    const BONE  = new THREE.Color("#c8b89a");
    const GOLD  = new THREE.Color("#d4a853");
    const DIM   = new THREE.Color("#3a3228");
    const WHITE = new THREE.Color("#f0ece4");

    // ── FIX 1: Fibonacci-sphere distribution ──────────────────
    // Nodes are evenly distributed across a sphere surface,
    // so the mesh looks spherical from all angles — not flat.
    const nodeCount   = 100;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const positions   = [];

    for (let i = 0; i < nodeCount; i++) {
      const y      = 1 - (i / (nodeCount - 1)) * 2;           // [-1, 1]
      const r      = Math.sqrt(Math.max(0, 1 - y * y));
      const phi    = goldenAngle * i;
      const radius = 3.2 + (Math.random() - 0.5) * 1.4;       // slight jitter

      positions.push(
        new THREE.Vector3(
          Math.cos(phi) * r * radius * 1.15,
          y              * radius * 0.9,
          Math.sin(phi) * r * radius,
        ),
      );
    }

    // ── Edges ──────────────────────────────────────────────────
    const lineVerts  = [];
    const lineColors = [];
    const CONNECT    = 3.0;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const d = positions[i].distanceTo(positions[j]);
        if (d < CONNECT) {
          lineVerts.push(
            positions[i].x, positions[i].y, positions[i].z,
            positions[j].x, positions[j].y, positions[j].z,
          );
          const t = 1 - d / CONNECT;
          const c = t > 0.6 ? GOLD : (t > 0.3 ? BONE : DIM);
          lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
    lineGeo.setAttribute("color",    new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);

    const root = new THREE.Group();
    root.add(lines);
    scene.add(root);

    // ── Point cloud ────────────────────────────────────────────
    const nodePos = new Float32Array(nodeCount * 3);
    const nodeCol = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      nodePos[i * 3]     = positions[i].x;
      nodePos[i * 3 + 1] = positions[i].y;
      nodePos[i * 3 + 2] = positions[i].z;

      const isHub = Math.random() > 0.78;
      const c = isHub ? GOLD : (Math.random() > 0.5 ? BONE : WHITE);
      nodeCol[i * 3]     = c.r;
      nodeCol[i * 3 + 1] = c.g;
      nodeCol[i * 3 + 2] = c.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute("color",    new THREE.BufferAttribute(nodeCol, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true,
      transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true,
    });
    root.add(new THREE.Points(nodeGeo, nodeMat));

    // ── Pulse rings ────────────────────────────────────────────
    const pulseRings = [];
    for (let k = 0; k < 3; k++) {
      const pts = Array.from({ length: 81 }, (_, i) => {
        const a = (i / 80) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      });
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: GOLD, transparent: true, opacity: 0, depthWrite: false,
      });
      const ring = new THREE.Line(geo, mat);
      ring.rotation.x = Math.PI * 0.3 * k;
      ring.rotation.z = Math.PI * 0.15 * k;
      ring.userData.phase = k * 2.1;
      root.add(ring);
      pulseRings.push({ ring, mat, geo });
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // ── Resize ─────────────────────────────────────────────────
    const onResize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    // ── FIX 2: Mouse uses window-relative coords ───────────────
    // clientX/Y are always relative to the viewport, so scrolling
    // the page never shifts the parallax target unexpectedly.
    let targetMx = 0, targetMy = 0;
    let currentMx = 0, currentMy = 0;

    const onMove = (e) => {
      targetMx =  (e.clientX / window.innerWidth  - 0.5) *  0.55;
      targetMy = -(e.clientY / window.innerHeight - 0.5) * 0.32;
    };

    // ── Animation loop ─────────────────────────────────────────
    let autoRotY = 0, autoRotX = 0, frame;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      autoRotY += 0.0016;
      autoRotX += 0.00035;

      currentMx += (targetMx - currentMx) * 0.045;
      currentMy += (targetMy - currentMy) * 0.045;

      root.rotation.y = autoRotY + currentMx;
      root.rotation.x = autoRotX + currentMy;

      pulseRings.forEach(({ ring, mat }) => {
        const phase = (t * 0.4 + ring.userData.phase) % 3.5;
        ring.scale.setScalar(0.4 + phase * 1.3);
        mat.opacity = phase < 1.75
          ? phase * 0.085
          : Math.max(0, (3.5 - phase) * 0.055);
      });

      // Subtle scroll zoom (no side-effects on rotation)
      const scrollY = parseFloat(
        document.documentElement.style.getPropertyValue("--landing-progress") || "0",
      );
      camera.position.z = 12 + scrollY * 0.003;

      renderer.render(scene, camera);
    };

    onResize();
    animate();
    window.addEventListener("resize",      onResize, { passive: true });
    window.addEventListener("pointermove", onMove,   { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize",      onResize);
      window.removeEventListener("pointermove", onMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      lineGeo.dispose(); lineMat.dispose();
      nodeGeo.dispose(); nodeMat.dispose();
      pulseRings.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
    };
  }, []);

  return <div className="network-visual" ref={mountRef} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────────────── */
const GlobeVisual = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const radius = 1.55;
    const sphere = new THREE.Group();
    scene.add(sphere);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 72, 72),
      new THREE.MeshPhongMaterial({
        color: 0x050b16,
        emissive: 0x01040a,
        shininess: 42,
        specular: 0x2d5f94,
      }),
    );
    sphere.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.08, 72, 72),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.74 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
            gl_FragColor = vec4(0.24, 0.55, 0.95, intensity * 0.62);
          }
        `,
      }),
    );
    scene.add(atmosphere);

    const latLonToVector = (lat, lon, r) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    };

    const gridMat = new THREE.LineBasicMaterial({
      color: 0x1a3a6a,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 2) {
        points.push(latLonToVector(lat, lon, radius + 0.004));
      }
      sphere.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
    }

    for (let lon = -180; lon < 180; lon += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        points.push(latLonToVector(lat, lon, radius + 0.004));
      }
      sphere.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
    }

    const outlines = [
      [
        [70, -140], [64, -90], [50, -60], [32, -80], [18, -96], [8, -78],
        [20, -105], [35, -122], [50, -126], [62, -150], [70, -140],
      ],
      [
        [12, -72], [2, -80], [-16, -75], [-34, -72], [-55, -67], [-45, -52],
        [-22, -43], [-6, -35], [5, -54], [12, -72],
      ],
      [
        [72, -8], [58, 6], [44, -4], [36, -6], [38, 20], [52, 34],
        [64, 28], [72, -8],
      ],
      [
        [37, -6], [32, 12], [12, 16], [-6, 12], [-34, 18], [-34, 30],
        [-18, 38], [8, 46], [31, 32], [37, -6],
      ],
      [
        [68, 28], [76, 96], [64, 142], [42, 130], [22, 108], [8, 100],
        [22, 88], [8, 78], [30, 72], [40, 44], [52, 34], [68, 28],
      ],
      [
        [-12, 130], [-24, 114], [-38, 140], [-30, 153], [-16, 146], [-12, 130],
      ],
    ];

    const outlineMat = new THREE.LineBasicMaterial({
      color: 0x6cb6ff,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    outlines.forEach((outline) => {
      const points = outline.map(([lat, lon]) => latLonToVector(lat, lon, radius + 0.014));
      sphere.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), outlineMat));
    });

    const dotPositions = [];
    const dotColors = [];

    for (let i = 0; i < 13000; i++) {
      const lat = Math.random() * 180 - 90;
      const lon = Math.random() * 360 - 180;
      const onLand =
        (lat > 8 && lat < 72 && lon > -170 && lon < -50) ||
        (lat > -56 && lat < 14 && lon > -82 && lon < -34) ||
        (lat > 35 && lat < 72 && lon > -10 && lon < 50) ||
        (lat > -36 && lat < 38 && lon > -18 && lon < 52) ||
        (lat > -10 && lat < 74 && lon > 26 && lon < 146) ||
        (lat > -44 && lat < -10 && lon > 112 && lon < 154);

      if (!onLand) continue;

      const point = latLonToVector(lat, lon, radius + 0.01);
      dotPositions.push(point.x, point.y, point.z);

      if (Math.random() < 0.12) dotColors.push(0.83, 0.66, 0.33);
      else if (Math.random() < 0.45) dotColors.push(0.34, 0.62, 0.94);
      else dotColors.push(0.12, 0.28, 0.5);
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(dotPositions), 3),
    );
    dotGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(dotColors), 3),
    );

    const dotMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.012,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    sphere.add(new THREE.Points(dotGeo, dotMat));

    const starPositions = [];
    for (let i = 0; i < 1000; i++) {
      const starRadius = 12 + Math.random() * 12;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      starPositions.push(
        starRadius * Math.sin(phi) * Math.cos(theta),
        starRadius * Math.cos(phi),
        starRadius * Math.sin(phi) * Math.sin(theta),
      );
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(starPositions), 3),
    );
    const starMat = new THREE.PointsMaterial({
      color: 0xf0ece4,
      size: 0.045,
      transparent: true,
      opacity: 0.42,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const cities = [
      { lat: 40.7, lon: -74 },
      { lat: 51.5, lon: -0.1 },
      { lat: 35.6, lon: 139.7 },
      { lat: 22.3, lon: 114.2 },
      { lat: 37.6, lon: -122.4 },
      { lat: 19.0, lon: 72.8 },
      { lat: -33.9, lon: 151.2 },
      { lat: 1.3, lon: 103.8 },
      { lat: 30.0, lon: 31.2 },
      { lat: 28.6, lon: 77.2 },
    ];

    const rings = [];
    cities.forEach((city) => {
      const position = latLonToVector(city.lat, city.lon, radius + 0.018);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0xd4a853,
          transparent: true,
          opacity: 0.95,
        }),
      );
      dot.position.copy(position);
      sphere.add(dot);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4a853,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.042, 28), ringMat);
      ring.position.copy(position);
      ring.lookAt(position.clone().multiplyScalar(2));
      sphere.add(ring);
      rings.push({ ring, ringMat, phase: Math.random() * Math.PI * 2 });
    });

    const createArc = (from, to, color = 0xd4a853) => {
      const start = latLonToVector(from.lat, from.lon, radius + 0.02);
      const end = latLonToVector(to.lat, to.lon, radius + 0.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(radius * 1.45);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(56);
      const arcMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), arcMat);
      sphere.add(arc);
      return { arc, arcMat, phase: Math.random() * Math.PI * 2 };
    };

    const arcs = [
      createArc(cities[0], cities[1]),
      createArc(cities[1], cities[2], 0x4a9eff),
      createArc(cities[4], cities[5]),
      createArc(cities[5], cities[7], 0x4a9eff),
      createArc(cities[2], cities[6]),
      createArc(cities[8], cities[1], 0x4a9eff),
      createArc(cities[9], cities[7]),
    ];

    scene.add(new THREE.AmbientLight(0x101828, 0.95));

    const sun = new THREE.DirectionalLight(0xffffff, 1.35);
    sun.position.set(4, 3, 3);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x2255aa, 0.65);
    rim.position.set(-3, -2, -3);
    scene.add(rim);

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let frame;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const move = (event) => {
      const rect = mount.getBoundingClientRect();
      mx = (event.clientX - rect.left) / rect.width - 0.5;
      my = (event.clientY - rect.top) / rect.height - 0.5;
    };

    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      tx += (mx * 0.6 - tx) * 0.04;
      ty += (-my * 0.4 - ty) * 0.04;

      sphere.rotation.y = time * 0.055 + tx * 0.5;
      sphere.rotation.x = ty * 0.3;
      stars.rotation.y = time * 0.006;

      rings.forEach(({ ring, ringMat, phase }) => {
        const pulse = Math.sin(time * 1.4 + phase) * 0.5 + 0.5;
        ring.scale.setScalar(1 + pulse * 1.2);
        ringMat.opacity = 0.6 * (1 - pulse * 0.85);
      });

      arcs.forEach(({ arcMat, phase }, index) => {
        arcMat.opacity = 0.12 + Math.sin(time * 0.7 + phase + index) * 0.08 + 0.14;
      });

      renderer.render(scene, camera);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", move);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", move);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, []);

  return <div className="network-visual" ref={mountRef} aria-hidden="true" />;
};

const Landing = () => {
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/register";

  useEffect(() => {
    const updateScroll = () => {
      document.documentElement.style.setProperty(
        "--landing-progress",
        String(window.scrollY),
      );
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      document.documentElement.style.removeProperty("--landing-progress");
    };
  }, []);

  return (
    <main className="tiq-landing">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="tiq-nav">
        <Link to="/" className="brand">
          <span>TIQ</span>
          Talent IQ
        </Link>
        <div className="center-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="action-links">
          <Link to="/login">Login</Link>
          <Link className="primary-link" to={appPath}>
            {user ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">AI-powered interview preparation</span>
          <h1>Turn every job application into a focused interview strategy.</h1>
          <p>
            Talent IQ analyzes your target role and resume, then builds a clear
            preparation roadmap around your strongest proof points, likely
            interview themes, and high-risk gaps.
          </p>
          <div className="hero-ctas">
            <Link to={appPath} className="btn-primary">
              Create strategy
            </Link>
            <a href="#workflow" className="btn-secondary">
              See workflow
            </a>
          </div>
          <div className="metrics">
            <article>
              <strong>86%</strong>
              <span>Role fit score</span>
            </article>
            <article>
              <strong>24</strong>
              <span>Signals found</span>
            </article>
            <article>
              <strong>6 areas</strong>
              <span>Prep focus</span>
            </article>
          </div>
        </div>

        {/* FIX 3: hero-visual overflow: visible → no edge clip */}
        <div className="hero-visual">
          <GlobeVisual />
        </div>
      </section>

      {/* ── Tag strip ────────────────────────────────────────── */}
      <section className="tag-strip">
        {["Resume", "Role Fit", "AI Plan", "Reports", "Questions", "Strategy"].map(
          (item) => (
            <span key={item}>{item}</span>
          ),
        )}
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="section-title">
          <span className="kicker">Product value</span>
          <h2>Built for candidates who want preparation with direction.</h2>
          <p>
            Talent IQ keeps your preparation grounded in the actual role, not
            generic tips. You get a strategy that reflects job expectations and
            your own candidate profile.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────── */}
      <section className="workflow" id="workflow">
        <div className="section-title sticky">
          <span className="kicker">Workflow</span>
          <h2>Simple input. Deep analysis. Clear output.</h2>
          <p>
            The flow stays clean: role input, profile upload, strategy
            generation, and report history for future opportunities.
          </p>
        </div>
        <div className="step-stack">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Demo ─────────────────────────────────────────────── */}
      <section className="demo">
        <div className="demo-copy">
          <span className="kicker">Product demo</span>
          <h2>A report layout that feels structured and actionable.</h2>
          <p>
            Your final report separates strategic summary, likely theme
            directions, talking points, and gap handling so preparation is
            focused and practical.
          </p>
        </div>
        <div className="demo-pane">
          <div className="row active">
            <strong>Strategic summary</strong>
            <p>Role-fit positioning and interview direction.</p>
          </div>
          <div className="row">
            <strong>Likely interview themes</strong>
            <p>Question clusters based on role requirements and profile gaps.</p>
          </div>
          <div className="row">
            <strong>Talking points</strong>
            <p>Prepared stories tied to impact, ownership, and outcomes.</p>
          </div>
        </div>
      </section>

      {/* ── Quotes ───────────────────────────────────────────── */}
      <section className="quotes">
        <article>
          <p>
            "The biggest win was focus. I knew exactly what to prepare and what
            to emphasize in the interview."
          </p>
          <strong>Frontend candidate</strong>
        </article>
        <article>
          <p>
            "It helps candidates frame their profile around role expectations,
            not just resume bullet points."
          </p>
          <strong>Recruitment mentor</strong>
        </article>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="faq" id="faq">
        <div className="section-title">
          <span className="kicker">FAQ</span>
          <h2>Questions before you start.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              onClick={(e) => {
                const allDetails = e.currentTarget
                  .closest(".faq-list")
                  .querySelectorAll("details");
                allDetails.forEach((d) => {
                  if (d !== e.currentTarget) d.removeAttribute("open");
                });
              }}
            >
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="final-cta">
        <div>
          <span className="kicker">Start preparing</span>
          <h2>Create your first interview strategy today.</h2>
          <p>
            Add the job description, upload your resume, and generate a focused
            plan for your next interview.
          </p>
        </div>
        <Link to={appPath} className="btn-primary">
          Start now
        </Link>
      </section>
    </main>
  );
};

export default Landing;
