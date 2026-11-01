import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { user, handleLogin, loading } = useAuth();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const validateField = (field, value) => {
    let error = "";
    if (field === "email") {
      if (!value || !value.trim()) {
        error = "Email address is required.";
      } else if (!EMAIL_REGEX.test(value.trim())) {
        error = "Please enter a valid email address (e.g., name@example.com).";
      }
    } else if (field === "password") {
      if (!value) {
        error = "Password is required.";
      }
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
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
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const res = await handleLogin({
      email: form.email.trim(),
      password: form.password,
    });

    if (res?.success) {
      toast.success(res.data?.message || "Logged in successfully!");
      navigate("/dashboard");
    } else {
      const msg = res?.message || "Invalid email or password. Please try again.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/" title="Talent IQ">
        <span className="brand-badge">TIQ</span>
        <span className="brand-name">Talent IQ</span>
      </Link>
      <section className="auth-visual">
        <span className="eyebrow">Welcome back</span>
        <h1>Continue building your interview strategy.</h1>
        <p>
          Pick up your saved reports, add a new job description, and generate a
          sharper preparation plan.
        </p>
        <div className="auth-metrics">
          <strong>AI role analysis</strong>
          <strong>Resume matching</strong>
          <strong>Interview reports</strong>
        </div>
      </section>

      <div className="login-card">
        <h2>Login</h2>
        <p className="subtitle">Enter your details to open your dashboard.</p>

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
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
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
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
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
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>

          <p className="register-link">
            Don't have an account?{" "}
            <Link className="span" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
