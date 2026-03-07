import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const Login = () => {
  const [form, setform] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const {user, handleLogin, loading } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form);
    navigate('/')
    
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue</p>

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
