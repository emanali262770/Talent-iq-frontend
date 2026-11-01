import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../services/auth.api";

const ResetPasswordModal = ({ isOpen, onClose, token = "", onSuccess }) => {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getEffectiveToken = () => {
    if (token) return token;
    if (routeToken) return routeToken;

    const queryToken =
      searchParams.get("token") ||
      searchParams.get("resetToken") ||
      searchParams.get("key");
    if (queryToken) return queryToken;

    const winSearch = new URLSearchParams(window.location.search);
    const winToken = winSearch.get("token") || winSearch.get("resetToken") || winSearch.get("key");
    if (winToken) return winToken;

    if (window.location.hash) {
      const hashObj = new URLSearchParams(window.location.hash.replace(/^#\/?/, ""));
      const hashToken = hashObj.get("token") || hashObj.get("resetToken");
      if (hashToken) return hashToken;
    }

    const segments = (location?.pathname || window.location.pathname)
      .split("/")
      .filter(Boolean);
    if (
      segments.length >= 2 &&
      (segments[0] === "reset-password" ||
        segments[0] === "resetpassword" ||
        segments[0] === "auth")
    ) {
      return segments[segments.length - 1];
    }

    return "";
  };

  const urlToken = getEffectiveToken();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ password: "", confirmPassword: "" });
      setErrors({});
      setTouched({});
      setServerError("");
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    if (onClose) {
      onClose();
    } else {
      navigate("/login", { replace: true });
    }
  };

  const validateField = (field, value) => {
    let error = "";
    if (field === "password") {
      if (!value) {
        error = "New password is required.";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters long.";
      }
    } else if (field === "confirmPassword") {
      if (!value) {
        error = "Please confirm your new password.";
      } else if (value !== form.password) {
        error = "Passwords do not match.";
      }
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
    };

    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError("");
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
    if (field === "password" && touched.confirmPassword) {
      if (form.confirmPassword && form.confirmPassword !== value) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
      } else if (form.confirmPassword && form.confirmPassword === value) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!urlToken) {
      const msg = "Reset token is missing from the URL. Please request a new password reset link.";
      setServerError(msg);
      toast.error(msg);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in both fields correctly (minimum 8 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        token: urlToken.trim(),
        password: form.password,
      });

      const successMsg = res?.message || "Password reset successfully";
      toast.success(successMsg);

      // Close modal / update state
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }

      // Redirect user directly to the Login Page
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response?.status === 400) {
        // 400 Error: Show exact backend error (invalid/expired token or password under 8 characters)
        const backendMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid or expired reset token. Please request a new reset link.";
        setServerError(backendMsg);
        toast.error(backendMsg);
      } else if (err.response?.status === 500) {
        // 500 Error: Show generic error to try again later
        const serverMsg = "Something went wrong. Please try again later.";
        setServerError(serverMsg);
        toast.error(serverMsg);
      } else {
        const fallbackMsg =
          err.response?.data?.message || "Something went wrong. Please try again later.";
        setServerError(fallbackMsg);
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
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
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
            onClick={handleClose}
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

        <h3 id="reset-modal-title">Reset your password</h3>
        <p className="modal-subtitle">
          Enter your new password below. It must be at least 8 characters long.
        </p>

        {!urlToken && (
          <div className="modal-feedback-alert feedback-error" role="alert" style={{ marginTop: "14px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Reset token is missing from the link. Please check your email or request a new link.</span>
          </div>
        )}

        {serverError && (
          <div className="modal-feedback-alert feedback-error" role="alert" style={{ marginTop: "14px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ marginTop: "16px" }}>
          <div className="input-group">
            <label htmlFor="modal-new-password">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="modal-new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                disabled={loading || !urlToken}
                className={touched.password && errors.password ? "has-error" : ""}
                aria-invalid={touched.password && errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="field-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.password}
              </span>
            )}
          </div>

          <div className="input-group" style={{ marginTop: "14px" }}>
            <label htmlFor="modal-confirm-password">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                id="modal-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={loading || !urlToken}
                className={touched.confirmPassword && errors.confirmPassword ? "has-error" : ""}
                aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="modal-footer-btns">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="login-btn modal-submit-btn"
              disabled={loading || !urlToken}
            >
              {loading ? (
                <>
                  <span className="modal-spinner"></span>
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
