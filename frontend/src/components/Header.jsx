import React from "react";
import Icons from "./Icons";

const Header = ({ scrolled, isMenuOpen, setIsMenuOpen }) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="top-bar">
        <div className="container">
          <div className="contact-info">
            <span>📞 888-700-9896</span>
            <span>✉️ info@corerxreturns.com</span>
          </div>
          <div className="social-links">
            <span>Linked <b>in</b></span>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} className="logo">
            <img src="/logo.jpg" alt="CoreRx Returns Logo" className="logo-img" />
            <div className="logo-text">
              <span className="brand-name">CoreRx</span>
              <span className="brand-sub">RETURNS</span>
            </div>
          </a>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icons.Menu />
          </button>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li onClick={() => window.location.hash = ""}>Home</li>
            <li><a href="http://localhost:5173/">About Us</a></li>
            <li><a href="http://localhost:5173/">Services</a></li>
            <li><a href="http://localhost:5173/">Contact Us</a></li>
            <li className="login-btn"><a href="http://localhost:5173/">Login</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;
