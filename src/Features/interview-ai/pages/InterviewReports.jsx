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
    return new Date(dateValue).toLocaleDateString();
  };

  const shortText = (text, limit = 120) => {
    if (!text) return "No details available";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  return (
    <div className="reports-page">
      <div className="page-nav">
        <button className="nav-btn secondary" onClick={() => navigate("/")}>
          Home
        </button>
        <button className="nav-btn primary" onClick={() => navigate("/interview-reports")}>
          My Reports
        </button>
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
      </div>

      <div className="reports-header">
        <span className="badge">INTERVIEW HISTORY</span>
        <h1>Your Interview Reports</h1>
        <p>Review your previous reports and open any one to see full details.</p>
      </div>

      {loading ? (
        <FullPageLoader label="Loading reports" />
      ) : reports?.length ? (
        <div className="reports-grid">
          {reports.map((item) => (
            <button
              key={item._id}
              className="report-card"
              onClick={() => navigate(`/interview-report/${item._id}`)}
            >
              <div className="report-card__top">
                <span className="date">{formatDate(item.createdAt)}</span>
                <span
                  className="score"
                  style={{ color: getScoreColor(Number(item.matchScore) || 0) }}
                >
                  {Number(item.matchScore) || 0}% match
                </span>
              </div>

              <h3>{shortText(item.jobDescription, 90)}</h3>
              <p>{shortText(item.selfDescription, 140)}</p>

              <div className="report-card__meta">
                <span>{item.technicalQuestions?.length || 0} technical</span>
                <span>{item.behavioralQuestions?.length || 0} behavioral</span>
                <span>{item.skillGaps?.length || 0} gaps</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="state-card">
          No reports found yet. Generate your first interview strategy from Home.
        </div>
      )}
    </div>
  );
};

export default InterviewReports;
