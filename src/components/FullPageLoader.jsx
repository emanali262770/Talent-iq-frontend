import React from "react";
import "./FullPageLoader.css";

const FullPageLoader = ({ label = "Loading" }) => {
  return (
    <div className="full-page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="spinner" />
    </div>
  );
};

export default FullPageLoader;
