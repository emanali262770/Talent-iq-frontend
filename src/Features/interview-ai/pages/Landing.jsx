import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import "./Landing.scss";
import { useAuth } from "../../auth/hooks/useAuth";

const featureCards = [
  { title: "Role Intelligence", copy: "Extract hiring signals, expectations, and role priorities from any job description before you start prep." },
  { title: "Resume Fit Mapping", copy: "Map your strongest evidence directly to the role so your interview narrative is clear and relevant." },
  { title: "Theme Prediction", copy: "Surface likely interview themes and question directions based on role requirements and profile context." },
  { title: "Strength Signals", copy: "Identify what to highlight first so your most convincing stories appear early in the conversation." },
  { title: "Gap Visibility", copy: "Spot weak areas and prepare clear responses before they become blockers during interviews." },
  { title: "Saved Reports", copy: "Store generated strategies and revisit them across multiple opportunities without starting from zero." },
];

const steps = [
  { number: "01", title: "Paste the target role", copy: "Share the job description to capture responsibilities, hiring criteria, and contextual expectations." },
  { number: "02", title: "Upload your profile", copy: "Add your resume with optional notes on wins, project outcomes, transitions, and role preferences." },
  { number: "03", title: "Generate strategy", copy: "Receive a focused interview plan with fit score, role narrative, preparation priorities, and risks." },
];

const faqs = [
  { q: "What does Talent IQ generate?", a: "Talent IQ generates a role-specific interview strategy using your job description, resume, and optional profile context." },
  { q: "Does this support non-technical roles?", a: "Yes. The workflow works for technical and non-technical roles because it adapts analysis to the role description." },
  { q: "Can I manage multiple interview reports?", a: "Yes. Generated reports are saved so you can compare and revisit preparation plans for different roles." },
];

