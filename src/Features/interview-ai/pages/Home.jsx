import React, { useState } from "react";
import "../pages/Home.scss";

const Home = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
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
      setFileName(file.name);
    }
  };

  return (
    <div className="home">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <span className="badge">AI-POWERED INTERVIEW PREP</span>
          <h1>
            Create Your Custom <span className="gradient-text">Interview Plan</span>
          </h1>
          <p>Let our AI analyze your job fit requirements & unique profile to build a winning strategy</p>
        </div>
      </div>

      <div className="container">
        {/* Left Side - Job Description */}
        <div className="card job-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            Paste the job description to help our AI understand the role you're targeting
          </p>
          <div className="textarea-wrapper">
            <textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <span className="char-count">{jobDescription.length} characters</span>
          </div>
        </div>

        {/* Right Side - Your Profile */}
        <div className="card resume-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              className={`upload-box ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                {fileName ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>
              <div className="upload-text">
                {fileName ? (
                  <>
                    <strong>{fileName}</strong>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Supported formats: PDF, DOCX (Max 5MB)
            </p>
            <input
              id="resumeUpload"
              type="file"
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                          backgroundColor: selfDescription.length >= 50 ? '#10b981' : '#f59e0b'
                        }}
                      ></div>
                    </div>
                    <span className={`counter-text ${selfDescription.length >= 50 ? 'sufficient' : 'insufficient'}`}>
                      {selfDescription.length} / 200 characters
                      {selfDescription.length >= 50 && ' ✓'}
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
                I agree to share my resume and data for analysis to generate a customized interview strategy
              </span>
            </label>
          </div>

          <button 
            className={`generate-btn ${agreeTerms ? 'active' : ''}`} 
            disabled={!agreeTerms}
          >
            <span>Generate My Interview Strategy</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;