// InterviewReport.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./InterviewReport.scss";
import { useInterview } from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";
import FullPageLoader from "../../../components/FullPageLoader";
import MockInterviewSession from "../components/MockInterview/MockInterviewSession";
import MockInterviewReportView from "../components/MockInterview/MockInterviewReportView";
import {
  getSavedMockReport,
  saveMockReport,
  clearSavedMockSession,
} from "../services/mockInterviewAi.service";

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [mockReport, setMockReport] = useState(() => getSavedMockReport(id));
  const { loading, getInterviewReportById, report } = useInterview();
  const { user, handleLogout } = useAuth();

  const authActions = (
    <>
      <span className="user-chip">{user?.userName || user?.email || "User"}</span>
      <button
        className="nav-btn logout-btn"
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
    if (id) {
      const saved = getSavedMockReport(id);
      setMockReport(saved);
    }
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
    switch (severity?.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const navHeader = (
    <header className="page-nav">
      <Link to="/dashboard" className="nav-brand">
        <span className="brand-badge">TIQ</span>
        <span className="brand-name">Talent IQ</span>
      </Link>
      <div className="nav-actions">
        <button className="nav-btn secondary" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
        <button className="nav-btn primary" onClick={() => navigate("/interview-reports")}>
          My Reports
        </button>
        {authActions}
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="report-page">
        {navHeader}
        <main className="report-content">
          <FullPageLoader label="Loading report" />
        </main>
      </div>
    );
  }

  if (!hasReport) {
    return (
      <div className="report-page">
        {navHeader}
        <main className="report-content">
          <div className="empty-report-card">
            <h3>Report Not Found</h3>
            <p>The requested interview report could not be found or may have been deleted.</p>
            <button className="action-btn" onClick={() => navigate("/dashboard")}>
              Create New Strategy
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="report-page">
      {navHeader}

      <main className="report-content">
        {/* Header */}
        <div className="report-header">
          <span className="badge">Interview Analysis Report</span>
          <h1>Your Personalized Interview Strategy</h1>
          <p>Comprehensive strategy based on your experience compared directly to role expectations.</p>
        </div>

        {/* Score Card */}
        <div className="score-card">
          <div className="score-circle">
            <svg className="progress-ring" width="120" height="120" viewBox="0 0 120 120">
              <circle
                className="progress-ring__bg"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="transparent"
                r="50"
                cx="60"
                cy="60"
              />
              <circle
                className="progress-ring__fill"
                stroke={getScoreColor(matchScore)}
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="50"
                cx="60"
                cy="60"
                style={{
                  strokeDasharray: `${2 * Math.PI * 50}`,
                  strokeDashoffset: `${2 * Math.PI * 50 * (1 - matchScore / 100)}`,
                }}
              />
            </svg>
            <div className="score-number">
              <span className="value">{matchScore}%</span>
              <span className="label">Match</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-heading-row">
              <h3>Role Compatibility Assessment</h3>
              <span
                className="score-pill"
                style={{
                  color: getScoreColor(matchScore),
                  borderColor: `${getScoreColor(matchScore)}40`,
                  background: `${getScoreColor(matchScore)}15`,
                }}
              >
                {matchScore >= 80 ? "Strong Fit" : matchScore >= 60 ? "Moderate Fit" : "High Growth Opportunity"}
              </span>
            </div>
            <p>
              Your skills and experience align with core responsibilities. Review question clusters and prioritize
              target gaps to optimize performance during technical and behavioral rounds.
            </p>
            <div className="score-stats">
              <div className="stat-item">
                <span className="stat-val">{technicalQuestions.length}</span>
                <span className="stat-lbl">Technical Prompts</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{behavioralQuestions.length}</span>
                <span className="stat-lbl">Behavioral Prompts</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{skillGaps.length}</span>
                <span className="stat-lbl">Identified Gaps</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{preparationPlan.length}</span>
                <span className="stat-lbl">Plan Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Segmented Navigation Tabs without redundant icons */}
        <div className="report-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "overview"}
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "technical"}
            className={`tab-btn ${activeTab === "technical" ? "active" : ""}`}
            onClick={() => setActiveTab("technical")}
          >
            Technical Questions ({technicalQuestions.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "behavioral"}
            className={`tab-btn ${activeTab === "behavioral" ? "active" : ""}`}
            onClick={() => setActiveTab("behavioral")}
          >
            Behavioral Questions ({behavioralQuestions.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "gaps"}
            className={`tab-btn ${activeTab === "gaps" ? "active" : ""}`}
            onClick={() => setActiveTab("gaps")}
          >
            Skill Gaps ({skillGaps.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "plan"}
            className={`tab-btn ${activeTab === "plan" ? "active" : ""}`}
            onClick={() => setActiveTab("plan")}
          >
            Preparation Plan ({preparationPlan.length} Days)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "mock"}
            className={`tab-btn ${activeTab === "mock" ? "active" : ""}`}
            onClick={() => setActiveTab("mock")}
          >
            Mock Interview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "mock-report"}
            className={`tab-btn ${activeTab === "mock-report" ? "active" : ""}`}
            onClick={() => setActiveTab("mock-report")}
          >
            Mock Interview Report{mockReport ? ` (${mockReport.overallScore}%)` : ""}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Job Description Card */}
                <div className="info-card">
                  <div className="card-header">
                    <h3>Target Job Description</h3>
                  </div>
                  <div className="card-content">
                    <pre>{data.jobDescription || "No job description text recorded."}</pre>
                  </div>
                </div>

                {/* Resume Summary Card */}
                <div className="info-card">
                  <div className="card-header">
                    <h3>Your Profile Summary</h3>
                  </div>
                  <div className="card-content">
                    {data.selfDescription && (
                      <div className="self-desc-block">
                        <h4>Candidate Notes</h4>
                        <p className="self-description">{data.selfDescription}</p>
                      </div>
                    )}
                    <div className="resume-preview">
                      <h4>Resume Snapshot</h4>
                      <pre>{resumePreview || "No resume text preview available."}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "technical" && (
            <div className="questions-tab">
              {technicalQuestions.length === 0 ? (
                <p className="empty-tab-text">No technical questions generated for this report.</p>
              ) : (
                technicalQuestions.map((item, index) => (
                  <div className="question-card" key={index}>
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <h3>{item.question}</h3>
                    </div>
                    <div className="question-details">
                      <div className="intention">
                        <span className="label">Interviewer Intention</span>
                        <p>{item.intention}</p>
                      </div>
                      <div className="answer">
                        <span className="label">Recommended Strategy & Answer</span>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "behavioral" && (
            <div className="questions-tab">
              {behavioralQuestions.length === 0 ? (
                <p className="empty-tab-text">No behavioral questions generated for this report.</p>
              ) : (
                behavioralQuestions.map((item, index) => (
                  <div className="question-card" key={index}>
                    <div className="question-header">
                      <span className="question-number">BQ{index + 1}</span>
                      <h3>{item.question}</h3>
                    </div>
                    <div className="question-details">
                      <div className="intention">
                        <span className="label">Interviewer Intention</span>
                        <p>{item.intention}</p>
                      </div>
                      <div className="answer">
                        <span className="label">Recommended Strategy & Answer</span>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "gaps" && (
            <div className="gaps-tab">
              {skillGaps.length === 0 ? (
                <p className="empty-tab-text">No skill gaps identified. Strong alignment with requirements.</p>
              ) : (
                <div className="gaps-grid">
                  {skillGaps.map((gap, index) => {
                    const color = getSeverityColor(gap.severity);
                    return (
                      <div className="gap-card" key={index}>
                        <div className="gap-header">
                          <span className="gap-skill">{gap.skill}</span>
                          <span
                            className="gap-severity"
                            style={{
                              color: color,
                              borderColor: `${color}40`,
                              backgroundColor: `${color}15`,
                            }}
                          >
                            {gap.severity?.toUpperCase() || "MODERATE"}
                          </span>
                        </div>
                        <div className="gap-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width:
                                  gap.severity?.toLowerCase() === "high"
                                    ? "35%"
                                    : gap.severity?.toLowerCase() === "medium"
                                    ? "65%"
                                    : "85%",
                                backgroundColor: color,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "plan" && (
            <div className="plan-tab">
              {preparationPlan.length === 0 ? (
                <p className="empty-tab-text">No preparation plan details recorded.</p>
              ) : (
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
                              <span className="task-bullet" aria-hidden="true" />
                              <span className="task-text">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "mock" && (
            <div className="mock-tab">
              <MockInterviewSession
                reportId={id}
                jobDescription={data.jobDescription}
                selfDescription={data.selfDescription}
                resume={data.resume}
                existingTechQuestions={technicalQuestions}
                onFinishInterview={(evaluatedReport) => {
                  saveMockReport(id, evaluatedReport);
                  setMockReport(evaluatedReport);
                  setActiveTab("mock-report");
                }}
              />
            </div>
          )}

          {activeTab === "mock-report" && (
            <div className="mock-report-tab">
              <MockInterviewReportView
                report={mockReport}
                onRetakeInterview={() => {
                  clearSavedMockSession(id);
                  setActiveTab("mock");
                }}
                onGoToInterview={() => {
                  setActiveTab("mock");
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewReport;
