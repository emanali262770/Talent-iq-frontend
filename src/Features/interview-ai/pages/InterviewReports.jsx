import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InterviewReports.scss";
import { useInterview } from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";
import FullPageLoader from "../../../components/FullPageLoader";

const InterviewReports = () => {
  const navigate = useNavigate();
  const { loading, reports, getAllInterviewReport } = useInterview();
  const { user, handleLogout } = useAuth();

  useEffect(() => {
    getAllInterviewReport();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      return new Date(dateValue).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const shortText = (text, limit = 120) => {
    if (!text || typeof text !== "string") return "No details available";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  // Resilient resolution of reports array whether stored as an array or inside an object
  const reportsList = Array.isArray(reports)
    ? reports
    : (reports?.interviewReport || reports?.interviewReports || reports?.reports || reports?.data || []);

  return (
    <div className="reports-page">
      {/* SaaS Top Navigation */}
      <header className="page-nav">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-badge">TIQ</span>
          <span className="brand-name">Talent IQ</span>
        </Link>
        <div className="nav-actions">
          <button
            className="nav-btn secondary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-btn primary"
            onClick={() => navigate("/interview-reports")}
          >
            My Reports
          </button>
          <span className="user-chip">
            {user?.userName || user?.email || "User"}
          </span>
          <button
            className="nav-btn logout-btn"
            onClick={async () => {
              await handleLogout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="reports-content">
        <div className="reports-header">
          <span className="badge">Interview Archive</span>
          <h1>Your Interview Reports</h1>
          <p>Review past role analyses, preparation roadmaps, and tailored question strategies.</p>
        </div>

        {loading ? (
          <FullPageLoader label="Loading reports" />
        ) : reportsList && reportsList.length > 0 ? (
          <div className="reports-grid">
            {reportsList.filter(Boolean).map((item, index) => {
              const reportId = item._id || item.id || `report-${index}`;
              const matchScore = Number(item.matchScore) || 0;
              const techCount = Array.isArray(item.technicalQuestions)
                ? item.technicalQuestions.length
                : 0;
              const behavCount = Array.isArray(item.behavioralQuestions)
                ? item.behavioralQuestions.length
                : 0;
              const gapsCount = Array.isArray(item.skillGaps)
                ? item.skillGaps.length
                : 0;

              return (
                <button
                  key={reportId}
                  type="button"
                  className="report-card"
                  onClick={() => navigate(`/interview-report/${item._id || item.id}`)}
                >
                  <div className="report-card__top">
                    <span className="date">{formatDate(item.createdAt)}</span>
                    <span
                      className="score-pill"
                      style={{
                        color: getScoreColor(matchScore),
                        borderColor: `${getScoreColor(matchScore)}40`,
                        background: `${getScoreColor(matchScore)}15`,
                      }}
                    >
                      {matchScore}% match
                    </span>
                  </div>

                  <h3>{shortText(item.jobDescription, 85)}</h3>
                  <p>{shortText(item.selfDescription, 120)}</p>

                  <div className="report-card__meta">
                    <span>{techCount} technical</span>
                    <span>{behavCount} behavioral</span>
                    <span>{gapsCount} gaps</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="state-card">
            <div className="state-card-content">
              <h3>No interview reports yet</h3>
              <p>Generate your first AI interview strategy with a target role description and resume.</p>
              <button
                className="create-btn"
                onClick={() => navigate("/dashboard")}
              >
                Create New Strategy
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewReports;
