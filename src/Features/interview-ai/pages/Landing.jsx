import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const demoTabs = {
  summary: {
    title: "Strategic Summary",
    subtitle: "Role-fit positioning and interview direction",
    details: [
      { label: "Target Role", val: "Senior Full-Stack Engineer" },
      { label: "Key Value Proposition", val: "Proven experience scaling distributed Node & React systems with 99.9% uptime." },
      { label: "Positioning Angle", val: "Lead with technical architecture depth and cross-functional project ownership." },
    ],
  },
  themes: {
    title: "Likely Interview Themes",
    subtitle: "Question clusters based on role requirements and profile gaps",
    details: [
      { label: "System Design", val: "Microservices decomposition, caching hierarchies (Redis), and event queues." },
      { label: "Leadership & Impact", val: "Mentoring junior engineers and resolving cross-team API contract disputes." },
      { label: "Behavioral", val: "Handling production incidents and post-mortem accountability." },
    ],
  },
  talking: {
    title: "Prepared Talking Points",
    subtitle: "Structured stories tied to impact, ownership, and measurable outcomes",
    details: [
      { label: "Story 1: Migration", val: "Led zero-downtime migration of legacy monolith to containerized services." },
      { label: "Story 2: Performance", val: "Reduced P95 API latency by 42% through query optimization and indexing." },
      { label: "Story 3: Culture", val: "Introduced RFC design review culture and automated CI/CD security scanning." },
    ],
  },
};

const faqs = [
  {
    q: "What does Talent IQ generate?",
    a: "Talent IQ generates a role-specific interview strategy using your job description, resume, and optional profile context. You get tailored technical and behavioral question clusters, skill gap analysis, and a structured preparation roadmap.",
  },
  {
    q: "Does this support non-technical roles?",
    a: "Yes. The AI workflow analyzes any job description—product, marketing, sales, design, or engineering—and structures talking points around role-specific expectations.",
  },
  {
    q: "Can I manage multiple interview reports?",
    a: "Yes. All generated reports are securely saved in your 'My Reports' dashboard so you can compare, review, and revisit preparation plans for different opportunities.",
  },
  {
    q: "How does Talent IQ handle my resume data?",
    a: "Your resume and data are processed solely to analyze role compatibility and generate your personalized interview roadmap. We prioritize privacy and security.",
  },
];

