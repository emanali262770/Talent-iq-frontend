// InterviewReport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InterviewReport.scss";
import { useInterview } from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";
import FullPageLoader from "../../../components/FullPageLoader";

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, getInterviewReportById, report } = useInterview();
  const { user, handleLogout } = useAuth();

  const authActions = (
    <>
      <span className="user-chip">{user?.userName || user?.email || "User"}</span>
      <button
        className="nav-btn primary"
        onClick={async () => {
          await handleLogout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </>
  );

  useEffect(() => {
    getInterviewReportById(id);
  }, [id]);

  const data = report || {};
  const matchScore = Number(data.matchScore) || 0;
  const technicalQuestions = data.technicalQuestions || [];
  const behavioralQuestions = data.behavioralQuestions || [];
  const skillGaps = data.skillGaps || [];
  const preparationPlan = data.preparationPlan || [];
  const resumePreview = data.resume ? `${data.resume.substring(0, 500)}...` : "";
  const hasReport = Boolean(report && typeof report === "object" && Object.keys(report).length);

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

  if (loading) {
    return (
      <div className="report-page">
        <div className="page-nav">
          <button className="nav-btn secondary" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="nav-btn primary" onClick={() => navigate("/interview-reports")}>
            My Reports
          </button>
          {authActions}
        </div>
        <div className="report-container">
          <FullPageLoader label="Loading report" />
        </div>
      </div>
    );
  }

  if (!hasReport) {
    return (
      <div className="report-page">
        <div className="page-nav">
          <button className="nav-btn secondary" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="nav-btn primary" onClick={() => navigate("/interview-reports")}>
            My Reports
          </button>
          {authActions}
        </div>
        <div className="report-container">
          <div className="score-card">
            <p>Report not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="page-nav">
        <button className="nav-btn secondary" onClick={() => navigate("/")}>
          Home
        </button>
        <button className="nav-btn primary" onClick={() => navigate("/interview-reports")}>
          My Reports
        </button>
        {authActions}
      </div>

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
                stroke={getScoreColor(matchScore)}
                strokeWidth="12"
                fill="transparent"
                r="76"
                cx="90"
                cy="90"
                style={{
                  strokeDasharray: `${2 * Math.PI * 76}`,
                  strokeDashoffset: `${2 * Math.PI * 76 * (1 - matchScore / 100)}`
                }}
              />
            </svg>
            <div className="score-number">
              <span className="value">{matchScore}%</span>
              <span className="label">Match Score</span>
            </div>
          </div>
          <div className="score-details">
            <h3>Profile Match Analysis</h3>
            <p>Based on your experience and skills compared to job requirements</p>
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
                    <pre>{data.jobDescription || ""}</pre>
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
                    <p className="self-description">{data.selfDescription || ""}</p>
                    <div className="resume-preview">
                      <h4>Resume Preview</h4>
                      <pre>{resumePreview}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="questions-tab">
              {technicalQuestions.map((item, index) => (
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
              {behavioralQuestions.map((item, index) => (
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
                {skillGaps.map((gap, index) => (
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
                {preparationPlan.map((day, index) => (
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