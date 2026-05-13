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
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  Error: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  )
};

function App() {
  const [formData, setFormData] = useState({
    pharmacy_name: "",
    address: "",
    contact_number: "",
    email_address: "",
    contact_person: "",
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

  // Only allow digits, no formatting while typing
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_number") {
      // Only allow digits, max 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Get clean phone number (just digits, or empty if none)
  const getCleanPhoneNumber = () => {
    return formData.contact_number.replace(/\D/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const cleanPhone = getCleanPhoneNumber();

    // Phone is OPTIONAL - only validate if provided
    if (cleanPhone && cleanPhone.length !== 10) {
      setIsError(true);
      setMessage("Please enter a valid 10-digit phone number or leave it blank");
      setLoading(false);
      return;
    }

    // Email is still required
    if (!formData.email_address) {
      setIsError(true);
      setMessage("Email address is required");
      setLoading(false);
      return;
    }

    // Prepare data - send raw digits (backend will format for storage)
    const submitData = {
      pharmacy_name: formData.pharmacy_name,
      address: formData.address,
      contact_person: formData.contact_person,
      contact_number: cleanPhone, // Send raw digits (or empty string)
      email_address: formData.email_address,
    };

    try {
      const API_URL = "https://corerxinfo.impactprotech.host/api/register.php";

      await axios.post(API_URL, submitData);
      setCurrentView("success");
      window.location.hash = "success";
      setFormData({
        pharmacy_name: "",
        address: "",
        contact_number: "",
        email_address: "",
        contact_person: "",
      });
    } catch (error) {
      setIsError(true);
      console.error("API Error:", error.response || error);
      setMessage(error.response?.data?.error || "Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = "https://corerxreturns.com/";
  };

  const handleCloseForm = () => {
    handleBackToHome();
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    window.location.href = path;
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
          <a href="https://corerxreturns.com/" className="logo">
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
            <li onClick={() => handleNavigation("https://corerxreturns.com/")}>
              Home
            </li>
            <li onClick={() => handleNavigation("https://corerxreturns.com/about")}>
              About Us
            </li>
            <li onClick={() => handleNavigation("https://corerxreturns.com/services")}>
              Services
            </li>
            <li onClick={() => handleNavigation("https://corerxreturns.com/contact-us")}>
              Contact Us
            </li>
            <li
              className="login-btn"
              onClick={() => handleNavigation("https://coremedsweeprx.impactprotech.host/")}
            >
              Login →
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero & Section */}
      <main className="hero-section">
        <div className="container">
          {currentView === "form" ? (
            <div className="form-card">
              <button
                className="close-form-btn"
                onClick={handleCloseForm}
                aria-label="Close form and return to home"
              >
                <Icons.Close />
              </button>

              <h2 className="animate-in" style={{ animationDelay: "0.1s" }}>Pharmacy Registration</h2>
              <p className="subtitle animate-in" style={{ animationDelay: "0.2s" }}>Fill out the details below to get started</p>

              <form onSubmit={handleSubmit}>
                <div className="form-row animate-in" style={{ animationDelay: "0.5s" }}>
                  <div className="form-group half">
                    <label htmlFor="pharmacy_name">Enter your Pharmacy Name</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Pharmacy /></span>
                      <input
                        type="text"
                        id="pharmacy_name"
                        name="pharmacy_name"
                        placeholder="ex. My Pharmacy"
                        value={formData.pharmacy_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group half">
                    <label htmlFor="address">Enter your Business Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Location /></span>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="ex. 123 Main St, Boston, MA 02108"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row animate-in" style={{ animationDelay: "0.6s" }}>
                  <div className="form-group half">
                    <label htmlFor="contact_person">Contact Person</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.User /></span>
                      <input
                        type="text"
                        id="contact_person"
                        name="contact_person"
                        placeholder="Please indicate the full name"
                        value={formData.contact_person}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group half">
                    <label htmlFor="contact_number">Contact Phone (Optional)</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Phone /></span>
                      <input
                        type="tel"
                        id="contact_number"
                        name="contact_number"
                        placeholder="ex. 1234567890"
                        value={formData.contact_number}
                        onChange={handleChange}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row animate-in" style={{ animationDelay: "0.7s" }}>
                  <div className="form-group full">
                    <label htmlFor="email_address">Enter your Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Email /></span>
                      <input
                        type="email"
                        id="email_address"
                        name="email_address"
                        placeholder="ex. pharmacy@gmail.com"
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
                  style={{ animationDelay: "0.8s" }}
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