/* ─────────────────────────────────────────────────────────────────
   GLOBE VISUAL — Perfect sphere, realistic land, no oval distortion
   KEY FIXES:
   1. Camera aspect ratio set from actual container size, not "1"
   2. Renderer sized to container, not overflowing CSS tricks
   3. Coastlines removed — land is shown via dense dot cloud only
   4. ResizeObserver used for accurate aspect ratio on all sizes
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
    const scene  = new THREE.Scene();
    // Camera aspect will be set by resize() below — never hardcode 1
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    camera.position.set(0, 0, 5.0);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const R = 1.7; // globe radius

    // ── Ocean base sphere ──────────────────────────────────────
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 128, 128),
      new THREE.MeshPhongMaterial({
        color:     new THREE.Color(0x071525),
        emissive:  new THREE.Color(0x010408),
        specular:  new THREE.Color(0x1a4a8a),
        shininess: 90,
      }),
    ));

    // ── Outer atmosphere glow (BackSide fresnel) ───────────────
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.14, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.BackSide,
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
      }),
    ));

    // ── Inner edge tint ────────────────────────────────────────
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.005, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.FrontSide,
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
      }),
    ));

    // ── Utility: lat/lon → cartesian ──────────────────────────
    const toVec = (lat, lon, r = R) => {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta),
      );
    };

    // ── Land detection (rectangle unions) ─────────────────────
    const LAND_RECTS = [
      // North America
      [-130,-52, 25,60], [-140,-60, 60,75], [-118,-86, 15,30], [-92,-77, 7,20],
      // Greenland
      [-56,-18, 60,84],
      // South America
      [-78,-59, -5,12], [-80,-34, -22,-5], [-74,-48, -40,-22], [-72,-62, -55,-40],
      // Europe (broad)
      [-10,32, 36,72], [-10,30, 60,72],
      // Iceland
      [-24,-13, 63,67],
      // Africa
      [-6,38, 30,37], [-18,42, 0,30], [12,40, -20,0], [16,33, -35,-20],
      // Madagascar
      [43,51, -26,-12],
      // Middle East
      [34,62, 14,42],
      // Asia main
      [30,140, 40,78], [62,130, 22,40], [72,110, 8,22], [95,142, -8,8],
      // Japan
      [128,146, 30,46],
      // SE Asia / Philippines
      [116,128, 5,20],
      // Indonesia
      [95,136, -8,6],
      // Australia
      [114,154, -38,-20], [124,142, -20,-10],
      // New Zealand
      [166,178, -46,-34],
      // Russia Far East + Siberia
      [100,180, 50,78], [-180,-165, 50,78],
      // Alaska
      [-170,-130, 54,72],
    ];

    const isLand = (lat, lon) => {
      for (const [lonMin, lonMax, latMin, latMax] of LAND_RECTS) {
        if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) return true;
      }
      return false;
    };

    // ── Sun direction (determines day/night split) ────────────
    const sunDir = new THREE.Vector3(1.2, 0.4, 0.8).normalize();

    // ── Land + ocean dot cloud ────────────────────────────────
    const pos = [], col = [];

    // Land dots — dense, colour-coded by biome
    for (let i = 0; i < 60000; i++) {
      // Uniform sphere sampling (no polar clumping)
      const u   = Math.random();
      const v   = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = v * 360 - 180;
      if (!isLand(lat, lon)) continue;

      const pt  = toVec(lat, lon, R + 0.007);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      pos.push(pt.x, pt.y, pt.z);

      if (Math.random() < 0.012) {
        col.push(0.86, 0.73, 0.36); // gold city highlights
      } else if (sun > 0.08) {
        const r = Math.random();
        if      (r < 0.28) col.push(0.14, 0.34, 0.18);   // dense forest
        else if (r < 0.52) col.push(0.26, 0.44, 0.24);   // light forest
        else if (r < 0.68) col.push(0.48, 0.52, 0.30);   // savanna
        else if (r < 0.80) col.push(0.50, 0.40, 0.26);   // earth/brown
        else if (r < 0.91) col.push(0.64, 0.56, 0.38);   // desert/sandy
        else               col.push(0.85, 0.84, 0.82);   // snow/ice
      } else {
        col.push(0.06, 0.10, 0.18); // night side land
      }
    }

    // Ocean glints on sunlit hemisphere
    for (let i = 0; i < 6000; i++) {
      const u   = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = Math.random() * 360 - 180;
      if (isLand(lat, lon)) continue;
      const pt  = toVec(lat, lon, R + 0.003);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      if (sun < 0.55 || Math.random() > sun * 0.10) continue;
      pos.push(pt.x, pt.y, pt.z);
      col.push(0.28 + sun*0.28, 0.48 + sun*0.18, 0.82 + sun*0.12);
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(col), 3));
    const dotMat = new THREE.PointsMaterial({
      vertexColors: true, size: 0.008,
      transparent: true, opacity: 0.92, depthWrite: false, sizeAttenuation: true,
    });
    earthGroup.add(new THREE.Points(dotGeo, dotMat));

    // ── Night city lights ─────────────────────────────────────
    const nPos = [], nCol = [];
    for (let i = 0; i < 80000; i++) {
      const u   = Math.random();
      const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
      const lon = Math.random() * 360 - 180;
      if (!isLand(lat, lon)) continue;
      const pt  = toVec(lat, lon, R + 0.010);
      const sun = Math.max(0, pt.clone().normalize().dot(sunDir));
      if (sun > 0.12 || Math.random() > 0.06) continue;
      nPos.push(pt.x + (Math.random()-0.5)*0.006, pt.y + (Math.random()-0.5)*0.006, pt.z + (Math.random()-0.5)*0.006);
      const r2 = Math.random();
      if      (r2 < 0.5) nCol.push(0.96, 0.90, 0.62);
      else if (r2 < 0.8) nCol.push(0.82, 0.92, 1.00);
      else               nCol.push(1.00, 0.68, 0.28);
    }
    if (nPos.length > 0) {
      const nGeo = new THREE.BufferGeometry();
      nGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nPos), 3));
      nGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(nCol), 3));
      earthGroup.add(new THREE.Points(nGeo, new THREE.PointsMaterial({
        vertexColors: true, size: 0.012, transparent: true, opacity: 0.88, depthWrite: false, sizeAttenuation: true,
      })));
    }

    // ── Subtle lat/lon grid ────────────────────────────────────
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a3660, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = []; for (let lon=-180; lon<=181; lon+=4) pts.push(toVec(lat, lon, R+0.003));
      earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lon=-180; lon<180; lon+=30) {
      const pts = []; for (let lat=-88; lat<=88; lat+=4) pts.push(toVec(lat, lon, R+0.003));
      earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // ── Cloud layer ────────────────────────────────────────────
    const cloudGroup = new THREE.Group();
    earthGroup.add(cloudGroup);
    const cPos = [], cCol = [];
    const CLOUD_BANDS = [
      { latMin:-9, latMax:9,   density:0.10 },
      { latMin:42, latMax:62,  density:0.07 },
      { latMin:-60,latMax:-44, density:0.06 },
      { latMin:68, latMax:90,  density:0.12 },
      { latMin:-90,latMax:-68, density:0.14 },
    ];
    for (let i = 0; i < 10000; i++) {
      const u   = Math.random();
      const lat = Math.asin(2*u-1) * (180/Math.PI);
      const lon = Math.random()*360-180;
      let inCloud = false;
      for (const b of CLOUD_BANDS) {
        if (lat >= b.latMin && lat <= b.latMax && Math.random() < b.density) { inCloud=true; break; }
      }
      if (!inCloud) continue;
      const pt = toVec(lat, lon, R + 0.022 + Math.random()*0.018);
      cPos.push(pt.x, pt.y, pt.z);
      const b2 = 0.80 + Math.random()*0.18;
      cCol.push(b2, b2, b2);
    }
    if (cPos.length > 0) {
      const cGeo = new THREE.BufferGeometry();
      cGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cPos), 3));
      cGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(cCol), 3));
      cloudGroup.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
        vertexColors: true, size: 0.010, transparent: true, opacity: 0.28, depthWrite: false, sizeAttenuation: true,
      })));
    }

    // ── Cities + pulsing rings ─────────────────────────────────
    const CITIES = [
      { lat:40.7,  lon:-74.0  }, { lat:51.5, lon:-0.1   }, { lat:35.6, lon:139.7  },
      { lat:22.3,  lon:114.2  }, { lat:37.6, lon:-122.4 }, { lat:19.0, lon:72.8   },
      { lat:-33.9, lon:151.2  }, { lat:1.3,  lon:103.8  }, { lat:30.0, lon:31.2   },
      { lat:48.8,  lon:2.3    }, { lat:55.7, lon:37.6   }, { lat:31.2, lon:121.5  },
    ];
    const dotBaseMat = new THREE.MeshBasicMaterial({ color:0xd4a853, transparent:true, opacity:0.95 });
    const ringMats = [];
    CITIES.forEach(c => {
      const p = toVec(c.lat, c.lon, R+0.018);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016,12,12), dotBaseMat);
      dot.position.copy(p);
      earthGroup.add(dot);
      const rMat = new THREE.MeshBasicMaterial({ color:0xd4a853, transparent:true, opacity:0.5, side:THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.020,0.036,24), rMat);
      ring.position.copy(p);
      ring.lookAt(p.clone().multiplyScalar(2));
      earthGroup.add(ring);
      ringMats.push({ ring, rMat, phase: Math.random()*Math.PI*2 });
    });

    // ── Connection arcs ────────────────────────────────────────
    const ARC_PAIRS = [[0,1],[1,2],[4,5],[5,7],[2,6],[8,1],[9,11],[3,7],[0,10]];
    const arcMats = [];
    ARC_PAIRS.forEach(([a,b], idx) => {
      const s = toVec(CITIES[a].lat, CITIES[a].lon, R+0.020);
      const e = toVec(CITIES[b].lat, CITIES[b].lon, R+0.020);
      const m = s.clone().add(e).multiplyScalar(0.5).normalize().multiplyScalar(R*1.48 + Math.random()*0.3);
      const curve = new THREE.QuadraticBezierCurve3(s, m, e);
      const aMat = new THREE.LineBasicMaterial({
        color: idx%2===0 ? 0xd4a853 : 0x4a9eff,
        transparent:true, opacity:0.20, depthWrite:false, blending:THREE.AdditiveBlending,
      });
      earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), aMat));
      arcMats.push({ aMat, phase: Math.random()*Math.PI*2 });
    });

    // ── Starfield ──────────────────────────────────────────────
    const sPos = [];
    for (let i=0; i<2000; i++) {
      const r   = 35+Math.random()*25;
      const phi = Math.acos(2*Math.random()-1);
      const th  = Math.random()*Math.PI*2;
      sPos.push(r*Math.sin(phi)*Math.cos(th), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(th));
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sPos), 3));
    const stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ color:0xf0ece6, size:0.048, transparent:true, opacity:0.40, sizeAttenuation:true }));
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
    let mx=0, my=0, tx=0, ty=0;
    const onMove = e => {
      const rect = mount.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width  - 0.5;
      my = (e.clientY - rect.top)  / rect.height - 0.5;
    };

    // ── CRITICAL: Resize using actual container dimensions ─────
    // This is what prevents the oval/squish effect.
    // We read the mount element's real pixel size and set both
    // the renderer AND camera.aspect from those values.
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false); // false = don't set CSS style
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // ResizeObserver catches container size changes more reliably than window resize
    const ro = new ResizeObserver(() => resize());
    ro.observe(mount);

    // ── Animation ─────────────────────────────────────────────
    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      tx += (mx*0.5 - tx) * 0.04;
      ty += (-my*0.3 - ty) * 0.04;

      earthGroup.rotation.y  = t*0.042 + tx*0.38;
      earthGroup.rotation.x  = ty*0.22;
      cloudGroup.rotation.y  = t*0.010;
      stars.rotation.y       = t*0.004;

      ringMats.forEach(({ ring, rMat, phase }) => {
        const pulse = Math.sin(t*1.3+phase)*0.5+0.5;
        ring.scale.setScalar(1 + pulse*1.4);
        rMat.opacity = 0.5*(1 - pulse*0.86);
      });
      arcMats.forEach(({ aMat, phase }, i) => {
        aMat.opacity = 0.10 + Math.sin(t*0.65+phase+i*0.7)*0.09 + 0.08;
      });

      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize, { passive:true });
    mount.addEventListener("pointermove", onMove, { passive:true });

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      dotGeo.dispose(); dotMat.dispose();
      sGeo.dispose();
    };
  }, []);

  return <div className="globe-mount" ref={mountRef} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────────────── */
