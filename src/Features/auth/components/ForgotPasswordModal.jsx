import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "../services/auth.api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = "" }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || "");
      setEmailError("");
      setFeedback({ message: "", type: "" });
      setSubmitted(false);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setFeedback({ message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setFeedback({ message: "", type: "" });

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email address is required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: trimmedEmail });
      const successMessage =
        "If an account exists for that email, password reset instructions have been sent.";
      setFeedback({ message: successMessage, type: "success" });
      setSubmitted(true);
      toast.success(successMessage);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      if (err.response?.status === 400) {
        // 400 Error: Show exact backend error
        const backendMsg =
          err.response?.data?.message || err.response?.data?.error || "Invalid email request.";
        setFeedback({ message: backendMsg, type: "error" });
        toast.error(backendMsg);
      } else if (err.response?.status === 500) {
        // 500 Error: Show generic error to try again later
        const serverMsg = "Something went wrong. Please try again later.";
        setFeedback({ message: serverMsg, type: "error" });
        toast.error(serverMsg);
      } else if (err.response?.status === 404) {
        // Do not reveal account existence
        const safeMsg =
          "If an account exists for that email, password reset instructions have been sent.";
        setFeedback({ message: safeMsg, type: "success" });
        setSubmitted(true);
        toast.success(safeMsg);
      } else {
        const fallbackMsg =
          err.response?.data?.message || "Something went wrong. Please try again later.";
        setFeedback({ message: fallbackMsg, type: "error" });
        toast.error(fallbackMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-badge-wrapper">
            <span className="modal-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h3 id="forgot-password-title">Reset your password</h3>
        <p className="modal-subtitle">
          Enter the email associated with your account, and we'll send you instructions to reset your password.
        </p>

        {feedback.message && (
          <div
            className={`modal-feedback-alert ${
              feedback.type === "success" ? "feedback-success" : "feedback-error"
            }`}
            role="alert"
          >
            {feedback.type === "success" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {submitted ? (
          <div className="modal-action-row" style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="login-btn"
              style={{ width: "100%", marginTop: "0" }}
              onClick={onClose}
            >
              Done & Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group" style={{ marginTop: "16px" }}>
              <label htmlFor="forgot-email">Account Email</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                autoFocus
                className={emailError ? "has-error" : ""}
                aria-invalid={emailError ? "true" : "false"}
              />
              {emailError && (
                <span className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {emailError}
                </span>
              )}
            </div>

            <div className="modal-footer-btns">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="login-btn modal-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="modal-spinner"></span>
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