/* ─────────────────────────────────────────────────────────────────
   GLOBE VISUAL — Perfect sphere, realistic land, no oval distortion
───────────────────────────────────────────────────────────────── */
const GlobeVisual = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    camera.position.set(0, 0, 5.0);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const R = 1.7; // globe radius

    // ── Ocean base sphere ──────────────────────────────────────
    earthGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R, 128, 128),
        new THREE.MeshPhongMaterial({
          color: new THREE.Color(0x071525),
          emissive: new THREE.Color(0x010408),
          specular: new THREE.Color(0x1a4a8a),
          shininess: 90,
        })
      )
    );

    // ── Outer atmosphere glow (BackSide fresnel) ───────────────
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.14, 64, 64),
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
          vertexShader: `
            varying vec3 vNormal;
            void main(){
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }`,
          fragmentShader: `
            varying vec3 vNormal;
            void main(){
              float rim = 1.0 - abs(dot(vNormal, vec3(0,0,1)));
              float a   = pow(rim, 2.2) * 0.9;
              gl_FragColor = vec4(mix(vec3(0.06,0.18,0.6), vec3(0.2,0.52,1.0), rim), a);
            }`,
        })
      )
    );

    // ── Inner edge tint ────────────────────────────────────────
    earthGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.005, 64, 64),
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
          vertexShader: `
            varying vec3 vNormal;
            void main(){
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }`,
          fragmentShader: `
            varying vec3 vNormal;
            void main(){
              float rim = 1.0 - abs(dot(vNormal, vec3(0,0,1)));
              gl_FragColor = vec4(0.15, 0.45, 0.95, pow(rim,3.2)*0.22);
            }`,
        })
      )
    );

    // ── Utility: lat/lon → cartesian ──────────────────────────
    const toVec = (lat, lon, r = R) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // ── Land detection (rectangle unions) ─────────────────────
    const LAND_RECTS = [
      [-130, -52, 25, 60],
      [-140, -60, 60, 75],
      [-118, -86, 15, 30],
      [-92, -77, 7, 20],
      [-56, -18, 60, 84],
      [-78, -59, -5, 12],
      [-80, -34, -22, -5],
      [-74, -48, -40, -22],
      [-72, -62, -55, -40],
      [-10, 32, 36, 72],
      [-10, 30, 60, 72],
      [-24, -13, 63, 67],
      [-6, 38, 30, 37],
      [-18, 42, 0, 30],
      [12, 40, -20, 0],
      [16, 33, -35, -20],
      [43, 51, -26, -12],
      [34, 62, 14, 42],
      [30, 140, 40, 78],
      [62, 130, 22, 40],
      [72, 110, 8, 22],
      [95, 142, -8, 8],
      [128, 146, 30, 46],
      [116, 128, 5, 20],
      [95, 136, -8, 6],
      [114, 154, -38, -20],
      [124, 142, -20, -10],
      [166, 178, -46, -34],
      [100, 180, 50, 78],
      [-180, -165, 50, 78],
      [-170, -130, 54, 72],
    ];

    const isLand = (lat, lon) => {
      for (const [lonMin, lonMax, latMin, latMax] of LAND_RECTS) {
        if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) return true;
      }
      return false;
    };

    // ── Sun direction ─────────────────────────────────────────
    const sunDir = new THREE.Vector3(1.2, 0.4, 0.8).normalize();

    // ── Land + ocean dot cloud ────────────────────────────────
    const pos = [],
      col = [];

    for (let i = 0; i < 60000; i++) {
      const u = Math.random();
      const v = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = v * 360 - 180;
      if (!isLand(lat, lon)) continue;

      const pt = toVec(lat, lon, R + 0.007);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      pos.push(pt.x, pt.y, pt.z);

      if (Math.random() < 0.012) {
        col.push(0.86, 0.73, 0.36);
      } else if (sun > 0.08) {
        const r = Math.random();
        if (r < 0.28) col.push(0.14, 0.34, 0.18);
        else if (r < 0.52) col.push(0.26, 0.44, 0.24);
        else if (r < 0.68) col.push(0.48, 0.52, 0.3);
        else if (r < 0.8) col.push(0.5, 0.4, 0.26);
        else if (r < 0.91) col.push(0.64, 0.56, 0.38);
        else col.push(0.85, 0.84, 0.82);
      } else {
        col.push(0.06, 0.1, 0.18);
      }
    }

    // Ocean glints
    for (let i = 0; i < 6000; i++) {
      const u = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = Math.random() * 360 - 180;
      if (isLand(lat, lon)) continue;
      const pt = toVec(lat, lon, R + 0.003);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      if (sun < 0.55 || Math.random() > sun * 0.1) continue;
      pos.push(pt.x, pt.y, pt.z);
      col.push(0.28 + sun * 0.28, 0.48 + sun * 0.18, 0.82 + sun * 0.12);
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    dotGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
    const dotMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.008,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      sizeAttenuation: true,
    });
    earthGroup.add(new THREE.Points(dotGeo, dotMat));

    // ── Night city lights ─────────────────────────────────────
    const nPos = [],
      nCol = [];
    for (let i = 0; i < 80000; i++) {
      const u = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = Math.random() * 360 - 180;
      if (!isLand(lat, lon)) continue;
      const pt = toVec(lat, lon, R + 0.01);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      if (sun > 0.12 || Math.random() > 0.06) continue;
      nPos.push(
        pt.x + (Math.random() - 0.5) * 0.006,
        pt.y + (Math.random() - 0.5) * 0.006,
        pt.z + (Math.random() - 0.5) * 0.006
      );
      const r2 = Math.random();
      if (r2 < 0.5) nCol.push(0.96, 0.9, 0.62);
      else if (r2 < 0.8) nCol.push(0.82, 0.92, 1.0);
      else nCol.push(1.0, 0.68, 0.28);
    }
    if (nPos.length > 0) {
      const nGeo = new THREE.BufferGeometry();
      nGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nPos), 3));
      nGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(nCol), 3));
      earthGroup.add(
        new THREE.Points(
          nGeo,
          new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.012,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            sizeAttenuation: true,
          })
        )
      );
    }

    // ── Lat/lon grid ──────────────────────────────────────────
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x1a3660,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lon = -180; lon <= 181; lon += 4) pts.push(toVec(lat, lon, R + 0.003));
      earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let lat = -88; lat <= 88; lat += 4) pts.push(toVec(lat, lon, R + 0.003));
      earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // ── Starfield ──────────────────────────────────────────────
    const sPos = [];
    for (let i = 0; i < 2000; i++) {
      const r = 35 + Math.random() * 25;
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * Math.PI * 2;
      sPos.push(r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sPos), 3));
    const stars = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({
        color: 0xf0ece6,
        size: 0.048,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
      })
    );
    scene.add(stars);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x06101e, 0.9));
    const sun = new THREE.DirectionalLight(0xfff8f0, 2.4);
    sun.position.set(5, 2, 3.5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x112255, 0.5);
    rim.position.set(-4, -1.5, -3);
    scene.add(rim);

    // ── Mouse parallax ─────────────────────────────────────────
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0;
    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width - 0.5;
      my = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(mount);

    // ── Animation ─────────────────────────────────────────────
    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      tx += (mx * 0.5 - tx) * 0.04;
      ty += (-my * 0.3 - ty) * 0.04;

      earthGroup.rotation.y = t * 0.042 + tx * 0.38;
      earthGroup.rotation.x = ty * 0.22;
      stars.rotation.y = t * 0.004;

      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize, { passive: true });
    mount.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      sGeo.dispose();
    };
  }, []);

  return <div className="globe-mount" ref={mountRef} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────────────── */
