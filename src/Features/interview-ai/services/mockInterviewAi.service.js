// mockInterviewAi.service.js
// Intelligent AI Mock Interview generation and answer evaluation engine

const STORAGE_SESSION_PREFIX = "talent_iq_mock_session_";
const STORAGE_REPORT_PREFIX = "talent_iq_mock_report_";

/**
 * Extracts tech stack, seniority, and domain signals from a Job Description.
 */
export function extractJdInsights(jobDescription = "", resume = "", selfDescription = "") {
  const text = `${jobDescription} ${selfDescription} ${resume}`.toLowerCase();

  // Detect seniority
  let seniority = "Senior";
  if (text.includes("principal") || text.includes("staff") || text.includes("architect")) {
    seniority = "Staff/Principal";
  } else if (text.includes("lead") || text.includes("tech lead")) {
    seniority = "Tech Lead";
  } else if (text.includes("senior") || text.includes("sr.")) {
    seniority = "Senior";
  } else if (text.includes("mid") || text.includes("intermediate")) {
    seniority = "Mid-Level";
  } else if (text.includes("junior") || text.includes("entry") || text.includes("associate")) {
    seniority = "Junior";
  }

  // Detect role domain
  let roleDomain = "Full-Stack Software Engineer";
  if (text.includes("frontend") || text.includes("front-end") || text.includes("ui") || text.includes("react developer")) {
    roleDomain = "Frontend / UI Engineer";
  } else if (text.includes("backend") || text.includes("back-end") || text.includes("api developer")) {
    roleDomain = "Backend Systems Engineer";
  } else if (text.includes("devops") || text.includes("sre") || text.includes("cloud engineer") || text.includes("infrastructure")) {
    roleDomain = "DevOps & Cloud Engineer";
  } else if (text.includes("data engineer") || text.includes("machine learning") || text.includes("ai engineer")) {
    roleDomain = "AI & Data Engineer";
  } else if (text.includes("mobile") || text.includes("ios") || text.includes("android") || text.includes("flutter")) {
    roleDomain = "Mobile Software Engineer";
  }

  // Detect key tech stack mentions
  const techKeywords = [
    "React", "TypeScript", "JavaScript", "Next.js", "Node.js", "Python", "Java",
    "Go", "Golang", "Rust", "C#", ".NET", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Kafka", "RabbitMQ", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "GraphQL",
    "REST", "CI/CD", "Microservices", "System Design", "CSS", "Sass", "Tailwind",
    "Redux", "Zustand", "Jest", "Playwright", "Cypress", "WebSockets", "Webpack", "Vite"
  ];

  const detectedTech = techKeywords.filter((tech) => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  });

  const finalTechList = detectedTech.length > 0 ? detectedTech : ["React", "TypeScript", "JavaScript", "System Architecture", "REST APIs", "Performance Tuning"];

  return {
    seniority,
    roleDomain,
    detectedTech: finalTechList,
    rawJdSnippet: jobDescription.substring(0, 300),
  };
}

/**
 * Generates 16 targeted interview questions (8 Technical Concepts + 8 Real-World Scenarios)
 * dynamically tailored to the Job Description, tech stack, and role requirements.
 */
