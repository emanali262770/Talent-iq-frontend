import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: "", level: "" };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", level: "weak" };
  if (score <= 3) return { score: 2, label: "Medium", level: "medium" };
  return { score: 3, label: "Strong", level: "strong" };
};

const Register = () => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { user, handleRegister, loading } = useAuth();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const validateField = (field, value) => {
    let error = "";
    if (field === "userName") {
      if (!value || !value.trim()) {
        error = "Username is required.";
      } else if (value.trim().length < 3) {
        error = "Username must be at least 3 characters.";
      }
    } else if (field === "email") {
      if (!value || !value.trim()) {
        error = "Email address is required.";
      } else if (!EMAIL_REGEX.test(value.trim())) {
        error = "Please enter a valid email address.";
      }
    } else if (field === "password") {
      if (!value) {
        error = "Password is required.";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters long.";
      }
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      userName: validateField("userName", form.userName),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };

    setErrors(newErrors);
    setTouched({ userName: true, email: true, password: true });
    return !newErrors.userName && !newErrors.email && !newErrors.password;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError("");
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      toast.error("Please resolve form errors before submitting.");
      return;
    }

    const res = await handleRegister({
      userName: form.userName.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (res?.success) {
      toast.success(res.data?.message || "Account created successfully!");
      navigate("/dashboard");
    } else {
      const msg = res?.message || "Registration failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/">
        <span>TIQ</span>
        Talent IQ
      </Link>
      <section className="auth-visual">
        <span className="eyebrow">Get started</span>
        <h1>Create a focused path for your next interview.</h1>
        <p>
          Set up your Talent IQ account and turn job descriptions, resumes, and
          profile notes into practical interview reports.
        </p>
        <div className="auth-metrics">
          <strong>Job fit insight</strong>
          <strong>Profile context</strong>
          <strong>Saved reports</strong>
        </div>
      </section>

      <div className="login-card">
        <h2>Create Account</h2>
        <p className="subtitle">Register to start preparing with Talent IQ.</p>

        {serverError && (
          <div className="form-server-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              autoComplete="name"
              placeholder="e.g., Alex Chen"
              value={form.userName}
              onChange={(e) => handleChange("userName", e.target.value)}
              onBlur={() => handleBlur("userName")}
              className={touched.userName && errors.userName ? "has-error" : ""}
              aria-invalid={touched.userName && errors.userName ? "true" : "false"}
            />
            {touched.userName && errors.userName && (
              <span className="field-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.userName}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={touched.email && errors.email ? "has-error" : ""}
              aria-invalid={touched.email && errors.email ? "true" : "false"}
            />
            {touched.email && errors.email && (
              <span className="field-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="reg-password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={touched.password && errors.password ? "has-error" : ""}
                aria-invalid={touched.password && errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
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

            {form.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  <div className={`bar ${strength.score >= 1 ? `active-${strength.level}` : ""}`}></div>
                  <div className={`bar ${strength.score >= 2 ? `active-${strength.level}` : ""}`}></div>
                  <div className={`bar ${strength.score >= 3 ? `active-${strength.level}` : ""}`}></div>
                </div>
                <div className="strength-text">
                  <span>Password strength</span>
                  <span className={`score-label ${strength.level}`}>{strength.label}</span>
                </div>
              </div>
            )}

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

          <button disabled={loading} type="submit" className="login-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="register-link">
            Already have an account?{" "}
            <Link className="span" to="/login">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
