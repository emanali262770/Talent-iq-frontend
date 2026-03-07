// InterviewReport.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./InterviewReport.scss";

const InterviewReport = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data - in real app, this would come from an API
  const reportData = {
    "interviewReport": {
      "jobDescription": "Position: Backend Developer (Node.js)\n\nLocation: Remote / Bangalore\n\nWe are looking for a Backend Developer with strong experience in Node.js and database design to build scalable and high-performance APIs.\n\n\nResponsibilities:\n\n- Design and develop scalable RESTful APIs using Node.js and Express.\n- Optimize database performance using indexing, query optimization, and caching strategies.\n- Implement authentication and authorization mechanisms.\n- Work with Redis or similar caching solutions.\n- Write clean, maintainable, and testable code.\n- Collaborate with frontend and DevOps teams.\n- Participate in system design discussions.\n\n\n\nRequired Skills:\n\n- 3+ years experience in backend development.\n- Strong knowledge of Node.js and asynchronous programming.\n- Experience with MongoDB and database optimization.\n- Understanding of caching strategies (Redis preferred).\n- Familiarity with Docker and basic CI/CD workflows.\n- Good understanding of data structures and algorithms.\n\n\n\nPreferred:\n\n- Experience working with microservices architecture.\n- Exposure to distributed systems.\n- Knowledge of message queues (Kafka, RabbitMQ).",
      "resume": "EMAN ALI\nLahore Pakistan\nemanali262770@gmail.com\n03184486979\nFull stack developer with 1 year of frontend and 5 months of backend experience in designing and building end-to-end\nweb applications. Proficient in creating responsive user interfaces and developing secure, scalable backend systems.\nCurrently pursuing a Bachelor of Computer Science, expected in 2026, with a focus on clean architecture and scalable\nsystem design. Aiming to transition into a solution architect role to address real-world challenges.\nFrontend Development\nBackend Development\nDatabases & ORM\nTools & Version Control\nDeployment\nHTML5\t• CSS3\t• Tailwind CSS\t• JavaScript (ES6+)\t• TypeScript\t• React JS\t• Redux Toolkit\t• React Query\t• Next Js\t•\nNode.js\t• Express.js\t• FireBase\t• RESTful API Development\t•\nAuthentication (JWT, Role-Based Access Control)\t•\nMongoDB\t• PostgreSQL\t• Prisma ORM\t•\nVersion control with Git and GitHub\t• API testing with Postman\t• Development environment (VS Code)\t•\nVercel\t• Netlify\t• Render\t• Railway\t• C-Pannel\t•\n05/2025 to Current\nAFAQ TECHNOLOGIES\nlahore, Pakistan\nFull Stack Web Developer\nArchitected and developed end-to-end web applications following MVC architecture.\t• Designed secure authentication systems and implemented protected API routes.\t• Integrated third-party APIs and improved system performance through efficient database queries.\t• Reduced frontend load time by optimizing components and API calls.\t• Managed version control and collaborative workflows using Git and GitHub.\t• Ensured clean, maintainable code using best practices and scalable project structures.\t•\nPUKAT SOFTWARE SOLUTIONS\nReact js Internship\nCompany Overview: Gained hands-on experience in building dynamic and responsive web applications using\nReact.js\n•\nGained hands-on experience in building dynamic and responsive web applications using React.js\t• Worked closely with the development team to implement component-based architecture, manage state efficiently,\nand integrate APIs\n•\nFocused on optimizing performance, enhancing UI/UX, and utilizing modern front-end tools such as React\nHooks, React Router, and Tailwind CSS\n•\nGained hands-on experience in building dynamic and responsive web applications using React.js\t•\nExpected in 06/2026\tBACHELOR OF COMPUTER SCIENCE\nNCBA&E University, Lahore\nhttps://www.linkedin.com/in/emanali2838/\t•\nSUMMARY\nSKILLS\nWORK HISTORY\nEDUCATION\nPROFESSIONAL LINKS\n\n-- 1 of 2 --\n\nhttps://github.com/emanali262770\t•\nArfa Software Technology Park (Arfa Karim Tower), Lahore\nComprehensive hands-on training focused on building full-stack web applications using MongoDB, Express.js, React.js,\nand Node.js. Covered RESTful API development, authentication (JWT), database design, state management, and\ndeployment practices.\nCampus Connect – React Js | https://campus-connect-frontend-pearl.vercel.app/\nCall Logs System – MERN Stack | https://cms-logs-frontend.vercel.app/\nDistribution System – MERN Stack | https://city-traders-lhr.vercel.app/\nCOD-Track – Next Js FireBase | https://platform.cod-as.com/\nAfaq Tech Portfolio – Next Js & Tailwind | https://afaq-technologies-portfolio.vercel.app/\nCERTIFICATIONS\nPROJECTS\n\n-- 2 of 2 --\n\n",
      "selfDescription": "MERN Stack Developer with experience building scalable web applications using Node.js, Express, React, and MongoDB.\nFocused on backend architecture, API design, database optimization, and secure authentication systems.\nPassionate about writing clean code, improving performance, and building reliable production-ready applications.",
      "matchScore": 55,
      "technicalQuestions": [
        {
          "question": "Given your experience with Node.js and Express, how do you handle asynchronous operations to prevent callback hell and ensure efficient resource utilization? Can you provide an example of a pattern you've used?",
          "intention": "To assess understanding of fundamental Node.js async patterns and best practices.",
          "answer": "Candidate should discuss Promises, async/await, and potentially event emitters. They should explain how these patterns improve code readability, error handling, and maintainability. An example could be fetching data from a database and an external API concurrently."
        },
        {
          "question": "The job emphasizes database optimization, particularly with MongoDB. Beyond basic indexing, what strategies have you employed or would you consider to optimize query performance and reduce database load in a production environment?",
          "intention": "To gauge depth of knowledge in database performance tuning beyond basic CRUD operations, addressing a key job requirement.",
          "answer": "Should cover compound indexes, partial indexes, schema design considerations for query patterns, aggregation pipeline optimization, projection, limiting results, sharding (if applicable for scaling), and discussing the use of an explain plan."
        },
        {
          "question": "You've mentioned implementing secure authentication systems and protected API routes. Can you describe a robust authentication and authorization flow you've designed or worked on, detailing how you handled tokens (like JWTs) and role-based access control?",
          "intention": "To evaluate practical experience with security best practices in API development, which is a core responsibility.",
          "answer": "Should explain JWT lifecycle (issuance, storage, validation, refresh), secure transmission (HTTPS), role definition, middleware for authorization checks, and handling token revocation."
        },
        {
          "question": "Imagine we need to build a new API endpoint that frequently fetches a specific dataset that changes only once every hour. How would you design this endpoint to be performant and efficient, specifically considering caching mechanisms?",
          "intention": "To assess understanding of caching strategies, particularly relevant given the job's mention of Redis.",
          "answer": "Should discuss using an in-memory cache or an external caching layer (like Redis) for the dataset. Explain the cache invalidation strategy (time-based expiry), cache-aside pattern, and considerations for data consistency."
        },
        {
          "question": "The job involves participating in system design discussions. Given your goal to transition into a solution architect role, how would you approach designing a scalable API for a real-time chat application, focusing on Node.js as the backend?",
          "intention": "To assess system design thinking and understanding of architectural patterns for real-time applications, and Node.js's suitability.",
          "answer": "Candidate should discuss using WebSockets (e.g., Socket.IO) for real-time communication, a pub/sub mechanism (e.g., Redis Pub/Sub, Kafka) for message broadcasting across multiple Node.js instances, horizontal scaling of Node.js servers, and database choices for chat history (e.g., MongoDB, PostgreSQL with JSONB)."
        }
      ],
      "behavioralQuestions": [
        {
          "question": "You have 5 months of backend experience and aim to transition into a solution architect role. How do you plan to rapidly acquire the necessary deep backend expertise and system design understanding required for such a transition, especially given the '3+ years' experience mentioned in this role?",
          "intention": "To understand the candidate's self-awareness, motivation, and proactive approach to career development and addressing experience gaps.",
          "answer": "Candidate should demonstrate a clear learning plan, commitment to continuous learning (online courses, projects, mentorship), and enthusiasm for backend challenges. They might emphasize their quick learning ability or specific resources they plan to leverage."
        },
        {
          "question": "Can you describe a challenging technical problem you faced in your backend development experience at AFAQ TECHNOLOGIES and how you approached solving it? What was the outcome?",
          "intention": "To evaluate problem-solving skills, critical thinking, and ability to handle technical difficulties in a backend context.",
          "answer": "Should describe the problem, the steps taken to diagnose it, the solutions considered, the chosen solution, and the positive impact. Focus on their individual contribution and learning."
        },
        {
          "question": "The job involves collaborating with frontend and DevOps teams. Can you give an example of a time you had to work closely with another team to resolve an issue or deliver a feature? What was your role, and how did you ensure smooth communication?",
          "intention": "To assess teamwork, communication skills, and ability to work in an interdisciplinary environment.",
          "answer": "Should highlight effective communication, understanding different team perspectives, negotiation, and achieving a common goal."
        },
        {
          "question": "You've worked with a MERN stack and mentioned 'clean architecture and scalable system design' as a focus. How do you ensure the code you write is clean, maintainable, and contributes to a scalable system, especially when deadlines are tight?",
          "intention": "To understand the candidate's commitment to code quality and architectural principles under pressure, reflecting a core job responsibility.",
          "answer": "Should discuss coding standards, modularity, testing (unit, integration), documentation, design patterns, code reviews, and prioritizing technical debt appropriately."
        }
      ],
      "skillGaps": [
        {
          "skill": "3+ years dedicated backend development experience",
          "severity": "high"
        },
        {
          "skill": "In-depth experience with Redis or similar caching solutions",
          "severity": "medium"
        },
        {
          "skill": "Hands-on experience with Docker and CI/CD workflows",
          "severity": "medium"
        },
        {
          "skill": "Strong theoretical and practical knowledge of Data Structures and Algorithms specific to backend optimization",
          "severity": "medium"
        },
        {
          "skill": "Exposure to microservices architecture and distributed systems (preferred)",
          "severity": "low"
        }
      ],
      "preparationPlan": [
        {
          "day": 1,
          "focus": "Node.js Asynchronous Patterns & Performance",
          "tasks": [
            "Review JavaScript Event Loop, Call Stack, Callback Queue, Microtask Queue.",
            "Practice advanced async/await patterns, Promise.all, Promise.race.",
            "Read: 'Mastering the Node.js Event Loop' by Samer Buna (articles/sections).",
            "Implement a simple script demonstrating efficient use of async/await for parallel operations."
          ]
        },
        {
          "day": 2,
          "focus": "MongoDB Optimization & Indexing",
          "tasks": [
            "Study MongoDB indexing strategies (single, compound, text, geospatial, partial).",
            "Learn to use 'explain()' to analyze query performance.",
            "Watch: MongoDB University course on 'Schema Design and Performance' (relevant modules).",
            "Practice optimizing slow queries in a sample MongoDB database."
          ]
        },
        {
          "day": 3,
          "focus": "Caching Strategies (Redis Focus)",
          "tasks": [
            "Understand caching principles (cache-aside, write-through, write-back).",
            "Learn Redis data structures and common use cases for backend (session management, caching, pub/sub).",
            "Tutorial: 'Introduction to Redis with Node.js' (e.g., DigitalOcean or freeCodeCamp tutorials).",
            "Implement a simple Node.js API with Redis caching for frequently accessed data."
          ]
        },
        {
          "day": 4,
          "focus": "Docker & Basic CI/CD",
          "tasks": [
            "Learn Docker basics: containers, images, Dockerfile, Docker Compose.",
            "Understand basic CI/CD concepts (build, test, deploy stages).",
            "Tutorial: 'Docker for Node.js Developers' (e.g., official Docker docs or popular YouTube tutorials).",
            "Containerize a simple Node.js application and run it with Docker Compose."
          ]
        },
        {
          "day": 5,
          "focus": "RESTful API Design & Best Practices",
          "tasks": [
            "Review principles of REST (idempotency, statelessness, resource-based URLs).",
            "Focus on error handling, versioning, pagination, filtering, and security considerations.",
            "Read: 'API Design Guide' by Microsoft or Google (sections on REST).",
            "Design a robust API endpoint with proper error handling and request validation."
          ]
        },
        {
          "day": 6,
          "focus": "System Design & Scalability Concepts",
          "tasks": [
            "Study common system design patterns (load balancing, database scaling, microservices overview).",
            "Focus on how Node.js fits into scalable architectures.",
            "Watch: 'System Design Interview' series by Gaurav Sen or similar resources on YouTube (focus on backend/API scaling).",
            "Outline a high-level design for a system like a URL shortener, detailing components and their interactions."
          ]
        },
        {
          "day": 7,
          "focus": "Mock Interview and Review",
          "tasks": [
            "Conduct a full mock interview covering technical, behavioral, and system design questions.",
            "Review all technical questions and answers.",
            "Practice explaining projects from the resume clearly and concisely.",
            "Identify areas for improvement and reinforce confidence."
          ]
        }
      ],
      "user": "69abbe9be7105c6033fd3c1a",
      "_id": "69abc0fe82762bbc6100c78e",
      "createdAt": "2026-03-07T06:09:02.126Z",
      "updatedAt": "2026-03-07T06:09:02.126Z",
      "__v": 0
    }
  };

  const data = reportData.interviewReport;

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className="report-page">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <span className="badge">INTERVIEW ANALYSIS REPORT</span>
          <h1>
            Your Personalized <span className="gradient-text">Interview Strategy</span>
          </h1>
          <p>Comprehensive analysis based on your profile and target job description</p>
        </div>
      </div>

      <div className="report-container">
        {/* Score Card */}
        <div className="score-card">
          <div className="score-circle">
            <svg className="progress-ring" width="180" height="180">
              <circle
                className="progress-ring__bg"
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
                r="76"
                cx="90"
                cy="90"
              />
              <circle
                className="progress-ring__fill"
                stroke={getScoreColor(data.matchScore)}
                strokeWidth="12"
                fill="transparent"
                r="76"
                cx="90"
                cy="90"
                style={{
                  strokeDasharray: `${2 * Math.PI * 76}`,
                  strokeDashoffset: `${2 * Math.PI * 76 * (1 - data.matchScore / 100)}`
                }}
              />
            </svg>
            <div className="score-number">
              <span className="value">{data.matchScore}%</span>
              <span className="label">Match Score</span>
            </div>
          </div>
          <div className="score-details">
            <h3>Profile Match Analysis</h3>
            <p>Based on your experience and skills compared to job requirements</p>
            <div className="match-bars">
              <div className="match-bar-item">
                <span>Technical Skills</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: '45%', backgroundColor: '#818cf8' }}></div>
                </div>
              </div>
              <div className="match-bar-item">
                <span>Experience Level</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: '30%', backgroundColor: '#e11d48' }}></div>
                </div>
              </div>
              <div className="match-bar-item">
                <span>Domain Knowledge</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: '60%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="report-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <line x1="8" y1="2" x2="8" y2="22" />
              <line x1="16" y1="2" x2="16" y2="22" />
            </svg>
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveTab('technical')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Technical Questions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'behavioral' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavioral')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Behavioral Questions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('gaps')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Skill Gaps
          </button>
          <button 
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Preparation Plan
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Job Description */}
                <div className="info-card">
                  <div className="card-header">
                    <div className="icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <h3>Target Job Description</h3>
                  </div>
                  <div className="card-content">
                    <pre>{data.jobDescription}</pre>
                  </div>
                </div>

                {/* Resume Summary */}
                <div className="info-card">
                  <div className="card-header">
                    <div className="icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <h3>Your Profile Summary</h3>
                  </div>
                  <div className="card-content">
                    <p className="self-description">{data.selfDescription}</p>
                    <div className="resume-preview">
                      <h4>Resume Preview</h4>
                      <pre>{data.resume.substring(0, 500)}...</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="questions-tab">
              {data.technicalQuestions.map((item, index) => (
                <div className="question-card" key={index}>
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <h3>{item.question}</h3>
                  </div>
                  <div className="question-details">
                    <div className="intention">
                      <span className="label">Intention:</span>
                      <p>{item.intention}</p>
                    </div>
                    <div className="answer">
                      <span className="label">Suggested Answer:</span>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'behavioral' && (
            <div className="questions-tab">
              {data.behavioralQuestions.map((item, index) => (
                <div className="question-card" key={index}>
                  <div className="question-header">
                    <span className="question-number">BQ{index + 1}</span>
                    <h3>{item.question}</h3>
                  </div>
                  <div className="question-details">
                    <div className="intention">
                      <span className="label">Intention:</span>
                      <p>{item.intention}</p>
                    </div>
                    <div className="answer">
                      <span className="label">Suggested Answer:</span>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gaps' && (
            <div className="gaps-tab">
              <div className="gaps-grid">
                {data.skillGaps.map((gap, index) => (
                  <div className="gap-card" key={index} style={{ borderColor: getSeverityColor(gap.severity) }}>
                    <div className="gap-header">
                      <span className="gap-skill">{gap.skill}</span>
                      <span className="gap-severity" style={{ backgroundColor: getSeverityColor(gap.severity) }}>
                        {gap.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="gap-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: gap.severity === 'high' ? '25%' : gap.severity === 'medium' ? '50%' : '75%',
                            backgroundColor: getSeverityColor(gap.severity)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="plan-tab">
              <div className="plan-timeline">
                {data.preparationPlan.map((day, index) => (
                  <div className="timeline-day" key={index}>
                    <div className="day-header">
                      <span className="day-number">Day {day.day}</span>
                      <h3 className="day-focus">{day.focus}</h3>
                    </div>
                    <div className="day-tasks">
                      <ul>
                        {day.tasks.map((task, taskIndex) => (
                          <li key={taskIndex}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;