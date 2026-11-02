// MockInterviewReportView.jsx
import React from "react";
import "./MockInterview.scss";

const MockInterviewReportView = ({ report, onRetakeInterview, onGoToInterview }) => {
  if (!report) {
    return (
      <div className="mock-empty-report">
        <div className="empty-report-card">
          <div className="empty-icon" aria-hidden="true">📋</div>
          <h3>No Preparation Report Generated Yet</h3>
          <p>
            Take the AI-powered mock interview to practice 16 targeted questions tailored to your job description.
            Your answers will be evaluated to generate a comprehensive preparation report with personalized feedback and benchmark answers.
          </p>
          <button className="action-btn" onClick={onGoToInterview}>
            Start Mock Interview
          </button>
        </div>
      </div>
    );
  }

  const {
    overallScore = 0,
    technicalScore = 0,
    scenarioScore = 0,
    communicationScore = 0,
    accuracyScore = 0,
    confidenceLevel = "Moderate",
    readinessVerdict = "Strong Fit",
    verdictSummary = "",
    answeredCount = 0,
    totalQuestions = 16,
    elapsedSeconds = 0,
    technicalStrengths = [],
    areasForImprovement = [],
    questionEvaluations = [],
    categoryBreakdown = [],
    createdAt,
  } = report;

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
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

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mock-report-container">
      {/* ─────────────────────────────────────────────────────────────
          PRINTABLE DOCUMENT HEADER (Visible only in PDF / Print Media)
      ───────────────────────────────────────────────────────────── */}
      <div className="print-document-header" aria-hidden="true">
        <div className="doc-brand">
          <span className="brand-badge-print">TIQ</span>
          <div className="doc-title-block">
            <h1>Talent IQ Candidate Preparation Report</h1>
            <p>Confidential Simulated Interview Assessment & Technical Benchmarking</p>
          </div>
        </div>
        <div className="doc-meta-bar">
          <div className="meta-item">
            <span className="lbl">Evaluation Date:</span>
            <span className="val">{formattedDate}</span>
          </div>
          <div className="meta-item">
            <span className="lbl">Overall Readiness:</span>
            <span className="val">{overallScore}% ({readinessVerdict})</span>
          </div>
          <div className="meta-item">
            <span className="lbl">Confidence Metric:</span>
            <span className="val">{confidenceLevel}</span>
          </div>
          <div className="meta-item">
            <span className="lbl">Pacing:</span>
            <span className="val">30s Countdown / Prompt</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ON-SCREEN 3D ELEVATED SCORE CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="score-card mock-score-card">
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
              stroke={getScoreColor(overallScore)}
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
              style={{
                strokeDasharray: `${2 * Math.PI * 50}`,
                strokeDashoffset: `${2 * Math.PI * 50 * (1 - overallScore / 100)}`,
              }}
            />
          </svg>
          <div className="score-number">
            <span className="value">{overallScore}%</span>
            <span className="label">Performance</span>
          </div>
        </div>

        <div className="score-details">
          <div className="score-heading-row">
            <h3>Interview Performance & Readiness Assessment</h3>
            <span
              className="score-pill"
              style={{
                color: getScoreColor(overallScore),
                borderColor: `${getScoreColor(overallScore)}40`,
                background: `${getScoreColor(overallScore)}15`,
              }}
            >
              {readinessVerdict}
            </span>
          </div>
          <p>{verdictSummary}</p>

          <div className="score-stats">
            <div className="stat-item">
              <span className="stat-val">{technicalScore}%</span>
              <span className="stat-lbl">Technical Depth</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{scenarioScore}%</span>
              <span className="stat-lbl">Scenario Solving</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{communicationScore}%</span>
              <span className="stat-lbl">Communication</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{accuracyScore}%</span>
              <span className="stat-lbl">Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{confidenceLevel}</span>
              <span className="stat-lbl">Confidence</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{answeredCount}/{totalQuestions}</span>
              <span className="stat-lbl">Substantive Answers</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{formatDuration(elapsedSeconds)}</span>
              <span className="stat-lbl">Session Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPETENCY BREAKDOWN GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="mock-breakdown-section">
        <h3 className="section-title">Competency Evaluation Breakdown</h3>
        <div className="breakdown-grid">
          {categoryBreakdown.map((cat, idx) => {
            const color = getScoreColor(cat.score);
            return (
              <div key={idx} className="breakdown-card">
                <div className="card-top">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-score" style={{ color }}>
                    {cat.score}%
                  </span>
                </div>
                <div className="cat-progress-track">
                  <div
                    className="cat-progress-fill"
                    style={{ width: `${cat.score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STRENGTHS & IMPROVEMENT GAPS
      ───────────────────────────────────────────────────────────── */}
      <div className="strengths-gaps-grid">
        {/* Technical Strengths */}
        <div className="info-card strengths-card">
          <div className="card-header">
            <h3>Demonstrated Technical Strengths</h3>
          </div>
          <div className="card-content">
            <div className="strengths-list">
              {technicalStrengths.map((item, idx) => (
                <div key={idx} className="strength-item">
                  <div className="strength-bullet" aria-hidden="true">✓</div>
                  <div className="strength-body">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Areas for Improvement */}
        <div className="info-card gaps-card">
          <div className="card-header">
            <h3>Priority Areas for Improvement</h3>
          </div>
          <div className="card-content">
            <div className="gaps-list">
              {areasForImprovement.map((gap, idx) => {
                const color = getSeverityColor(gap.severity);
                return (
                  <div key={idx} className="gap-item-block">
                    <div className="gap-top-row">
                      <span className="gap-skill-name">{gap.skill}</span>
                      <span
                        className="gap-severity-pill"
                        style={{
                          color,
                          borderColor: `${color}40`,
                          backgroundColor: `${color}15`,
                        }}
                      >
                        {gap.severity?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="gap-desc">{gap.suggestion}</p>
                    <div className="gap-progress-bar">
                      <div
                        className="gap-progress-fill"
                        style={{
                          width:
                            gap.severity === "high"
                              ? "35%"
                              : gap.severity === "medium"
                              ? "65%"
                              : "90%",
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DETAILED QUESTION-BY-QUESTION ASSESSMENT
      ───────────────────────────────────────────────────────────── */}
      <div className="detailed-questions-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Question-by-Question Detailed Assessment</h3>
            <p className="section-subtitle">
              Strict evaluation of recorded answers against criteria, technical intention, and benchmark models.
            </p>
          </div>
          <div className="report-action-buttons">
            <button
              type="button"
              className="action-btn download-pdf-btn"
              onClick={() => window.print()}
              title="Export formatted PDF document"
            >
              Print & Download PDF
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={onRetakeInterview}
            >
              Retake Interview
            </button>
          </div>
        </div>

        <div className="questions-tab">
          {questionEvaluations.map((item, index) => {
            const scoreColor = getScoreColor(item.score);
            const isZero = item.score === 0;

            return (
              <div className="question-card mock-eval-card" key={item.id || index}>
                <div className="question-header">
                  <div className="header-left">
                    <span className="question-number">Q{item.number}</span>
                    <span className={`type-tag ${item.type}`}>{item.typeLabel}</span>
                    <span className="cat-tag">{item.category}</span>
                  </div>
                  <div className="header-right">
                    <span
                      className="score-pill"
                      style={{
                        color: scoreColor,
                        borderColor: `${scoreColor}40`,
                        background: `${scoreColor}15`,
                      }}
                    >
                      {isZero ? "Score: 0/100 (Unanswered / Inadequate)" : `Score: ${item.score}/100`}
                    </span>
                  </div>
                </div>

                <div className="question-title-area">
                  <h3>{item.question}</h3>
                  <div className="intention">
                    <span className="label">Interviewer Intention:</span>
                    <p>{item.intention}</p>
                  </div>
                </div>

                <div className="question-details">
                  {/* Candidate Answer */}
                  <div className={`candidate-answer-block ${isZero ? "zero-answer" : ""}`}>
                    <div className="block-label-row">
                      <span className="label">Your Submitted Response</span>
                      <span className="answer-stats">{item.wordCount} words</span>
                    </div>
                    <div className="user-response-text">
                      {item.candidateAnswer}
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="ai-feedback-block">
                    <span className="label feedback-label">AI Evaluator Feedback:</span>
                    <div className="feedback-columns">
                      <div className="feedback-col strengths-col">
                        <h5>Demonstrated Strengths:</h5>
                        <ul>
                          {item.strengths.length > 0 ? (
                            item.strengths.map((s, i) => <li key={i}>{s}</li>)
                          ) : (
                            <li className="muted-li">No substantive technical points demonstrated.</li>
                          )}
                        </ul>
                      </div>
                      <div className="feedback-col gaps-col">
                        <h5>Areas to Enhance:</h5>
                        <ul>
                          {item.areasForImprovement.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Ideal Answer */}
                  <div className="answer">
                    <span className="label">Recommended Benchmark Answer & Key Takeaway:</span>
                    <p>{item.idealAnswer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED CLEAN ACTION FOOTER AT THE END
      ───────────────────────────────────────────────────────────── */}
      <div className="mock-report-footer">
        <button
          type="button"
          className="secondary-btn retake-btn"
          onClick={onRetakeInterview}
        >
          Retake Mock Interview
        </button>
        <button
          type="button"
          className="action-btn download-pdf-btn"
          onClick={() => window.print()}
          title="Print or export complete report to A4 PDF document"
        >
          Print & Download PDF
        </button>
      </div>
    </div>
  );
};

export default MockInterviewReportView;
