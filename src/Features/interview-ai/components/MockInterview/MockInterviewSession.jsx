// MockInterviewSession.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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

const QUESTION_TIME_LIMIT = 30; // 30-second strict countdown per question

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
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [interimSpeech, setInterimSpeech] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeoutAlert, setTimeoutAlert] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [insights, setInsights] = useState(null);

  const recognitionRef = useRef(null);
  const totalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const baseVoiceTextRef = useRef("");

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
      setQuestionTimeLeft(QUESTION_TIME_LIMIT);
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
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [reportId, jobDescription, resume, selfDescription, existingTechQuestions]);

  // Overall session elapsed time tracker
  useEffect(() => {
    if (hasStarted && !isEvaluating) {
      totalTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [hasStarted, isEvaluating]);

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

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const totalQuestions = questions.length || 16;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = Object.keys(answers).filter((id) => (answers[id] || "").trim().length > 0).length;

  // Format seconds into MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Submit interview and run AI evaluation pipeline
  const handleSubmitInterview = useCallback(async () => {
    setShowConfirmModal(false);
    setIsEvaluating(true);
    stopSpeaking();
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    setEvaluationStep(1);
    await new Promise((res) => setTimeout(res, 800));
    setEvaluationStep(2);
    await new Promise((res) => setTimeout(res, 800));
    setEvaluationStep(3);
    await new Promise((res) => setTimeout(res, 800));
    setEvaluationStep(4);
    await new Promise((res) => setTimeout(res, 600));

    const finalReport = evaluateMockSession({
      questions,
      answers,
      jobDescription,
      elapsedSeconds,
    });

    clearSavedMockSession(reportId);
    setIsEvaluating(false);

    if (onFinishInterview) {
      onFinishInterview(finalReport);
    }
  }, [answers, elapsedSeconds, jobDescription, onFinishInterview, questions, reportId]);

  // Progression handler for advancing to next question (manual Next, Skip, or Auto-Timeout)
  const advanceToNext = useCallback(
    (reason = "next") => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      setInterimSpeech("");

      if (reason === "timeout") {
        setTimeoutAlert(`Time expired for Q${currentIndex + 1}. Auto-advancing.`);
        setTimeout(() => setTimeoutAlert(""), 3500);
      }

      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setQuestionTimeLeft(QUESTION_TIME_LIMIT);
      } else {
        // Last question reached
        handleSubmitInterview();
      }
    },
    [currentIndex, totalQuestions, handleSubmitInterview]
  );

  // 30-Second Strict Countdown Timer per Question
  useEffect(() => {
    if (!hasStarted || isEvaluating) return;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentIndex, hasStarted, isEvaluating]);

  // Trigger auto-timeout when question timer hits 0
  useEffect(() => {
    if (questionTimeLeft === 0 && hasStarted && !isEvaluating) {
      advanceToNext("timeout");
    }
  }, [questionTimeLeft, hasStarted, isEvaluating, advanceToNext]);

  // Start interview from setup screen
  const handleStartInterview = () => {
    setHasStarted(true);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
  };

  // Change answer text
  const handleAnswerChange = (val) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  // Speech-to-Text Recognition with strict deduplication
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
      setInterimSpeech("");
      return;
    }

    setSpeechError("");
    baseVoiceTextRef.current = currentAnswer;

    const recognition = createSpeechRecognition({
      onResult: ({ finalText, interimText }) => {
        if (!currentQuestion) return;
        setInterimSpeech(interimText);

        const base = baseVoiceTextRef.current.trim();
        const finalTrimmed = finalText.trim();
        const combined = base
          ? finalTrimmed
            ? `${base} ${finalTrimmed}`
            : base
          : finalTrimmed;

        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: combined,
        }));
      },
      onError: (event) => {
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== "no-speech") {
          setSpeechError("Speech recognition issue. You can continue typing directly.");
        }
        setIsRecording(false);
        setInterimSpeech("");
      },
      onEnd: () => {
        setIsRecording(false);
        setInterimSpeech("");
      },
    });

    if (!recognition) {
      setSpeechError("Voice input is not supported in this browser. Please type directly.");
      return;
    }

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      setSpeechError("Unable to initialize microphone. Please type your answer.");
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

  // Manual Skip
  const handleSkip = () => {
    advanceToNext("skip");
  };

  // Manual Next (Strict Validation: only allowed if input is non-empty)
  const handleManualNext = () => {
    if (!currentAnswer.trim()) return; // Disallow manual submit of empty text
    advanceToNext("next");
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
      setQuestionTimeLeft(QUESTION_TIME_LIMIT);
      setHasStarted(false);
      stopSpeaking();
    }
  };

  // Timer urgency helpers
  const isTimerCritical = questionTimeLeft <= 5;
  const isTimerWarning = questionTimeLeft <= 10 && !isTimerCritical;

  // ─────────────────────────────────────────────────────────────
  // 1. EVALUATION SCREEN
  // ─────────────────────────────────────────────────────────────
  if (isEvaluating) {
    return (
      <div className="mock-evaluating-card">
        <div className="eval-spinner">
          <svg className="spinner-ring" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        </div>
        <h3>AI Interview Evaluator Processing</h3>
        <p className="eval-subtitle">
          Executing strict semantic evaluation of your answers against role expectations and technical benchmarks.
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
            <span>Scoring Accuracy, Relevance & Response Structure</span>
          </div>
          <div className={`eval-step ${evaluationStep >= 4 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Compiling Performance Preparation Report</span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SETUP SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="mock-intro-card">
        <div className="mock-intro-header">
          <div className="mock-badge">Dynamic AI Mock Interview</div>
          <h2>Role-Specific Mock Interview Simulation</h2>
          <p>
            Engage in a structured simulation tailored to your target job description. Each question has a strict{" "}
            <strong>30-second countdown</strong> to evaluate your rapid technical articulation under realistic interview pacing.
          </p>
        </div>

        <div className="mock-brief-grid">
          <div className="brief-item">
            <div className="brief-details">
              <h4>Role Target</h4>
              <p>{insights?.seniority || "Senior"} {insights?.roleDomain || "Software Engineer"}</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Structure</h4>
              <p>16 Questions (8 Technical Concepts + 8 Real-World Scenarios)</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>30-Second Limit</h4>
              <p>Auto-advances if unanswered when the countdown timer reaches 00:00</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Strict Scoring</h4>
              <p>Zero default marks; graded strictly against technical relevance and STAR structure</p>
            </div>
          </div>
        </div>

        <div className="tech-tags-bar">
          <span className="tags-label">Target Competencies:</span>
          <div className="tags-list">
            {(insights?.detectedTech || []).slice(0, 8).map((t, idx) => (
              <span key={idx} className="tech-tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mock-tips-box">
          <h4>Interview Rules & Pacing:</h4>
          <ul>
            <li>
              <strong>30s Countdown:</strong> Manage your time. If 30 seconds expire, the system automatically saves your answer and advances.
            </li>
            <li>
              <strong>Input Validation:</strong> Manual "Next" is disabled while the response is empty. Click "Skip Question" to bypass.
            </li>
            <li>
              <strong>Strict Evaluation:</strong> Empty or filler responses receive zero points. Marks are awarded strictly on technical accuracy.
            </li>
          </ul>
        </div>

        <div className="mock-intro-actions">
          <button className="start-mock-btn" onClick={handleStartInterview}>
            Start Mock Interview
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
      {/* Timeout Alert Notification */}
      {timeoutAlert && (
        <div className="timeout-toast-banner" role="alert">
          <span className="toast-dot" />
          <span>{timeoutAlert}</span>
        </div>
      )}

      {/* Top Header Bar */}
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
          {/* Strict 30-Second Countdown Clock */}
          <div
            className={`question-countdown-badge ${isTimerCritical ? "critical" : isTimerWarning ? "warning" : ""}`}
            title="Question time remaining (30s limit)"
          >
            <span className="countdown-ring-icon" aria-hidden="true" />
            <span className="countdown-label">Time Remaining:</span>
            <span className="countdown-val">00:{String(questionTimeLeft).padStart(2, "0")}</span>
          </div>

          <div className="timer-badge" title="Total Session Elapsed Time">
            <span className="timer-label">Total:</span>
            <span className="timer-val">{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            className="session-btn reset-btn"
            title="Restart interview from Question 1"
            onClick={handleResetSession}
          >
            Restart
          </button>
        </div>
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

            <div className="header-right-controls">
              <button
                className={`audio-btn ${isSpeaking ? "playing" : ""}`}
                onClick={toggleSpeakQuestion}
                title={isSpeaking ? "Stop voice" : "Listen to question"}
              >
                {isSpeaking ? "Stop Audio" : "Listen"}
              </button>
            </div>
          </div>

          <div className="question-body">
            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="interviewer-context">
              <span className="context-label">Interviewer Focus:</span>
              <p>{currentQuestion.intention}</p>
            </div>
          </div>

          {/* User Answer Response Workspace */}
          <div className="response-workspace">
            <div className="response-toolbar">
              <label htmlFor="mock-answer-input" className="response-label">
                Your Answer (30s limit):
              </label>

              <div className="toolbar-actions">
                <button
                  type="button"
                  className={`voice-record-btn ${isRecording ? "recording" : ""}`}
                  onClick={toggleRecording}
                  title={isRecording ? "Stop voice recognition" : "Dictate response via microphone"}
                >
                  <span className="record-dot" />
                  <span>{isRecording ? "Listening..." : "Dictate Voice"}</span>
                </button>

                <span className="word-count">
                  {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                </span>
              </div>
            </div>

            {/* Live speech feedback & deduplication preview */}
            {isRecording && (
              <div className="live-speech-indicator">
                <span className="pulse-dot" />
                <span className="pulse-text">
                  {interimSpeech ? `Transcribing: "${interimSpeech}"` : "Microphone active — Speak your answer..."}
                </span>
              </div>
            )}

            {speechError && <div className="speech-error-banner">{speechError}</div>}

            <textarea
              id="mock-answer-input"
              className="answer-textarea"
              placeholder={
                currentQuestion.type === "scenario"
                  ? "Describe your approach: Situation, Task, Action taken, and final Result within 30 seconds..."
                  : "Explain core technical mechanisms, architecture trade-offs, and performance implications..."
              }
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={6}
            />

            <div className="key-points-hint">
              <span className="hint-label">Evaluated On:</span>
              <ul className="criteria-list">
                {currentQuestion.keyEvaluationPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mock-card-footer">
            <div className="footer-left">
              {/* Urgency Alert on final 5 seconds */}
              {isTimerCritical && (
                <span className="critical-warning-text">
                  Auto-submitting in {questionTimeLeft}s...
                </span>
              )}
            </div>

            <div className="footer-right">
              {/* Skip Question (Always allowed without input) */}
              <button
                type="button"
                className="nav-control-btn skip-btn"
                onClick={handleSkip}
                title="Bypass this question (0 marks awarded)"
              >
                Skip Question
              </button>

              {/* Next Button: STRICTLY DISABLED when textarea is empty */}
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  className="nav-control-btn next-btn"
                  onClick={handleManualNext}
                  disabled={!currentAnswer.trim()}
                  title={
                    !currentAnswer.trim()
                      ? "Enter an answer to proceed, or click Skip Question"
                      : "Save answer and proceed to next question"
                  }
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="nav-control-btn submit-btn"
                  onClick={handleManualNext}
                  disabled={!currentAnswer.trim()}
                  title={
                    !currentAnswer.trim()
                      ? "Enter an answer to submit, or click Skip Question"
                      : "Complete mock interview and generate report"
                  }
                >
                  Submit Interview
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
            <h3>Complete Mock Interview?</h3>
            <p>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{totalQuestions}</strong> questions in {formatTime(elapsedSeconds)}.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Resume
              </button>
              <button
                type="button"
                className="modal-btn primary"
                onClick={handleSubmitInterview}
              >
                Generate Preparation Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewSession;
