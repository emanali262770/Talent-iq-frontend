import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="page-nav">
        <button
          className="nav-btn secondary"
          onClick={() => navigate("/dashboard")}
        >
          Home
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
          className="nav-btn secondary"
          onClick={async () => {
            await handleLogout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="reports-header">
        <span className="badge">INTERVIEW HISTORY</span>
        <h1>Your Interview Reports</h1>
        <p>Review your previous reports and open any one to see full details.</p>
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
                    className="score"
                    style={{ color: getScoreColor(matchScore) }}
                  >
                    {matchScore}% match
                  </span>
                </div>

                <h3>{shortText(item.jobDescription, 90)}</h3>
                <p>{shortText(item.selfDescription, 140)}</p>

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
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3>No reports found yet</h3>
            <p>Generate your first AI interview strategy with a target role and resume.</p>
            <button
              className="create-btn"
              onClick={() => navigate("/dashboard")}
            >
              Create New Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewReports;
