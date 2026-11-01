import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/Home.scss";
import { useInterview } from "../hooks/useInterview";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/hooks/useAuth";

const Home = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
        setFormErrors((prev) => ({ ...prev, resume: "Only PDF format is supported." }));
        e.target.value = "";
        return;
      }
      setResume(file);
      setFormErrors((prev) => ({ ...prev, resume: "" }));
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
        setFormErrors((prev) => ({ ...prev, resume: "Only PDF format is supported." }));
        return;
      }
      setResume(file);
      setFormErrors((prev) => ({ ...prev, resume: "" }));
    }
  };

  const validateHomeForm = () => {
    const errors = {};
    if (!jobDescription || !jobDescription.trim()) {
      errors.jobDescription = "Please enter or paste the target job description.";
    } else if (jobDescription.trim().length < 20) {
      errors.jobDescription = "Job description is too brief (minimum 20 characters recommended).";
    }

    if (!resume) {
      errors.resume = "Please upload your resume in PDF format.";
    }

    if (!agreeTerms) {
      errors.terms = "You must agree to the data analysis terms before generating.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit() {
    if (!validateHomeForm()) {
      const firstErr =
        (!jobDescription.trim() && "Job description is required.") ||
        (!resume && "Please upload your resume (PDF).") ||
        (!agreeTerms && "Please agree to the data analysis terms.") ||
        "Please complete all required fields.";
      toast.error(firstErr);
      return;
    }

    try {
      const data = await creatInterviewreport({
        selfDescription,
        jobDescription: jobDescription.trim(),
        resume,
      });

      setSelfDescription("");
      setJobDescription("");
      setResume(null);
      setAgreeTerms(false);
      setFormErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(
        data?.message || "Interview strategy generated successfully!",
      );

      const reportId = data?.interviewReport?._id || data?.interviewReport?.id || data?._id;
      if (reportId) {
        navigate(`/interview-report/${reportId}`);
      } else {
        navigate("/interview-reports");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while generating the interview strategy.";
      toast.error(errorMsg);
    }
  }

  return (
    <div className="home">
      {/* SaaS Top Navigation */}
      <header className="page-nav">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-badge">TIQ</span>
          <span className="brand-name">Talent IQ</span>
        </Link>
        <div className="nav-actions">
          <button className="nav-btn primary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="nav-btn secondary" onClick={() => navigate("/interview-reports")}>
            My Reports
          </button>
          {user ? (
            <>
              <span className="user-chip">{user.userName || user.email || "User"}</span>
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
          ) : (
            <button className="nav-btn login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-content">
        {/* Header Section */}
        <div className="header">
          <div className="header-content">
            <span className="badge">AI-Powered Strategy</span>
            <h1>
              Create Your Custom <span className="highlight-text">Interview Plan</span>
            </h1>
            <p>
              Analyze your target role against your background to generate high-impact question clusters,
              strengths, and prioritized prep milestones.
            </p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="container">
          {/* Left Side - Job Description */}
          <div className="card job-section">
            <div className="section-header">
              <h2>Target Job Description</h2>
              <span className="header-hint">Required</span>
            </div>
            <p className="section-description">
              Paste the role requirements, responsibilities, and qualifications you are preparing for.
            </p>
            <div className="textarea-wrapper">
              <textarea
                placeholder="Paste the complete job description here..."
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (formErrors.jobDescription) {
                    setFormErrors((prev) => ({ ...prev, jobDescription: "" }));
                  }
                }}
                className={formErrors.jobDescription ? "has-error" : ""}
              />
              <span className="char-count">
                {jobDescription.length} characters
              </span>
            </div>
            {formErrors.jobDescription && (
              <p className="field-error-msg" role="alert">
                {formErrors.jobDescription}
              </p>
            )}
          </div>

          {/* Right Side - Your Profile */}
          <div className="card resume-section">
            <div className="section-header">
              <h2>Your Profile</h2>
              <span className="header-hint">Resume + Notes</span>
            </div>

            {/* Upload Resume */}
            <div className="upload-section">
              <label
                htmlFor="resumeUpload"
                className={`upload-box ${isDragging ? "dragging" : ""} ${resume ? "has-file" : ""} ${formErrors.resume ? "has-error" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="upload-text">
                  {resume ? (
                    <>
                      <strong>{resume?.name}</strong>
                      <span>Click or drag to replace PDF file</span>
                    </>
                  ) : (
                    <>
                      <strong>Upload Resume (PDF)</strong>
                      <span>Drag & drop your resume file or click to browse</span>
                    </>
                  )}
                </div>
              </label>
              <p className="upload-hint">Supported format: PDF only (up to 5MB)</p>
              {formErrors.resume && (
                <p className="field-error-msg" role="alert">
                  {formErrors.resume}
                </p>
              )}
              <input
                ref={fileInputRef}
                id="resumeUpload"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                hidden
              />
            </div>

            {/* Self Description */}
            <div className="self-description-enhanced">
              <div className="self-description-header">
                <div className="header-left">
                  <label htmlFor="self-description-input">Additional Context & Wins</label>
                  <span className="optional-badge">Optional</span>
                </div>
                <span className="character-tip">Min. 50 characters recommended</span>
              </div>

              <div className="self-description-container">
                <div className="input-wrapper">
                  <textarea
                    id="self-description-input"
                    placeholder="Highlight your standout achievements, metrics, transitions, or specific areas you want to emphasize..."
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
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className={`terms-box ${formErrors.terms ? "has-error" : ""}`}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (formErrors.terms) {
                      setFormErrors((prev) => ({ ...prev, terms: "" }));
                    }
                  }}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  I agree to share my target role and resume for AI-assisted interview analysis.
                </span>
              </label>
              {formErrors.terms && (
                <p className="field-error-msg" role="alert">
                  {formErrors.terms}
                </p>
              )}
            </div>

            <button
              className={`generate-btn ${agreeTerms ? "active" : ""}`}
              disabled={loading}
              onClick={handleSubmit}
            >
              <span>
                {loading
                  ? "Analyzing & Generating Strategy..."
                  : "Generate Interview Strategy"}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
