import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


const Register = () => {
    const [form, setform] = useState({
        userName: "",
        email: "",
        password: ""
    });
    const {user, handleRegister,loading } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('click');
        
       await handleRegister(form);
        console.log(user);
        
    };
    if(loading){
        return <div>Loading...</div>
    }
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account</h2>
        <p className="subtitle">Register to get started</p>

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

          <button type="submit" className="login-btn">
            Register
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