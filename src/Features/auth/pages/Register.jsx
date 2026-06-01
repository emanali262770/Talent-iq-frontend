import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


const Register = () => {
    const [form, setform] = useState({
        userName: "",
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { handleRegister, loading } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister(form);
        navigate("/dashboard");
    };
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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.userName}
              onChange={(e) => setform({ ...form, userName: e.target.value })}
            />
          </div>

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
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setform({ ...form, password: e.target.value })}
            />
          </div>

          <button disabled={loading} type="submit" className="login-btn">
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="register-link">
            Already have an account? <Link className="span" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