const Landing = () => {
  const { user } = useAuth();
  const appPath  = user ? "/dashboard" : "/register";

  useEffect(() => {
    const updateScroll = () => {
      document.documentElement.style.setProperty("--landing-progress", String(window.scrollY));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive:true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      document.documentElement.style.removeProperty("--landing-progress");
    };
  }, []);

  return (
    <main className="tiq-landing">
      {/* Nav */}
      <nav className="tiq-nav">
        <Link to="/" className="brand"><span>TIQ</span>Talent IQ</Link>
        <div className="center-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="action-links">
          <Link to="/login">Login</Link>
          <Link className="primary-link" to={appPath}>{user ? "Dashboard" : "Get started"}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <span className="kicker">AI-powered interview preparation</span>
          <h1>Turn every job application into a focused interview strategy.</h1>
          <p>Talent IQ analyzes your target role and resume, then builds a clear preparation roadmap around your strongest proof points, likely interview themes, and high-risk gaps.</p>
          <div className="hero-ctas">
            <Link to={appPath} className="btn-primary">Create strategy</Link>
            <a href="#workflow" className="btn-secondary">See workflow</a>
          </div>
          <div className="metrics">
            <article><strong>86%</strong><span>Role fit score</span></article>
            <article><strong>24</strong><span>Signals found</span></article>
            <article><strong>6 areas</strong><span>Prep focus</span></article>
          </div>
        </div>

        {/* Globe lives in a square-ish container with explicit dimensions */}
        <div className="hero-visual">
          <GlobeVisual />
        </div>
      </section>

      {/* Tag strip */}
      <section className="tag-strip">
        {["Resume","Role Fit","AI Plan","Reports","Questions","Strategy"].map(item=>(
          <span key={item}>{item}</span>
        ))}
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-title">
          <span className="kicker">Product value</span>
          <h2>Built for candidates who want preparation with direction.</h2>
          <p>Talent IQ keeps your preparation grounded in the actual role, not generic tips. You get a strategy that reflects job expectations and your own candidate profile.</p>
        </div>
        <div className="feature-grid">
          {featureCards.map((item,index)=>(
            <article key={item.title}>
              <span>{String(index+1).padStart(2,"0")}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="workflow" id="workflow">
        <div className="section-title sticky">
          <span className="kicker">Workflow</span>
          <h2>Simple input. Deep analysis. Clear output.</h2>
          <p>The flow stays clean: role input, profile upload, strategy generation, and report history for future opportunities.</p>
        </div>
        <div className="step-stack">
          {steps.map(step=>(
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section className="demo">
        <div className="demo-copy">
          <span className="kicker">Product demo</span>
          <h2>A report layout that feels structured and actionable.</h2>
          <p>Your final report separates strategic summary, likely theme directions, talking points, and gap handling so preparation is focused and practical.</p>
        </div>
        <div className="demo-pane">
          <div className="row active"><strong>Strategic summary</strong><p>Role-fit positioning and interview direction.</p></div>
          <div className="row"><strong>Likely interview themes</strong><p>Question clusters based on role requirements and profile gaps.</p></div>
          <div className="row"><strong>Talking points</strong><p>Prepared stories tied to impact, ownership, and outcomes.</p></div>
        </div>
      </section>

      {/* Quotes */}
      <section className="quotes">
        <article>
          <p>"The biggest win was focus. I knew exactly what to prepare and what to emphasize in the interview."</p>
          <strong>Frontend candidate</strong>
        </article>
        <article>
          <p>"It helps candidates frame their profile around role expectations, not just resume bullet points."</p>
          <strong>Recruitment mentor</strong>
        </article>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="section-title">
          <span className="kicker">FAQ</span>
          <h2>Questions before you start.</h2>
        </div>
        <div className="faq-list">
          {faqs.map(faq=>(
            <details key={faq.q} onClick={e=>{
              e.currentTarget.closest(".faq-list").querySelectorAll("details").forEach(d=>{
                if(d!==e.currentTarget) d.removeAttribute("open");
              });
            }}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div>
          <span className="kicker">Start preparing</span>
          <h2>Create your first interview strategy today.</h2>
          <p>Add the job description, upload your resume, and generate a focused plan for your next interview.</p>
        </div>
        <Link to={appPath} className="btn-primary">Start now</Link>
      </section>
    </main>
  );
};

export default Landing;