import React from "react";
import "../styles/Spinner.css";

const Spinner: React.FC = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner">
        <div className="spinner__wave"></div>
        <div className="spinner__wave"></div>
        <div className="spinner__wave"></div>
        <div className="spinner__wave"></div>
        <div className="spinner__wave"></div>
      </div>
    </div>
  );
};

export default Spinner;