const Landing = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("summary");

  const appPath = user ? "/dashboard" : "/register";

  useEffect(() => {
    const updateScroll = () => {
      document.documentElement.style.setProperty("--landing-progress", String(window.scrollY));
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
      {/* Nav */}
      <nav className="tiq-nav">
        <Link
          to={user ? "/dashboard" : "/"}
          className="brand"
          title="Talent IQ"
        >
          <span className="brand-badge">TIQ</span>
          <span className="brand-name">Talent IQ</span>
        </Link>

        <div className="center-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#demo">Preview</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="action-links">
          {user ? (
            <>
              <Link className="nav-secondary-link" to="/dashboard">
                Dashboard
              </Link>
              <Link className="nav-secondary-link" to="/interview-reports">
                My Reports
              </Link>
              <span className="user-pill">{user.userName || user.email}</span>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={async () => {
                  await handleLogout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link className="primary-link" to="/register">
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>
              Workflow
            </a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)}>
              Preview
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </a>
            <div className="mobile-actions">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="mobile-btn primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Open Dashboard
                  </Link>
                  <Link
                    to="/interview-reports"
                    className="mobile-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Reports
                  </Link>
                  <button
                    className="mobile-btn logout"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleLogout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="mobile-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-btn primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">
            <span className="pulse-indicator"></span>
            AI-Powered Interview Intelligence
          </div>
          <h1>Turn Every Job Application into a Focused Interview Strategy.</h1>
          <p>
            Talent IQ analyzes target job descriptions alongside your resume to generate
            structured question clusters, talking points, and prioritized skill gaps—so you enter
            every conversation prepared to win.
          </p>
          <div className="hero-ctas">
            <Link to={appPath} className="btn-primary">
              <span>{user ? "Open Dashboard" : "Build Your Strategy"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#workflow" className="btn-secondary">
              See Workflow
            </a>
          </div>

          <div className="metrics">
            <article>
              <strong>94%</strong>
              <span>Target Role Match</span>
            </article>
            <article>
              <strong>24+</strong>
              <span>Interview Signals</span>
            </article>
            <article>
              <strong>6 Core</strong>
              <span>Prep Focus Areas</span>
            </article>
          </div>
        </div>

        {/* Globe Visual + Floating Preview Card */}
        <div className="hero-visual">
          <GlobeVisual />
          <div className="hero-floating-card">
            <div className="floating-badge">
              <span className="live-dot"></span> LIVE ANALYSIS
            </div>
            <h4>Senior Software Engineer</h4>
            <div className="match-pill">94% Match Score</div>
            <div className="floating-tags">
              <span>Architecture</span>
              <span>Distributed Systems</span>
              <span>Leadership</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tag Strip */}
      <section className="tag-strip">
        {[
          "Resume Matching",
          "Role Signals",
          "Question Clusters",
          "Gap Detection",
          "Strategic Prep",
          "Saved History",
        ].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-title">
          <span className="kicker">Engineered For Clarity</span>
          <h2>Built For Candidates Who Want Preparation With Direction.</h2>
          <p>
            No generic tips or surface-level advice. Talent IQ grounds your prep in the actual
            responsibilities, metrics, and hiring criteria of the role you're targeting.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((item, index) => (
            <article key={item.title}>
              <div className="feature-top">
                <span className="feature-num">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="workflow" id="workflow">
        <div className="section-title sticky">
          <span className="kicker">3-Step Process</span>
          <h2>Simple Input. Deep Analysis. Actionable Strategy.</h2>
          <p>
            Upload your target job description and resume to instantly get a customized interview
            roadmap with question prompts and severity-rated skill gaps.
          </p>
        </div>
        <div className="step-stack">
          {steps.map((step) => (
            <article key={step.number}>
              <span className="step-tag">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="demo" id="demo">
        <div className="demo-copy">
          <span className="kicker">Strategy Blueprint</span>
          <h2>A Layout That Feels Structured and Actionable.</h2>
          <p>
            Your report separates strategic positioning, technical and behavioral question clusters,
            and 7-day preparation timelines into clear, focused views.
          </p>

          <div className="demo-selectors">
            {Object.keys(demoTabs).map((key) => (
              <button
                key={key}
                type="button"
                className={`demo-selector-btn ${activeTabKey === key ? "active" : ""}`}
                onClick={() => setActiveTabKey(key)}
              >
                {demoTabs[key].title}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-pane">
          <div className="demo-pane-header">
            <h4>{demoTabs[activeTabKey].title}</h4>
            <p>{demoTabs[activeTabKey].subtitle}</p>
          </div>
          <div className="demo-details-list">
            {demoTabs[activeTabKey].details.map((row, i) => (
              <div className="demo-detail-item" key={i}>
                <strong>{row.label}</strong>
                <p>{row.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="quotes">
        <article>
          <div className="quote-stars">★★★★★</div>
          <p>
            "The biggest win was the strategic focus. I knew exactly what narrative to emphasize
            and which technical gaps to address proactively before the interviewers asked."
          </p>
          <div className="quote-author">
            <strong>Senior Frontend Engineer</strong>
            <span>Hired at Series B Fintech</span>
          </div>
        </article>
        <article>
          <div className="quote-stars">★★★★★</div>
          <p>
            "It gives candidates the perspective of a hiring manager. You walk into the room knowing
            how your past experience answers their exact job requirements."
          </p>
          <div className="quote-author">
            <strong>Engineering Director & Mentor</strong>
            <span>Tech Talent Advisor</span>
          </div>
        </article>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="section-title">
          <span className="kicker">Frequently Asked Questions</span>
          <h2>Questions Before You Start.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              onClick={(e) => {
                e.currentTarget
                  .closest(".faq-list")
                  .querySelectorAll("details")
                  .forEach((d) => {
                    if (d !== e.currentTarget) d.removeAttribute("open");
                  });
              }}
            >
              <summary>
                <span>{faq.q}</span>
                <span className="faq-icon">+</span>
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <span className="kicker">Start Today</span>
          <h2>Create Your Next Interview Strategy in Seconds.</h2>
          <p>
            Add your target job description, upload your resume, and generate a clear roadmap that
            turns interviews into job offers.
          </p>
        </div>
        <Link to={appPath} className="btn-primary">
          <span>{user ? "Go to Dashboard" : "Start Preparing Now"}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>

      {/* Minimal Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-badge">TIQ</span>
          <span className="brand-name">Talent IQ</span>
        </div>
        <p>© 2026 Talent IQ. AI-Powered Interview Strategy. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default Landing;
