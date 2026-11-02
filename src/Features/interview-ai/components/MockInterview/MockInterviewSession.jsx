// MockInterviewSession.jsx
import React, { useState, useEffect, useRef } from "react";
import "./MockInterview.scss";
import {
  generateMockQuestions,
  evaluateMockSession,
  getSavedMockSession,
  saveMockSession,
  clearSavedMockSession,
  speakQuestion,
  stopSpeaking,
  createSpeechRecognition,
  extractJdInsights,
} from "../../services/mockInterviewAi.service";

const MockInterviewSession = ({
  reportId,
  jobDescription,
  selfDescription,
  resume,
  existingTechQuestions = [],
  onFinishInterview,
}) => {
  // Session states
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [insights, setInsights] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize or restore session
  useEffect(() => {
    const jdInsights = extractJdInsights(jobDescription, resume, selfDescription);
    setInsights(jdInsights);

    const saved = getSavedMockSession(reportId);
    if (saved && saved.questions && saved.questions.length > 0) {
      setQuestions(saved.questions);
      setAnswers(saved.answers || {});
      setCurrentIndex(saved.currentIndex || 0);
      setElapsedSeconds(saved.elapsedSeconds || 0);
      setHasStarted(true);
      setIsTimerRunning(true);
    } else {
      const generated = generateMockQuestions(
        jobDescription,
        resume,
        selfDescription,
        existingTechQuestions
      );
      setQuestions(generated);
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reportId, jobDescription, resume, selfDescription, existingTechQuestions]);

  // Elapsed session timer
  useEffect(() => {
    if (isTimerRunning && hasStarted && !isEvaluating) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, hasStarted, isEvaluating]);

  // Auto-save session progress
  useEffect(() => {
    if (hasStarted && questions.length > 0) {
      saveMockSession(reportId, {
        questions,
        answers,
        currentIndex,
        elapsedSeconds,
      });
    }
  }, [answers, currentIndex, elapsedSeconds, hasStarted, questions, reportId]);

  // Helper format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const totalQuestions = questions.length || 16;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = Object.keys(answers).filter((id) => (answers[id] || "").trim().length > 10).length;

  // Start interview from setup screen
  const handleStartInterview = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  // Change answer text
  const handleAnswerChange = (val) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  // Audio Speech Recognition (Voice Input)
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    setSpeechError("");
    const recognition = createSpeechRecognition({
      onResult: (transcript) => {
        if (!currentQuestion) return;
        setAnswers((prev) => {
          const prevAnswer = prev[currentQuestion.id] || "";
          const separator = prevAnswer && !prevAnswer.endsWith(" ") ? " " : "";
          return {
            ...prev,
            [currentQuestion.id]: `${prevAnswer}${separator}${transcript}`.trimStart(),
          };
        });
      },
      onError: (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access denied. Please enable microphone permissions in your browser.");
        } else if (event.error === "no-speech") {
          // ignore silent pause
        } else {
          setSpeechError("Speech recognition error. You can continue typing directly.");
        }
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (!recognition) {
      setSpeechError("Voice input is not supported in this browser. Please use Google Chrome, Edge, or type directly.");
      return;
    }

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setSpeechError("Unable to access microphone. Please type your response.");
      setIsRecording(false);
    }
  };

  // Text-to-Speech (AI Voice)
  const toggleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!currentQuestion) return;
    setIsSpeaking(true);
    const result = speakQuestion(currentQuestion.question, () => {
      setIsSpeaking(false);
    });

    if (!result.supported) {
      setIsSpeaking(false);
    }
  };

  // Next / Previous Navigation
  const handleNext = () => {
    stopSpeaking();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpTo = (index) => {
    stopSpeaking();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setCurrentIndex(index);
  };

  // Populate sample response for testing/quick demonstration
  const handleInsertSampleAnswer = () => {
    if (!currentQuestion) return;
    const sample = currentQuestion.idealAnswer || "I approach this by structuring the problem into component responsibilities, identifying key performance bottlenecks, and prioritizing customer impact.";
    handleAnswerChange(sample);
  };

  // Submit interview and run AI evaluation pipeline
  const handleSubmitInterview = async () => {
    setShowConfirmModal(false);
    setIsEvaluating(true);
    setIsTimerRunning(false);
    stopSpeaking();

    // Evaluation animation steps
    setEvaluationStep(1);
    await new Promise((res) => setTimeout(res, 900));
    setEvaluationStep(2);
    await new Promise((res) => setTimeout(res, 900));
    setEvaluationStep(3);
    await new Promise((res) => setTimeout(res, 900));
    setEvaluationStep(4);
    await new Promise((res) => setTimeout(res, 600));

    const finalReport = evaluateMockSession({
      questions,
      answers,
      jobDescription,
      elapsedSeconds,
    });

    // Clear saved in-progress session after completion
    clearSavedMockSession(reportId);

    setIsEvaluating(false);
    if (onFinishInterview) {
      onFinishInterview(finalReport);
    }
  };

  // Reset interview session
  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to restart this mock interview? Existing answers will be cleared.")) {
      clearSavedMockSession(reportId);
      const generated = generateMockQuestions(jobDescription, resume, selfDescription, existingTechQuestions);
      setQuestions(generated);
      setAnswers({});
      setCurrentIndex(0);
      setElapsedSeconds(0);
      setHasStarted(false);
      setIsTimerRunning(false);
      stopSpeaking();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. EVALUATION LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (isEvaluating) {
    return (
      <div className="mock-evaluating-card">
        <div className="eval-spinner">
          <svg className="spinner-ring" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        </div>
        <h3>AI Interview Evaluator at Work</h3>
        <p className="eval-subtitle">
          Benchmarking your responses against the target role requirements, technical depth, and scenario trade-offs.
        </p>
        <div className="eval-steps">
          <div className={`eval-step ${evaluationStep >= 1 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Analyzing Technical Mastery & Core Architecture</span>
          </div>
          <div className={`eval-step ${evaluationStep >= 2 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Evaluating Real-World Problem Solving & Decision Making</span>
          </div>
          <div className={`eval-step ${evaluationStep >= 3 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Scoring Communication Clarity & STAR Structure</span>
          </div>
          <div className={`eval-step ${evaluationStep >= 4 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Synthesizing Tailored Preparation Feedback & Recommendations</span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SETUP / BRIEFING SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="mock-intro-card">
        <div className="mock-intro-header">
          <div className="mock-badge">
            <span className="sparkle-icon" aria-hidden="true">✦</span>
            Interactive AI Interview Simulator
          </div>
          <h2>Dynamic AI Mock Interview</h2>
          <p>
            Engage in a realistic 1-on-1 simulated interview customized specifically for your target role.
            Answer 16 targeted questions covering both low-level technical concepts and real-world production scenarios.
          </p>
        </div>

        <div className="mock-brief-grid">
          <div className="brief-item">
            <div className="brief-icon">🎯</div>
            <div className="brief-details">
              <h4>Role Target</h4>
              <p>{insights?.seniority || "Senior"} {insights?.roleDomain || "Software Engineer"}</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-icon">📋</div>
            <div className="brief-details">
              <h4>Interview Structure</h4>
              <p>16 Questions (8 Technical Concepts + 8 Real-World Scenarios)</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-icon">🎙️</div>
            <div className="brief-details">
              <h4>Response Options</h4>
              <p>Type in text or use live voice dictation (speech-to-text)</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-icon">📊</div>
            <div className="brief-details">
              <h4>Instant Analysis</h4>
              <p>Score breakdown, strengths, skill gaps, and model benchmark answers</p>
            </div>
          </div>
        </div>

        <div className="tech-tags-bar">
          <span className="tags-label">Detected Role Competencies:</span>
          <div className="tags-list">
            {(insights?.detectedTech || []).slice(0, 8).map((t, idx) => (
              <span key={idx} className="tech-tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mock-tips-box">
          <h4>💡 Pro Tips for Success:</h4>
          <ul>
            <li>
              <strong>For Technical Concepts:</strong> Articulate the internal mechanics, memory/runtime trade-offs, and failure points.
            </li>
            <li>
              <strong>For Scenario Problems:</strong> Apply the <strong>STAR</strong> method (Situation, Task, Action, Result) with tangible decisions.
            </li>
            <li>
              You can listen to questions read aloud with the <strong>Listen to Question</strong> button, and dictate answers via the microphone button.
            </li>
          </ul>
        </div>

        <div className="mock-intro-actions">
          <button className="start-mock-btn" onClick={handleStartInterview}>
            Start Mock Interview
            <span className="btn-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ACTIVE INTERVIEW SESSION SCREEN
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="mock-session-container">
      {/* Top Session Progress Bar & Meta */}
      <div className="mock-session-header">
        <div className="progress-info">
          <div className="progress-title-row">
            <span className="question-count">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="progress-percent">{progressPercent}% Completed</span>
            <span className="answered-badge">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>
          <div className="session-progress-bar">
            <div
              className="session-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="session-meta-controls">
          <div className="timer-badge">
            <span className="timer-icon" aria-hidden="true">⏱</span>
            <span className="timer-val">{formatTime(elapsedSeconds)}</span>
          </div>
          <button
            className="session-btn reset-btn"
            title="Reset and start over"
            onClick={handleResetSession}
          >
            Restart
          </button>
        </div>
      </div>

      {/* Question Selector Ribbon */}
      <div className="question-ribbon" role="tablist" aria-label="Question Navigator">
        {questions.map((q, idx) => {
          const isAnswered = (answers[q.id] || "").trim().length > 10;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              role="tab"
              aria-selected={isCurrent}
              className={`ribbon-item ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`}
              onClick={() => handleJumpTo(idx)}
              title={`Question ${idx + 1}: ${q.category}`}
            >
              <span className="ribbon-num">{idx + 1}</span>
              {isAnswered && <span className="ribbon-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="mock-question-card">
          <div className="mock-card-header">
            <div className="header-tags">
              <span className="question-num-pill">Q{currentIndex + 1}</span>
              <span className={`type-pill ${currentQuestion.type}`}>
                {currentQuestion.typeLabel}
              </span>
              <span className="category-pill">{currentQuestion.category}</span>
              <span className="difficulty-pill">{currentQuestion.difficulty}</span>
            </div>

            <button
              className={`audio-btn ${isSpeaking ? "playing" : ""}`}
              onClick={toggleSpeakQuestion}
              title={isSpeaking ? "Stop listening" : "Listen to question"}
            >
              <span className="audio-icon" aria-hidden="true">
                {isSpeaking ? "⏹ Stop Voice" : "🔊 Listen to Question"}
              </span>
            </button>
          </div>

          <div className="question-body">
            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="interviewer-context">
              <span className="context-label">Interviewer Intention:</span>
              <p>{currentQuestion.intention}</p>
            </div>
          </div>

          {/* User Answer Response Workspace */}
          <div className="response-workspace">
            <div className="response-toolbar">
              <label htmlFor="mock-answer-input" className="response-label">
                Your Response:
              </label>

              <div className="toolbar-actions">
                {/* Voice Dictation (Mic) Button */}
                <button
                  type="button"
                  className={`voice-record-btn ${isRecording ? "recording" : ""}`}
                  onClick={toggleRecording}
                  title={isRecording ? "Stop voice dictation" : "Dictate answer with microphone"}
                >
                  <span className="mic-icon" aria-hidden="true">🎙</span>
                  <span>{isRecording ? "Listening (Stop)..." : "Voice Dictate"}</span>
                </button>

                {/* Sample answer quick-fill for demo/testing */}
                <button
                  type="button"
                  className="sample-answer-btn"
                  onClick={handleInsertSampleAnswer}
                  title="Insert benchmark sample answer for reference"
                >
                  💡 Sample Answer
                </button>

                <span className="word-count">
                  {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                </span>
              </div>
            </div>

            {/* Live recording waveform banner */}
            {isRecording && (
              <div className="live-speech-indicator">
                <span className="pulse-dot" />
                <span className="pulse-text">Microphone active — Speak clearly into your mic...</span>
              </div>
            )}

            {speechError && <div className="speech-error-banner">{speechError}</div>}

            <textarea
              id="mock-answer-input"
              ref={textareaRef}
              className="answer-textarea"
              placeholder={
                currentQuestion.type === "scenario"
                  ? "Type or dictate your answer using the STAR method: Describe the Situation, the Task at hand, the Actions you took, and the measurable Result..."
                  : "Type or dictate your answer: Explain core technical mechanics, architectural trade-offs, edge-cases, and optimization considerations..."
              }
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={7}
            />

            <div className="key-points-hint">
              <span className="hint-label">Evaluation Criteria:</span>
              <ul className="criteria-list">
                {currentQuestion.keyEvaluationPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Navigation & Submission */}
          <div className="mock-card-footer">
            <div className="footer-left">
              <button
                type="button"
                className="nav-control-btn prev-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                ← Previous
              </button>
            </div>

            <div className="footer-right">
              <button
                type="button"
                className="nav-control-btn skip-btn"
                onClick={handleNext}
              >
                Skip Question
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  className="nav-control-btn next-btn"
                  onClick={handleNext}
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="nav-control-btn submit-btn"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Complete & Generate Report 🏆
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="mock-modal-overlay">
          <div className="mock-modal">
            <h3>Finish Mock Interview?</h3>
            <p>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{totalQuestions}</strong> questions in {formatTime(elapsedSeconds)}.
            </p>
            {answeredCount < totalQuestions && (
              <p className="modal-warning">
                You have {totalQuestions - answeredCount} unanswered or brief questions. You can go back and fill them or proceed to generate your comprehensive performance report now.
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Continue Answering
              </button>
              <button
                type="button"
                className="modal-btn primary"
                onClick={handleSubmitInterview}
              >
                Submit & Analyze Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewSession;
