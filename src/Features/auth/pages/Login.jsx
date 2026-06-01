import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const Login = () => {
  const [form, setform] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { handleLogin, loading } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form);
    navigate('/dashboard')
    
  };
  

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/">
        <span>TIQ</span>
        Talent IQ
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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setform({ ...form, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setform({ ...form, password: e.target.value })}
            />
          </div>
          <button disabled={loading} type="submit" className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="register-link">
            Don't have an account?{" "}
            <Link className="span" to="/register">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