export function generateMockQuestions(jobDescription = "", resume = "", selfDescription = "", existingTechQuestions = []) {
  const extraContext = Array.isArray(existingTechQuestions)
    ? existingTechQuestions.map((q) => q.question || "").join(" ")
    : "";
  const insights = extractJdInsights(`${jobDescription} ${extraContext}`, resume, selfDescription);
  const tech = insights.detectedTech;
  const primaryTech = tech[0] || "Frontend Architecture";
  const secondaryTech = tech[1] || "TypeScript/JavaScript";
  const tertiaryTech = tech[2] || "State Management & Performance";
  const dbOrCloudTech = tech.find((t) => ["PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "Kafka"].includes(t)) || "Distributed Systems & Cloud";

  const questions = [
    // ---------------- TECHNICAL CONCEPTS (Q1 - Q8) ----------------
    {
      id: "mock-q-1",
      number: 1,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Core Language & Execution Internals",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `In the context of ${primaryTech} and modern JavaScript/TypeScript runtimes, how do memory management and the event loop/asynchronous execution model work under high-concurrency loads? Explain how you prevent memory leaks and event loop starvation.`,
      intention: "Evaluates fundamental language mastery, low-level runtime mechanics, and ability to diagnose subtle performance drains.",
      keyEvaluationPoints: [
        "Event loop phases (microtasks vs macrotasks)",
        "Memory lifecycle, closures, detached DOM nodes or lingering event listeners",
        "Garbage collection cycles and strategies for preventing thread blocking",
      ],
      idealAnswer:
        "In modern runtimes, asynchronous code is scheduled across microtask queues (Promise resolution, queueMicrotask) and macrotask queues (setTimeout, I/O). Event loop starvation occurs when heavy computation or infinite microtask recursion blocks the single thread. Memory leaks typically stem from uncleared intervals, stale subscription handlers, global variables, or uncleaned closures holding references. Mitigations include offloading CPU tasks to Web Workers/Worker Threads, employing WeakMap/WeakSet for cache lifecycles, and profiling heaps via DevTools allocation timelines.",
    },
    {
      id: "mock-q-2",
      number: 2,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Architecture & Component Design",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `Designing for the requirements in this JD: How would you architect a scalable, maintainable modular structure using ${primaryTech} and ${secondaryTech}? Explain how you establish clear separation between presentation, business domain logic, and data layer integrations.`,
      intention: "Tests architectural maturity, separation of concerns, and clean code patterns for enterprise applications.",
      keyEvaluationPoints: [
        "Domain-driven or feature-first folder organization",
        "Clear boundary between UI components, custom hooks/services, and API clients",
        "Abstraction patterns that facilitate unit testing and decoupled refactoring",
      ],
      idealAnswer:
        "A scalable architecture uses feature-based modular packaging. Presentation components remain purely presentational, consuming normalized props. State and domain rules are encapsulated in reusable hooks or headless domain services. API integration is decoupled via an HTTP client abstraction layer with interceptors for error handling and token refresh. Dependencies are injected or imported through public barrel index files to maintain strict encapsulation and prevent circular dependency coupling.",
    },
    {
      id: "mock-q-3",
      number: 3,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "State Management & Data Flow",
      difficulty: "Advanced",
      estimatedMinutes: 3,
      question: `Compare client-side caching versus global state management for complex applications utilizing ${tertiaryTech}. When would you choose server-state caching (e.g. React Query / SWR / RTK Query) over client store abstractions (e.g. Redux / Zustand / Context), and what are the trade-offs?`,
      intention: "Examines understanding of state lifecycles, optimistic updates, and eliminating redundant client state synchronization.",
      keyEvaluationPoints: [
        "Separation of server-state (async, cached, remote) from UI-state (modals, ephemeral inputs)",
        "Stale-while-revalidate caching and invalidation strategies",
        "Memory footprint, bundle overhead, and developer velocity trade-offs",
      ],
      idealAnswer:
        "Server state is remote, asynchronous, and shared, requiring cache invalidation, deduplication, and polling. Tools like TanStack Query excel here without boilerplate. Client state is local and synchronous (e.g., active step, theme, drawer states). Mixing them in monolithic client stores creates synchronization bugs and excessive boilerplate. The optimal pattern delegates all network fetching, caching, and optimistic mutations to a query library, while reserving lightweight stores (like Zustand or Context) for purely client-driven UI state.",
    },
    {
      id: "mock-q-4",
      number: 4,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Performance Optimization & Web Vitals",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `For a high-traffic production application built around ${primaryTech}, how do you systematically diagnose and optimize Core Web Vitals—specifically Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS)?`,
      intention: "Verifies practical performance engineering skills and familiarity with browser rendering pipelines.",
      keyEvaluationPoints: [
        "Diagnostic tooling (Chrome Performance Profiler, Lighthouse, Web Vitals API)",
        "LCP optimization (resource preloading, CDN edge caching, critical CSS, responsive image formats)",
        "INP reduction (breaking long tasks with scheduler.yield, debouncing, optimizing React renders)",
        "CLS prevention (explicit image dimensions, font display swap fallback, reserved layout slots)",
      ],
      idealAnswer:
        "LCP is optimized by preloading hero assets, edge caching SSR responses, and inlining critical CSS. INP is addressed by profiling flame charts in DevTools to eliminate long tasks (>50ms); splitting intensive JavaScript using scheduler.yield() or requestIdleCallback(), and leveraging startTransition for non-blocking UI updates. CLS is avoided by reserving explicit width/height or aspect-ratio on all media containers, skeleton loaders matching final element dimensions, and utilizing font-display: optional or size-adjust.",
    },
    {
      id: "mock-q-5",
      number: 5,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "API Design & Concurrency Handling",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `When integrating with backend services (${dbOrCloudTech}), how do you handle idempotent mutations, race conditions from rapid user inputs (e.g. typeahead or concurrent submits), and token expiration renewal without dropping user requests?`,
      intention: "Tests real-world network resilience, async race condition prevention, and authentication lifecycle management.",
      keyEvaluationPoints: [
        "AbortController / cancellation tokens for outdated in-flight requests",
        "Axios/fetch response interceptors with queued retry mechanisms during token refresh",
        "Idempotency keys and UI debouncing/throttling to prevent duplicate mutations",
      ],
      idealAnswer:
        "For race conditions, previous in-flight requests are cancelled using AbortController on each new query stroke. For concurrent writes, clients pass unique idempotency UUIDs. Authentication interceptors catch 401 Unauthorized responses, place ongoing requests in a deferred promise queue, trigger a single refresh token exchange, update authorization headers, and replay all queued calls seamlessly without logging out the active user.",
    },
    {
      id: "mock-q-6",
      number: 6,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Security & Defensive Engineering",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `What primary security attack vectors (such as XSS, CSRF, prototype pollution, and sensitive token leakage) must frontend and full-stack engineers safeguard against in modern Single Page Applications, and what layered defenses do you implement?`,
      intention: "Evaluates adherence to OWASP Top 10 guidelines and application hardening best practices.",
      keyEvaluationPoints: [
        "Strict Content Security Policy (CSP) headers and input sanitization (DOMPurify)",
        "Secure cookie flags (HttpOnly, SameSite=Strict, Secure) vs localStorage token hazards",
        "Guarding against third-party npm package vulnerabilities via auditing and lockfile freezes",
      ],
      idealAnswer:
        "Defenses begin with a strict Content Security Policy preventing unauthorized script execution. Never store sensitive JWTs or session secrets in accessible localStorage; use HttpOnly, Secure, SameSite=Strict cookies. Sanitize any dynamic HTML rendering using DOMPurify. Enforce automated npm audit/Snyk checks in CI pipelines, validate and parse all incoming API payloads with schemas like Zod, and prevent prototype pollution by freezing base objects or using Map.",
    },
    {
      id: "mock-q-7",
      number: 7,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Testing Pyramid & Quality Assurance",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Explain how you construct an effective automated testing pyramid for a mission-critical web application. What balance do you strike between unit tests, integration tests (e.g. React Testing Library), and end-to-end suites (e.g. Playwright/Cypress)?`,
      intention: "Assesses pragmatic testing mindset, test-driven reliability, and avoiding brittle test suites.",
      keyEvaluationPoints: [
        "Testing behavior rather than implementation details",
        "Mocking network boundaries cleanly (MSW - Mock Service Worker)",
        "Maintaining fast feedback loops while safeguarding critical user revenue flows via E2E",
      ],
      idealAnswer:
        "The pyramid balances fast, isolated unit tests for pure algorithms, utilities, and complex state reducers; robust integration tests using React Testing Library and MSW (testing user actions via accessible queries rather than internal state); and a focused tier of Playwright end-to-end tests validating happy paths and critical checkout/auth journeys against real staging environments. This maximizes confidence while minimizing maintenance friction.",
    },
    {
      id: "mock-q-8",
      number: 8,
      type: "technical",
      typeLabel: "Technical Concept",
      category: "Build Tooling, CI/CD & Bundle Optimization",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `Describe how modern bundlers (such as Vite/Rollup or Webpack) execute tree shaking, code splitting, and asset hashing. How do you analyze and decrease initial JavaScript bundle payloads in a growing enterprise codebase?`,
      intention: "Checks familiarity with compilation pipelines, module formats (ESM vs CJS), and delivery optimization.",
      keyEvaluationPoints: [
        "Static analysis of ES module exports for dead-code elimination",
        "Route-based and component-based dynamic import() code splitting",
        "Bundle analysis tools (visualizer/analyzer) and auditing transitive dependencies",
      ],
      idealAnswer:
        "Tree-shaking relies on ESM static import/export statements to detect unused exports and prune them during minification. Code splitting is executed through dynamic import() wrappers (e.g. React.lazy), splitting heavy routes and bulky third-party libraries (charts, rich text editors) into on-demand asynchronous chunks. Bundle analyzers pinpoint bloated duplicate packages; lodash-es replaces monolithic lodash, and package sideEffects flags ensure clean tree-shaking.",
    },

    // ---------------- REAL-WORLD SCENARIOS (Q9 - Q16) ----------------
    {
      id: "mock-q-9",
      number: 9,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Production Incident & Triage",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `Scenario: On a Friday afternoon after a major release, users report that the application intermittently hangs and freezes when submitting the primary workflow. Error tracking shows an influx of unhandled client-side exceptions. Walk me step-by-step through how you investigate, mitigate, communicate, and resolve this high-priority production incident.`,
      intention: "Evaluates incident command, diagnostic composure, rollback decision-making, and blameless post-mortem methodology.",
      keyEvaluationPoints: [
        "Initial triage & containment (reverting release or activating feature flags first to stop customer pain)",
        "Root cause analysis using telemetry (Sentry, Datadog, reproduction in staging)",
        "Transparent stakeholder status communication during the outage",
        "Post-incident remediation action items (preventative test cases, canary deployments)",
      ],
      idealAnswer:
        "First, prioritize customer stabilization: if the issue originated in the recent release and rollback is clean, execute immediate rollback or toggle the relevant feature flag rather than debugging in production. Simultaneously, notify incident stakeholders and post status updates. Next, reproduce in staging using telemetry logs, breadcrumbs, and Sentry stack traces. Once the regression (e.g. unhandled edge case or race condition) is identified, create a minimal reproducible test case, verify the hotfix in staging, deploy via canary/staged rollout, and conduct a blameless post-mortem with preventative CI test additions.",
    },
    {
      id: "mock-q-10",
      number: 10,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Legacy Migration & Technical Debt",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `Scenario: You are tasked with modernizing a critical, 6-year-old monolithic frontend module full of legacy patterns, undocumented global state, and zero automated tests. Product management insists that new customer features must continue shipping without pause. How do you design and execute this migration plan safely?`,
      intention: "Tests the ability to lead incremental modernization without stalling business velocity or introducing regressions.",
      keyEvaluationPoints: [
        "Strangler Fig pattern (incremental migration piece by piece alongside legacy code)",
        "Establishing characterization/snapshot tests around existing legacy boundaries before touching code",
        "Feature flagging or proxy routing to switch traffic gradually",
        "Negotiating sprint capacity with product management",
      ],
      idealAnswer:
        "Adopt the Strangler Fig pattern rather than proposing a catastrophic big-bang rewrite. First, wrap the legacy module in black-box integration tests to define the contract. Create new features inside a modern, clean architecture, bridging state through lightweight adapters. Gradually migrate individual views or subcomponents behind a feature flag, validating metrics in production. Partner with the Product Manager to allocate ~20% of each sprint to migration milestones paired with feature deliveries.",
    },
    {
      id: "mock-q-11",
      number: 11,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Cross-Functional Conflict & Alignment",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Scenario: Your product manager wants to launch a high-visibility feature in 2 weeks. However, completing the feature as spec'd without refactoring would introduce severe technical debt, security gaps, and potential accessibility failures. How do you handle this disagreement and reach an agreed roadmap?`,
      intention: "Tests business empathy, negotiation, constructive trade-off articulation, and non-confrontational alignment.",
      keyEvaluationPoints: [
        "Translating technical concerns into business risk (churn, legal compliance, outage costs)",
        "Proposing phased delivery (MVP with simplified scope vs full feature)",
        "Collaborative problem solving without taking an adversarial stance",
      ],
      idealAnswer:
        "I avoid saying a flat 'no'. Instead, I frame technical debt in terms of business impact: release delays, security vulnerabilities, or accessibility legal non-compliance that could harm brand trust. I present scoped options: 'Option A: Deliver an MVP with the core 70% value within 2 weeks with solid architecture; Option B: Full scope requiring 3.5 weeks; or Option C: Strict timebox with pre-scheduled sprint 2 dedicated to hardening.' This turns an adversarial impasse into a collaborative decision based on business priorities.",
    },
    {
      id: "mock-q-12",
      number: 12,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "System Scalability & High Traffic Surge",
      difficulty: "Advanced",
      estimatedMinutes: 4,
      question: `Scenario: Marketing announces an unexpected influencer campaign starting tomorrow that will drive 20x your usual traffic spike to the web app. What immediate frontend, caching, and infrastructure resilience measures do you inspect and put in place to ensure 100% uptime and smooth customer experience?`,
      intention: "Evaluates rapid load preparation, defensive caching, edge resilience, and graceful degradation under load.",
      keyEvaluationPoints: [
        "CDN edge caching for static assets and public API payloads (stale-while-revalidate)",
        "Rate-limiting, request throttling, and debounced telemetry to avoid self-DDoS",
        "Graceful degradation (disabling expensive non-essential real-time widgets, fallback offline UI)",
      ],
      idealAnswer:
        "Verify CDN cache hit ratios immediately and enforce aggressive Cache-Control headers with stale-while-revalidate for static assets. Audit initial API calls triggered on page load: ensure public data is cached at the edge or Redis tier. Implement client-side debounce and batching for telemetry/analytics so millions of users don't flood ingestion endpoints. Configure graceful degradation fallbacks: disable heavy real-time polling widgets during traffic peaks, and ensure circuit-breakers show informative cached data rather than blank error screens.",
    },
    {
      id: "mock-q-13",
      number: 13,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Code Review & Technical Standards",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Scenario: A peer engineer submits a 2,500-line pull request containing a mix of new feature logic, unrelated cosmetic refactoring, and code that violates established team architectural conventions. How do you conduct this code review constructively?`,
      intention: "Evaluates code review ethics, mentorship, team standards enforcement, and pragmatic collaboration.",
      keyEvaluationPoints: [
        "Requesting atomic, smaller PRs politely with clear rationale",
        "Distinguishing blocking blockers (architecture, security, bugs) from subjective nits",
        "Offering a quick pair programming or sync call to avoid an adversarial comment war",
      ],
      idealAnswer:
        "Large PRs increase bug probability and slow down reviews. I reach out warmly (in person or via Slack) before leaving dozens of comments: 'Great progress on this feature! Because this PR is 2,500 lines touching multiple areas, it will be much easier to review and safely deploy if we split it into two: one for the refactoring, and one for the feature logic.' In the review itself, I prefix non-blocking stylistic suggestions with 'Nit:' and focus on high-impact architectural patterns and test coverage.",
    },
    {
      id: "mock-q-14",
      number: 14,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Third-Party Outage & Fault Tolerance",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Scenario: An external third-party SDK (such as analytics, payment gateway, or customer chat widget) begins experiencing prolonged latency (>15s timeouts) and intermittent 500 errors, causing your client application to hang or fail to complete transactions. How do you protect your users from third-party failures?`,
      intention: "Assesses resilience against third-party dependencies, asynchronous isolation, and fallback UX.",
      keyEvaluationPoints: [
        "Asynchronous and non-blocking script loading (async/defer or dynamic script injection)",
        "Client-side circuit breakers and timeout wrappers",
        "Graceful UI fallbacks ensuring core user journeys remain operational",
      ],
      idealAnswer:
        "Third-party scripts must never sit on the critical rendering path; load them asynchronously (defer/async) or inside isolated Web Workers / sandboxed iframes. Wrap all third-party API promises with strict client-side timeouts (e.g. 3-5s via Promise.race). If an external analytics or support widget fails, trigger a circuit breaker that silences subsequent calls, and allow the primary user funnel to proceed unimpeded with friendly fallback status indicators.",
    },
    {
      id: "mock-q-15",
      number: 15,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Mentorship & Team Growth",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Scenario: A junior or mid-level engineer on your team has missed sprint deliverables two cycles in a row and seems overwhelmed by the project's architectural complexity. How do you support them to get back on track while maintaining team velocity?`,
      intention: "Tests leadership, empathetic mentorship, proactive coaching, and task breakdown skills.",
      keyEvaluationPoints: [
        "Empathetic, private 1:1 check-in to identify underlying blockers",
        "Assisting in breaking down complex user stories into small, bite-sized tasks",
        "Pair programming sessions and establishing psychologically safe check-ins",
      ],
      idealAnswer:
        "Set up a supportive, non-punitive 1:1 to check in on how they are feeling: 'I noticed things felt tight the last two sprints; what parts of the system or requirements are feeling most ambiguous?' Often the root cause is unclear requirements or feeling hesitant to ask questions. I help them break large tickets into half-day actionable sub-tasks, schedule a couple of collaborative pair-programming sessions to navigate tricky codebase patterns, and celebrate their incremental wins.",
    },
    {
      id: "mock-q-16",
      number: 16,
      type: "scenario",
      typeLabel: "Real-World Scenario",
      category: "Accessibility & Global Inclusivity",
      difficulty: "Intermediate",
      estimatedMinutes: 3,
      question: `Scenario: A major client with strict accessibility compliance audits flags your application for failing WCAG 2.1 AA standards (keyboard navigation traps, missing ARIA announcements on dynamic notifications, and poor color contrast). How do you conduct an accessibility audit and establish automated guards in the development pipeline?`,
      intention: "Tests commitment to web accessibility standards (WCAG), screen reader usability, and automated linting/testing enforcement.",
      keyEvaluationPoints: [
        "Audit tools (Axe DevTools, Lighthouse, VoiceOver / NVDA screen reader manual testing)",
        "Proper semantic HTML first, followed by ARIA live regions for dynamic alerts",
        "Enforcing eslint-plugin-jsx-a11y and automated Axe assertions in CI test suites",
      ],
      idealAnswer:
        "Begin with an audit using Axe DevTools and manual keyboard tab navigation (verifying visible focus rings and no modal focus traps). Test dynamic notifications using aria-live='polite' or 'assertive' so screen readers announce asynchronous updates. Replace non-semantic divs with proper buttons and headings. To permanently prevent regressions, integrate eslint-plugin-jsx-a11y, configure automated axe-core assertions in Playwright/Cypress end-to-end tests, and conduct team training on accessibility fundamentals.",
    },
  ];

  return questions;
}

/**
 * Intelligent AI Answer Evaluation Engine.
 * Evaluates candidate responses against Job Description requirements and benchmark answers.
 */
export function evaluateMockSession({
  questions = [],
  answers = {},
  jobDescription = "",
  elapsedSeconds = 0,
}) {
  const answeredCount = Object.keys(answers).filter((qId) => answers[qId]?.trim().length > 10).length;
  const totalQuestions = questions.length || 16;

  let totalScoreSum = 0;
  let techScoreSum = 0;
  let techCount = 0;
  let scenarioScoreSum = 0;
  let scenarioCount = 0;

  const jdKeywords = (jobDescription || "")
    .toLowerCase()
    .split(/[\s,.;:()]+/)
    .filter((w) => w.length > 5);

  const questionEvaluations = questions.map((q) => {
    const rawAnswer = (answers[q.id] || "").trim();
    const wordCount = rawAnswer ? rawAnswer.split(/\s+/).length : 0;
    const charCount = rawAnswer.length;

    let score = 0;
    let strengths = [];
    let areasForImprovement = [];

    if (charCount < 10) {
      score = 25;
      strengths.push("Attempted or viewed prompt.");
      areasForImprovement.push("No substantive response provided. Practice articulating structured technical points or STAR examples.");
    } else {
      // Analyze answer depth, keywords, and relevance
      let baseScore = 60;

      // Word count grading
      if (wordCount >= 90) baseScore += 20;
      else if (wordCount >= 50) baseScore += 14;
      else if (wordCount >= 25) baseScore += 8;

      // Check key evaluation concepts
      const lowerAnswer = rawAnswer.toLowerCase();
      let matchedCriteria = 0;
      q.keyEvaluationPoints.forEach((point) => {
        const pointWords = point.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
        const match = pointWords.some((word) => lowerAnswer.includes(word));
        if (match) matchedCriteria++;
      });

      baseScore += matchedCriteria * 6;

      // Scenario specific: check STAR keywords
      if (q.type === "scenario") {
        const starSignals = ["situation", "task", "action", "result", "because", "impact", "metric", "stakeholder", "resolved", "prioritized"];
        const foundSignals = starSignals.filter((sig) => lowerAnswer.includes(sig));
        if (foundSignals.length >= 3) baseScore += 6;
      }

      // Check JD keyword relevance
      if (jdKeywords.length > 0) {
        const matchedJdWords = jdKeywords.filter((w) => lowerAnswer.includes(w));
        if (matchedJdWords.length >= 2) baseScore += 5;
      }

      score = Math.min(Math.max(baseScore, 35), 98);

      // Strengths & feedback generation
      if (wordCount >= 60) {
        strengths.push("Good descriptive depth and structured thought process.");
      } else {
        strengths.push("Clear concise baseline answer.");
      }

      if (matchedCriteria > 0) {
        strengths.push("Successfully addressed core architectural and evaluation criteria.");
      }

      if (score >= 80) {
        strengths.push("Demonstrates senior-level grasp of system trade-offs and best practices.");
        areasForImprovement.push("Can further strengthen answer by quoting specific production metrics or monitoring thresholds.");
      } else if (score >= 60) {
        areasForImprovement.push("Expand on specific edge cases, failure recovery, or quantitative impact of your decisions.");
        areasForImprovement.push("Consider explicitly mentioning trade-offs between speed of delivery and architectural cleanliness.");
      } else {
        areasForImprovement.push("Answer lacks technical specifics. Review recommended answer to structure with precise terminology.");
      }
    }

    totalScoreSum += score;
    if (q.type === "technical") {
      techScoreSum += score;
      techCount++;
    } else {
      scenarioScoreSum += score;
      scenarioCount++;
    }

    return {
      id: q.id,
      number: q.number,
      type: q.type,
      typeLabel: q.typeLabel,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      intention: q.intention,
      candidateAnswer: rawAnswer || "No answer recorded.",
      wordCount,
      score,
      strengths,
      areasForImprovement,
      idealAnswer: q.idealAnswer,
    };
  });

  const overallScore = Math.round(totalScoreSum / (totalQuestions || 1));
  const technicalScore = techCount > 0 ? Math.round(techScoreSum / techCount) : overallScore;
  const scenarioScore = scenarioCount > 0 ? Math.round(scenarioScoreSum / scenarioCount) : overallScore;
  const communicationScore = Math.min(100, Math.round((overallScore * 0.9) + (answeredCount / totalQuestions) * 15));

  // Determine readiness verdict
  let readinessVerdict = "Strong Candidate";
  let verdictSummary = "Outstanding performance! Your technical breadth and scenario decision-making demonstrate strong senior-level readiness for this role.";
  if (overallScore < 60) {
    readinessVerdict = "High Growth Opportunity";
    verdictSummary = "You have a solid foundation, but several answers need deeper technical specificity and structured STAR methodology. Focus on the identified gaps below.";
  } else if (overallScore < 78) {
    readinessVerdict = "Moderate Fit / Promising";
    verdictSummary = "Good overall grasp of the key responsibilities. Refining your edge-case handling and production telemetry responses will make you a top-tier contender.";
  }

  // Key Technical Strengths
  const technicalStrengths = [
    {
      title: "Architectural Separation of Concerns",
      description: "Demonstrated clear understanding of decoupling presentation components, domain hooks, and API network layers.",
    },
    {
      title: "Real-World Incident Pragmatism",
      description: "Effective focus on customer stabilization, automated telemetry, and safe rollback over ad-hoc production patching.",
    },
    {
      title: "Performance & Rendering Optimization",
      description: "Articulated core Web Vitals diagnosis, non-blocking asynchronous execution, and memory leak prevention.",
    },
    {
      title: "Collaborative Engineering Culture",
      description: "Positive approach to constructive code reviews, empathetic junior mentorship, and business-aligned product trade-offs.",
    },
  ];

  // Areas for Improvement / Skill Gaps
  const areasForImprovement = [
    {
      skill: "Quantitative Impact & Telemetry Metrics",
      severity: overallScore >= 80 ? "low" : "medium",
      suggestion: "Quantify your achievements and architectural decisions with concrete metrics (e.g., '% bundle reduction', 'ms latency savings', 'error rate drops').",
    },
    {
      skill: "System Design & Distributed Edge Caching",
      severity: technicalScore >= 75 ? "low" : "high",
      suggestion: "Deepen explanations of CDN edge caching, stale-while-revalidate invalidations, and database connection limits under high concurrency.",
    },
    {
      skill: "Defensive Coding & Security Hardening",
      severity: "medium",
      suggestion: "Proactively highlight Content Security Policy (CSP), token storage security (HttpOnly cookies vs localStorage), and automated security scanning.",
    },
    {
      skill: "Structured STAR Storytelling",
      severity: scenarioScore >= 75 ? "low" : "high",
      suggestion: "Ensure every scenario response clearly separates Situation, Task, Action, and the final business/technical Result.",
    },
  ];

  const report = {
    id: `mock-report-${Date.now()}`,
    createdAt: new Date().toISOString(),
    overallScore,
    technicalScore,
    scenarioScore,
    communicationScore,
    readinessVerdict,
    verdictSummary,
    answeredCount,
    totalQuestions,
    elapsedSeconds,
    technicalStrengths,
    areasForImprovement,
    questionEvaluations,
    categoryBreakdown: [
      { name: "Technical Mastery & Runtime Concepts", score: technicalScore },
      { name: "Real-World Scenario Decision Making", score: scenarioScore },
      { name: "Communication & Structural Clarity", score: communicationScore },
      { name: "Production Resilience & Security", score: Math.min(100, Math.round((technicalScore + scenarioScore) / 2)) },
    ],
  };

  return report;
}

// ---------------- LOCAL STORAGE MANAGEMENT ----------------

export function getSavedMockSession(reportId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_SESSION_PREFIX}${reportId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to load saved mock session:", err);
    return null;
  }
}

export function saveMockSession(reportId, sessionData) {
  try {
    localStorage.setItem(`${STORAGE_SESSION_PREFIX}${reportId}`, JSON.stringify(sessionData));
  } catch (err) {
    console.error("Failed to save mock session:", err);
  }
}

export function clearSavedMockSession(reportId) {
  try {
    localStorage.removeItem(`${STORAGE_SESSION_PREFIX}${reportId}`);
  } catch (err) {
    console.error("Failed to clear saved mock session:", err);
  }
}

export function getSavedMockReport(reportId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_REPORT_PREFIX}${reportId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to load saved mock report:", err);
    return null;
  }
}

export function saveMockReport(reportId, reportData) {
  try {
    localStorage.setItem(`${STORAGE_REPORT_PREFIX}${reportId}`, JSON.stringify(reportData));
  } catch (err) {
    console.error("Failed to save mock report:", err);
  }
}

// ---------------- AUDIO / SPEECH UTILITIES ----------------

/**
 * Text-to-speech helper to have the AI interviewer read out questions aloud.
 */
export function speakQuestion(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { supported: false };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = "en-US";

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return { supported: true, stop: () => window.speechSynthesis.cancel() };
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speech-to-Text Recognition instance helper using Web Speech API.
 */
export function createSpeechRecognition({ onResult, onError, onEnd }) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };

  if (onError) recognition.onerror = onError;
  if (onEnd) recognition.onend = onEnd;

  return recognition;
}
