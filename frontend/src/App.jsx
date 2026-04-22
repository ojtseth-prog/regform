import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const Icons = {
  Pharmacy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16" /><path d="M12 21a8 8 0 0 0 8-8V5l-8-3-8 3v8a8 8 0 0 0 8 8z" /></svg>
  ),
  Location: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
  ),
  Email: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  Error: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  )
};

function App() {
  const [formData, setFormData] = useState({
    pharmacy_name: "",
    address: "",
    contact_number: "",
    email_address: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentView, setCurrentView] = useState("form");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (currentView === "success") {
      if (countdown > 0) {
        timer = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        handleBackToHome();
      }
    } else {
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [currentView, countdown]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentView(hash === "#success" ? "success" : "form");
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const API_URL = "https://corerxinfo.impactprotech.host/api/register.php";

      await axios.post(API_URL, formData);
      setCurrentView("success");
      window.location.hash = "success";
      setFormData({ pharmacy_name: "", address: "", contact_number: "", email_address: "" });
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.error || "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = "https://corerxreturns.com/";
  };

  return (
    <div className="registration-page">
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
            <li>About Us</li>
            <li>Services</li>
            <li>Contact Us</li>
            <li className="login-btn">Login →</li>
          </ul>
        </div>
      </nav>

      {/* Hero & Section */}
      <main className="hero-section">
        <div className="container">
          {currentView === "form" ? (
            <div className="form-card">
              <h2 className="animate-in" style={{ animationDelay: "0.1s" }}>Pharmacy Registration</h2>
              <p className="subtitle animate-in" style={{ animationDelay: "0.2s" }}>Fill out the details below to get started</p>

              <form onSubmit={handleSubmit}>
                <div className="form-row animate-in" style={{ animationDelay: "0.5s" }}>
                  <div className="form-group half">
                    <label htmlFor="pharmacy_name">Pharmacy Name</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Pharmacy /></span>
                      <input
                        type="text"
                        id="pharmacy_name"
                        name="pharmacy_name"
                        placeholder="e.g. Clarkson Pharmacy"
                        value={formData.pharmacy_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group half">
                    <label htmlFor="address">Business Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Location /></span>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Street, City, Zip Code"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row animate-in" style={{ animationDelay: "0.6s" }}>
                  <div className="form-group half">
                    <label htmlFor="contact_number">Contact Phone</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Phone /></span>
                      <input
                        type="tel"
                        id="contact_number"
                        name="contact_number"
                        placeholder="(555) 000-0000"
                        value={formData.contact_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group half">
                    <label htmlFor="email_address">Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Email /></span>
                      <input
                        type="email"
                        id="email_address"
                        name="email_address"
                        placeholder="pharmacy@example.com"
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${loading ? "processing" : ""} animate-in`}
                  style={{ animationDelay: "0.7s" }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Submit Registration"}
                </button>
              </form>

              {message && (
                <div className={`status-message ${isError ? "error" : "success"}`}>
                  {isError ? <Icons.Error /> : <Icons.Check />}
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="success-page-immersive animate-in">
              <div className="success-card simplified">
                <div className="success-icon-wrap large">
                  <Icons.Check />
                </div>

                <div className="confirmation-message">
                  <p>You will be contacted by our team shortly after your information is received.</p>
                </div>

                <div className="redirect-status">
                  <div className="loader-mini"></div>
                  <p>Redirecting to CoreRx Returns in <span>{countdown}</span> seconds...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
