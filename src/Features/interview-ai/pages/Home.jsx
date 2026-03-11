import React, { useRef, useState } from "react";
import "../pages/Home.scss";
import { useInterview } from "../hooks/useInterview";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

const Home = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { loading, creatInterviewreport } = useInterview();
  const { user, handleLogout } = useAuth();

  const isPdfFile = (file) => {
    if (!file) return false;
    const fileName = file.name?.toLowerCase() || "";
    return file.type === "application/pdf" || fileName.endsWith(".pdf");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isPdfFile(file)) {
        toast.error("Only PDF files are allowed.");
        e.target.value = "";
        return;
      }

      setResume(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!isPdfFile(file)) {
        toast.error("Only PDF files are allowed.");
        return;
      }

      setResume(file);
    }
  };

  async function handleSubmit() {
    try {
      const data = await creatInterviewreport({
        selfDescription,
        jobDescription,
        resume,
      });

      setSelfDescription("");
      setJobDescription("");
      setResume(null);
      setAgreeTerms(false);
      fileInputRef.current.value = "";
      toast.success(
        data.message || "Interview strategy generated successfully!",
      );
      
      
      navigate(`/interview-report/${data.interviewReport._id}`);
    } catch (err) {
      toast.error(
        err.message ||
          "An error occurred while generating the interview strategy.",
      );
    }
  }

  return (
    <div className="home">
      <div className="page-nav">
        <button className="nav-btn secondary" onClick={() => navigate("/interview-reports")}>
          My Reports
        </button>
        {user ? (
          <>
            <span className="user-chip">{user.userName || user.email || "User"}</span>
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
        ) : (
          <button className="nav-btn primary" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <span className="badge">AI-POWERED INTERVIEW PREP</span>
          <h1>
            Create Your Custom{" "}
            <span className="gradient-text">Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze your job fit requirements & unique profile to
            build a winning strategy
          </p>
        </div>
      </div>

      <div className="container">
        {/* Left Side - Job Description */}
        <div className="card job-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2>Target Job Description</h2>
          </div>
          <p className="section-description">
            Paste the job description to help our AI understand the role you're
            targeting
          </p>
          <div className="textarea-wrapper">
            <textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <span className="char-count">
              {jobDescription.length} characters
            </span>
          </div>
        </div>

        {/* Right Side - Your Profile */}
        <div className="card resume-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2>Your Profile</h2>
          </div>

          {/* Upload Resume */}
          <div className="upload-section">
            <label
              htmlFor="resumeUpload"
              className={`upload-box ${isDragging ? "dragging" : ""} ${resume ? "has-file" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                {resume ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>
              <div className="upload-text">
                {resume ? (
                  <>
                    <strong>{resume?.name}</strong>
                    <span>Click or drag to replace</span>
                  </>
                ) : (
                  <>
                    <strong>Click to upload</strong>
                    <span>or drag and drop</span>
                  </>
                )}
              </div>
            </label>
            <p className="upload-hint">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Supported format: PDF only (Max 5MB)
            </p>
            <input
              ref={fileInputRef}
              id="resumeUpload"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              hidden
            />
          </div>

          {/* Self Description - Enhanced Version without Prompt Cards */}
          <div className="self-description-enhanced">
            <div className="self-description-header">
              <div className="header-left">
                <label>Quick Self Description</label>
                <span className="optional-badge">Optional</span>
              </div>
              <div className="character-tip">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Min. 50 characters recommended</span>
              </div>
            </div>

            <div className="self-description-container">
              <div className="input-wrapper">
                <textarea
                  placeholder="Tell us about your experience, key achievements, skills, and career goals..."
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                />
                <div className="textarea-footer">
                  <div className="character-counter">
                    <div className="counter-bar">
                      <div
                        className="counter-fill"
                        style={{
                          width: `${Math.min((selfDescription.length / 200) * 100, 100)}%`,
                          backgroundColor:
                            selfDescription.length >= 50
                              ? "#10b981"
                              : "#f59e0b",
                        }}
                      ></div>
                    </div>
                    <span
                      className={`counter-text ${selfDescription.length >= 50 ? "sufficient" : "insufficient"}`}
                    >
                      {selfDescription.length} / 200 characters
                      {selfDescription.length >= 50 && " ✓"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="terms-box">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                I agree to share my resume and data for analysis to generate a
                customized interview strategy
              </span>
            </label>
          </div>

          <button
            className={`generate-btn ${agreeTerms ? "active" : ""}`}
            disabled={!agreeTerms || loading}
            onClick={handleSubmit}
          >
            <span>
              {loading
                ? "Generating Strategy..."
                : "Generate My Interview Strategy"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
