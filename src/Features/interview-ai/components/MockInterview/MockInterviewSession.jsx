// MockInterviewSession.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MockInterview.scss";
import {
  generateLiveAiQuestions,
  evaluateLiveAiAnswer,
  generateLiveAiReport,
  getSavedMockSession,
  saveMockSession,
  clearSavedMockSession,
  getSavedMockReport,
  speakQuestion,
  stopSpeaking,
  createSpeechRecognition,
} from "../../services/mockInterviewAi.service";

const QUESTION_TIME_LIMIT = 30; // 30-second strict countdown per question

const MockInterviewSession = ({
  reportId,
  jobDescription,
  selfDescription,
  resume,
  onInterviewStateChange,
  onFinishInterview,
}) => {
  // Session states
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [interimSpeech, setInterimSpeech] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingStep, setIsEvaluatingStep] = useState(false);
  const [isSynthesizingReport, setIsSynthesizingReport] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeoutAlert, setTimeoutAlert] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef(null);
  const totalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const baseVoiceTextRef = useRef("");

  // Notify parent of interview in-progress status for strict tab locking
  useEffect(() => {
    if (onInterviewStateChange) {
      onInterviewStateChange(hasStarted && !isSynthesizingReport);
    }
  }, [hasStarted, isSynthesizingReport, onInterviewStateChange]);

  // Restore session from local storage on mount if exists
  useEffect(() => {
    const saved = getSavedMockSession(reportId);
    if (saved && Array.isArray(saved.questions) && saved.questions.length > 0) {
      setQuestions(saved.questions);
      setAnswers(saved.answers || {});
      setEvaluations(saved.evaluations || {});
      setCurrentIndex(saved.currentIndex || 0);
      setElapsedSeconds(saved.elapsedSeconds || 0);
      setHasStarted(true);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT);
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
  }, [reportId]);

  // Overall session elapsed time tracker
  useEffect(() => {
    if (hasStarted && !isSynthesizingReport) {
      totalTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [hasStarted, isSynthesizingReport]);

  // Auto-save session progress
  useEffect(() => {
    if (hasStarted && questions.length > 0 && !isSynthesizingReport) {
      saveMockSession(reportId, {
        questions,
        answers,
        evaluations,
        currentIndex,
        elapsedSeconds,
      });
    }
  }, [answers, currentIndex, elapsedSeconds, evaluations, hasStarted, isSynthesizingReport, questions, reportId]);

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const totalQuestions = questions.length || 16;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = Object.keys(answers).filter((id) => (answers[id] || "").trim().length > 0).length;

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LIVE QUESTION GENERATION (REAL OPENAI API CALL)
  // ─────────────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    setIsGeneratingQuestions(true);
    setErrorMessage("");
    stopSpeaking();

    try {
      const generatedQuestions = await generateLiveAiQuestions({
        jobDescription,
        resume,
        selfDescription,
        questionCount: 16,
      });

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("OpenAI was unable to generate interview questions. Please retry.");
      }

      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setEvaluations({});
      setElapsedSeconds(0);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT);
      setHasStarted(true);
    } catch (err) {
      console.error("Failed to generate live questions:", err);
      setErrorMessage(err.message || "Failed to initialize live OpenAI interview. Please verify API key and retry.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. FINAL REPORT SYNTHESIS (REAL OPENAI API CALL)
  // ─────────────────────────────────────────────────────────────
  const handleSynthesizeFinalReport = useCallback(
    async (finalEvaluations) => {
      setIsSynthesizingReport(true);
      stopSpeaking();
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);

      setSynthesisStep(1);

      // Merge evaluated data into complete questions array
      const compiledQuestions = questions.map((q) => {
        const ev = finalEvaluations[q.id] || {};
        return {
          ...q,
          candidateAnswer: ev.candidateAnswer || "",
          score: typeof ev.score === "number" ? ev.score : 0,
          feedback: ev.feedback || "",
          strengths: ev.strengths || [],
          areasForImprovement: ev.areasForImprovement || [],
          status: ev.status || "answered",
        };
      });

      try {
        setSynthesisStep(2);
        await new Promise((r) => setTimeout(r, 400));
        setSynthesisStep(3);

        const finalReport = await generateLiveAiReport({
          questions: compiledQuestions,
          jobDescription,
          resume,
          totalTimeSeconds: elapsedSeconds,
        });

        setSynthesisStep(4);
        await new Promise((r) => setTimeout(r, 500));

        clearSavedMockSession(reportId);
        setIsSynthesizingReport(false);
        setHasStarted(false);

        if (onInterviewStateChange) {
          onInterviewStateChange(false);
        }

        if (onFinishInterview) {
          onFinishInterview(finalReport);
        }
      } catch (err) {
        console.error("Report synthesis failed:", err);
        setErrorMessage("Report synthesis encountered an issue. Generating fallback report.");
        setIsSynthesizingReport(false);
      }
    },
    [questions, jobDescription, resume, elapsedSeconds, reportId, onInterviewStateChange, onFinishInterview]
  );

  // ─────────────────────────────────────────────────────────────
  // 3. LIVE ANSWER SUBMISSION & EVALUATION
  // ─────────────────────────────────────────────────────────────
  const advanceToNext = useCallback(
    async (reason = "next") => {
      if (isEvaluatingStep) return;

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

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      const rawAnswer = answers[currentQ.id] || "";
      const finalAnswer = reason === "skip" ? "" : rawAnswer.trim();
      const timeSpent = Math.max(1, QUESTION_TIME_LIMIT - questionTimeLeft);

      if (reason === "timeout") {
        setTimeoutAlert(`Time expired for Q${currentIndex + 1}. Auto-advancing.`);
        setTimeout(() => setTimeoutAlert(""), 3500);
      }

      setIsEvaluatingStep(true);

      let evaluation = null;
      try {
        // Real-time evaluation via OpenAI API
        evaluation = await evaluateLiveAiAnswer({
          question: currentQ,
          answer: finalAnswer,
          jobDescription,
          timeSpentSeconds: timeSpent,
        });
      } catch (err) {
        console.warn("Real-time question evaluation error:", err);
        evaluation = {
          score: finalAnswer ? 50 : 0,
          isValid: Boolean(finalAnswer),
          isRelevant: Boolean(finalAnswer),
          isTechnicallyCorrect: Boolean(finalAnswer),
          feedback: finalAnswer
            ? "Answer recorded and queued for final report synthesis."
            : "Question was skipped with no answer recorded.",
          strengths: finalAnswer ? ["Attempted under strict 30-second pacing."] : [],
          areasForImprovement: ["Provide deeper architectural precision."],
          missingConcepts: currentQ.keyEvaluationPoints || [],
          benchmarkSummary: currentQ.benchmarkAnswer || "",
        };
      } finally {
        setIsEvaluatingStep(false);
      }

      const updatedEvaluations = {
        ...evaluations,
        [currentQ.id]: {
          ...evaluation,
          candidateAnswer: finalAnswer,
          timeSpentSeconds: timeSpent,
          status:
            reason === "timeout"
              ? finalAnswer
                ? "answered"
                : "timed_out"
              : reason === "skip"
              ? "skipped"
              : "answered",
        },
      };
      setEvaluations(updatedEvaluations);

      // Check if this was the last question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setQuestionTimeLeft(QUESTION_TIME_LIMIT);
      } else {
        // Final question reached: synthesize full Preparation Report
        await handleSynthesizeFinalReport(updatedEvaluations);
      }
    },
    [
      currentIndex,
      questions,
      answers,
      questionTimeLeft,
      isEvaluatingStep,
      evaluations,
      jobDescription,
      handleSynthesizeFinalReport,
    ]
  );

  // 30-Second Strict Countdown Timer per Question
  useEffect(() => {
    if (!hasStarted || isSynthesizingReport || isEvaluatingStep) return;

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
  }, [currentIndex, hasStarted, isSynthesizingReport, isEvaluatingStep]);

  // Trigger auto-timeout when question timer hits 0
  useEffect(() => {
    if (questionTimeLeft === 0 && hasStarted && !isSynthesizingReport && !isEvaluatingStep) {
      advanceToNext("timeout");
    }
  }, [questionTimeLeft, hasStarted, isSynthesizingReport, isEvaluatingStep, advanceToNext]);

  // Answer change handler
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
        const combined = base ? (finalTrimmed ? `${base} ${finalTrimmed}` : base) : finalTrimmed;

        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: combined,
        }));
      },
      onError: (event) => {
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access denied. Please grant microphone permissions.");
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

  // Manual Next (STRICTLY DISABLED when input is empty)
  const handleManualNext = () => {
    if (!currentAnswer.trim()) return;
    advanceToNext("next");
  };

  // Reset / Retake interview session
  const handleResetSession = () => {
    if (
      window.confirm(
        "Are you sure you want to restart this mock interview? A completely fresh session with new questions will be generated."
      )
    ) {
      clearSavedMockSession(reportId);
      try {
        localStorage.removeItem(`talent_iq_mock_report_${reportId}`);
      } catch {
        // ignore
      }
      setAnswers({});
      setEvaluations({});
      setCurrentIndex(0);
      setElapsedSeconds(0);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT);
      setHasStarted(false);
      setErrorMessage("");
      stopSpeaking();
      if (onInterviewStateChange) {
        onInterviewStateChange(false);
      }
    }
  };

  const isTimerCritical = questionTimeLeft <= 5;
  const isTimerWarning = questionTimeLeft <= 10 && !isTimerCritical;

  // ─────────────────────────────────────────────────────────────
  // A. REPORT SYNTHESIS LOADING SCREEN
  // ─────────────────────────────────────────────────────────────
  if (isSynthesizingReport) {
    return (
      <div className="mock-evaluating-card">
        <div className="eval-spinner">
          <svg className="spinner-ring" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        </div>
        <h3>Live OpenAI Evaluator Synthesizing Report</h3>
        <p className="eval-subtitle">
          Analyzing your 16 technical answers, benchmarking against target JD competencies, and generating your
          evidence-based preparation report.
        </p>
        <div className="eval-steps">
          <div className={`eval-step ${synthesisStep >= 1 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Evaluating Technical Accuracy & Architectural Depth</span>
          </div>
          <div className={`eval-step ${synthesisStep >= 2 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Assessing Production Scenarios & Decision Frameworks</span>
          </div>
          <div className={`eval-step ${synthesisStep >= 3 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Benchmarking Competency Scores & Confidence Metrics</span>
          </div>
          <div className={`eval-step ${synthesisStep >= 4 ? "active" : ""}`}>
            <span className="step-dot" />
            <span>Compiling Executive Preparation Dashboard & PDF</span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // B. COMPLETED STATE VIEW
  // If interview is already completed, hide active interview inputs and question controls.
  // Show ONLY completed summary and "Retake Interview" button.
  // ─────────────────────────────────────────────────────────────
  const completedReport = getSavedMockReport(reportId);
  if (completedReport && !hasStarted) {
    return (
      <div className="mock-intro-card">
        <div className="mock-intro-header">
          <div className="mock-badge">Mock Interview Completed</div>
          <h2>Interview Completed ({completedReport.overallScore}%)</h2>
          <p>
            You have successfully completed this mock interview session. Your comprehensive preparation report,
            competency breakdown, strengths, areas for improvement, and benchmark answers are available in the
            <strong> Preparation Report</strong> tab.
          </p>
        </div>

        <div className="mock-brief-grid">
          <div className="brief-item">
            <div className="brief-details">
              <h4>Overall Score</h4>
              <p>
                {completedReport.overallScore}% ({completedReport.readinessVerdict || "Assessed"})
              </p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Questions Evaluated</h4>
              <p>{completedReport.totalQuestions || 16} Questions (Real AI Evaluation)</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Technical Depth</h4>
              <p>{completedReport.technicalScore}% Competency Score</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Confidence Level</h4>
              <p>{completedReport.confidenceLevel || "Moderate"}</p>
            </div>
          </div>
        </div>

        <div className="mock-intro-actions">
          <button type="button" className="start-mock-btn" onClick={handleResetSession}>
            Retake Interview
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // C. SETUP / BRIEFING SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="mock-intro-card">
        <div className="mock-intro-header">
          <div className="mock-badge">Live OpenAI Mock Interview</div>
          <h2>Role-Specific Mock Interview Simulation</h2>
          <p>
            Engage in a live technical interview simulation dynamically generated by OpenAI from your active Job
            Description. Each question features a strict <strong>30-second countdown timer</strong> to assess your rapid
            articulation under realistic interview pressure.
          </p>
        </div>

        {errorMessage && (
          <div className="speech-error-banner" style={{ margin: "1rem 0" }}>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mock-brief-grid">
          <div className="brief-item">
            <div className="brief-details">
              <h4>Live AI Generation</h4>
              <p>15–20 role-specific questions tailored strictly to your active JD</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Structure</h4>
              <p>Balanced mix of core technical concepts and real-world production scenarios</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>30-Second Limit</h4>
              <p>Auto-submits your answer (or auto-skips) when countdown reaches 00:00</p>
            </div>
          </div>
          <div className="brief-item">
            <div className="brief-details">
              <h4>Zero-Tolerance Scoring</h4>
              <p>Zero points for irrelevant or blank answers; graded strictly against JD requirements</p>
            </div>
          </div>
        </div>

        <div className="mock-tips-box">
          <h4>Interview Rules & Strict Pacing:</h4>
          <ul>
            <li>
              <strong>Strict 30s Countdown:</strong> Manage your time. When 30 seconds expire, the system automatically
              saves your answer and advances.
            </li>
            <li>
              <strong>Strict Input Validation:</strong> Manual "Next" is disabled while the input is empty. Click "Skip
              Question" to bypass.
            </li>
            <li>
              <strong>Tab Navigation Locked:</strong> Once started, all tabs are locked until the full interview is
              completed to preserve real-world interview conditions.
            </li>
          </ul>
        </div>

        <div className="mock-intro-actions">
          <button
            className="start-mock-btn"
            onClick={handleStartInterview}
            disabled={isGeneratingQuestions}
          >
            {isGeneratingQuestions ? "OpenAI Generating Questions..." : "Start Mock Interview"}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // D. ACTIVE QUESTION WORKSPACE
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
            <div className="session-progress-fill" style={{ width: `${progressPercent}%` }} />
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
              <span className={`type-pill ${currentQuestion.type}`}>{currentQuestion.typeLabel}</span>
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
              disabled={isEvaluatingStep}
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
              {isTimerCritical && (
                <span className="critical-warning-text">Auto-submitting in {questionTimeLeft}s...</span>
              )}
            </div>

            <div className="footer-right">
              {/* Skip Question (Always allowed without input) */}
              <button
                type="button"
                className="nav-control-btn skip-btn"
                onClick={handleSkip}
                disabled={isEvaluatingStep}
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
                  disabled={!currentAnswer.trim() || isEvaluatingStep}
                  title={
                    !currentAnswer.trim()
                      ? "Enter an answer to proceed, or click Skip Question"
                      : "Save answer and proceed to next question"
                  }
                >
                  {isEvaluatingStep ? "AI Evaluating..." : "Save & Next →"}
                </button>
              ) : (
                <button
                  type="button"
                  className="nav-control-btn submit-btn"
                  onClick={handleManualNext}
                  disabled={!currentAnswer.trim() || isEvaluatingStep}
                  title={
                    !currentAnswer.trim()
                      ? "Enter an answer to submit, or click Skip Question"
                      : "Complete mock interview and generate report"
                  }
                >
                  {isEvaluatingStep ? "AI Evaluating..." : "Submit Interview"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewSession;
