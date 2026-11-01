import React, { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import ResetPasswordModal from "../components/ResetPasswordModal";

const ResetPassword = () => {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getEffectiveToken = () => {
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

    const segments = (location?.pathname || window.location.pathname).split("/").filter(Boolean);
    if (segments.length >= 2) {
      return segments[segments.length - 1];
    }
    return "";
  };

  const token = getEffectiveToken();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/login", { replace: true });
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/" title="Talent IQ">
        <span className="brand-badge">TIQ</span>
        <span className="brand-name">Talent IQ</span>
      </Link>

      <section className="auth-visual">
        <span className="eyebrow">Account Recovery</span>
        <h1>Set your new account password.</h1>
        <p>
          Choose a strong password with a minimum of 8 characters to secure your interview preparation data.
        </p>
        <div className="auth-metrics">
          <strong>AI role analysis</strong>
          <strong>Resume matching</strong>
          <strong>Interview reports</strong>
        </div>
      </section>

      <ResetPasswordModal
        isOpen={isModalOpen}
        token={token}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ResetPassword;
