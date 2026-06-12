import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import SignatureCanvas from "react-signature-canvas";
import TermsModal from "./TermsModal";


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
    dba_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    contact_number: "",
    mobile: "",
    email_address: "",
    contact_person: "",
    drug_wholesaler: "",
    authorized_name: "",
  });

  const [files, setFiles] = useState({
    state_lic_file: null,
    dea_lic_file: null,
    invoice_file: null
  });

  const [sigPad, setSigPad] = useState(null);
  const sigContainerRef = useRef(null); // Add this ref
  const [canvasWidth, setSigWidth] = useState(500);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentView, setCurrentView] = useState("form");
  const [countdown, setCountdown] = useState(5);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSigAlert, setShowSigAlert] = useState(false);

  const formatUSPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, ""); // Remove all non-digits
    if (digits.length === 0) return "";

    // Ensure the number starts with '1'
    let num = digits;
    if (num[0] !== "1") {
      num = "1" + num;
    }

    // Limit to 11 digits (1 + 10 digit number)
    num = num.substring(0, 11);

    const parts = {
      country: num.slice(0, 1),
      area: num.slice(1, 4),
      mid: num.slice(4, 7),
      last: num.slice(7, 11)
    };

    if (num.length <= 1) return parts.country;
    if (num.length <= 4) return `${parts.country} (${parts.area}`;
    if (num.length <= 7) return `${parts.country} (${parts.area}) ${parts.mid}`;
    return `${parts.country} (${parts.area}) ${parts.mid}-${parts.last}`;
  };

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
    const updateWidth = () => {
      if (sigContainerRef.current) {
        // Get the actual width of the container minus a little padding
        setSigWidth(sigContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

    if (name === "zip_code") {
      // Only allow digits and restrict to exactly 5 characters
      const digits = value.replace(/\D/g, "").slice(0, 5);
      setFormData({ ...formData, [name]: digits });
    } else if (name === "contact_number" || name === "mobile") {
      // Apply US formatting
      setFormData({ ...formData, [name]: formatUSPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Get clean phone number (just digits, or empty if none)
  const getCleanPhoneNumber = () => {
    return formData.contact_number.replace(/\D/g, '');
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles({ ...files, [name]: uploadedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Change 1: Safer check for the signature pad
    if (!sigPad || sigPad.isEmpty()) {
      alert("Please provide a signature");
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions before submitting.");
      return;
    }

if (!files.state_lic_file || !files.dea_lic_file) {
    alert("Please upload both State and DEA licenses.");
    return;
}

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const allowedExt = ["pdf", "jpg", "jpeg", "png"];

const isValidFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    return allowedTypes.includes(file.type) || allowedExt.includes(ext);
};

if (!isValidFile(files.state_lic_file)) {
    alert("State License: Only PDF, JPEG, or PNG files are allowed.");
    return;
}
if (!isValidFile(files.dea_lic_file)) {
    alert("DEA License: Only PDF, JPEG, or PNG files are allowed.");
    return;
}

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email_address)) {
      alert("Please enter a complete email address (e.g., name@example.com)");
      return;
    }

 setLoading(true);
setIsError(false);
setMessage("");

const data = new FormData();
Object.keys(formData).forEach(key => {
    data.append(key, formData[key] || "");
});

data.append("terms_accepted", termsAccepted ? "1" : "0");

const signatureImage = sigPad.getCanvas().toDataURL('image/png');
data.append("signature_image", signatureImage);

if (files.state_lic_file) data.append("state_lic_file", files.state_lic_file);
if (files.dea_lic_file) data.append("dea_lic_file", files.dea_lic_file);

// Optimistic — show success immediately, upload in background
setCurrentView("success");
setCountdown(3);
setLoading(false);

axios.post("https://corerxinfo.impactprotech.host/api/register.php", data)
    .catch(error => console.error("Background submission error:", error));
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
            <li onClick={() => handleNavigation("https://corerxreturns.com/about-us")}>
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
                {/* Row 1: Pharmacy & DBA */}
                <div className="form-row animate-in">
                  <div className="form-group half">
                    <label>Pharmacy Name *</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Pharmacy /></span>
                      <input type="text" name="pharmacy_name" value={formData.pharmacy_name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group half">
                    <label>DBA Name</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Pharmacy /></span>
                      <input type="text" name="dba_name" value={formData.dba_name} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Business Address */}
                <div className="form-group full animate-in">
                  <label>Business Address *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Icons.Location /></span>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                </div>

                {/* Row 3: City, State, Zip (3 Fields) */}
                <div className="form-row animate-in">
                  <div className="form-group third">
                    <label>City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group third">
                    <label>State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                  </div>
                  <div className="form-group third">
                    <label>Zip Code *</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      required
                      maxLength="5"
                      pattern="\d{5}"
                      title="5-digit US Zip Code"
                    />
                  </div>
                </div>

                {/* Row 4: Phone, Mobile, Email (3 Fields) */}
                <div className="form-row animate-in">
                  <div className="form-group third">
                    <label>Phone Number *</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Phone /></span>
                      <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group third">
                    <label>Mobile Number *</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Phone /></span>
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group third">
                    <label>Email Address *</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Icons.Email /></span>
                      <input
                        type="email"
                        name="email_address"
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                        title="Please enter a valid email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 5: Contact, Authorized, Wholesaler (3 Fields) */}
                <div className="form-row animate-in">
                  <div className="form-group third">
                    <label>Contact Person *</label>
                    <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} required />
                  </div>
                  <div className="form-group third">
                    <label>Authorized Name *</label>
                    <input type="text" name="authorized_name" value={formData.authorized_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group third">
                    <label>Drug Wholesaler *</label>
                    <input type="text" name="drug_wholesaler" value={formData.drug_wholesaler} onChange={handleChange} required />
                  </div>
                </div>

                {/* Row 6: File Uploads */}
                <div className="form-row animate-in">
                  <div className="form-group half">
                    <label>State Lic. Copy *</label>
                    <input type="file" name="state_lic_file" onChange={handleFileChange} className="file-input" required accept=".pdf,.jpg,.jpeg,.png" />
                  </div>
                  <div className="form-group half">
                    <label>DEA Lic. Copy *</label>
                    <input type="file" name="dea_lic_file" onChange={handleFileChange} className="file-input" required accept=".pdf,.jpg,.jpeg,.png"/>
                  </div>
                </div>

                {/* Row 7: Signature */}
                <div className="form-group full animate-in">
                  <label>Online Signature *</label>
                  <div
                    ref={sigContainerRef} // Attach the ref here
                    className="signature-container"
                    style={{ position: 'relative' }}
                  >
                    {!termsAccepted && (
                      <div
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowSigAlert(true);
                          setTimeout(() => setShowSigAlert(false), 3000);
                        }}
                      >
                        {showSigAlert && (
                          <div className="sig-alert-popup">
                            Please accept the Terms and Conditions before signing.
                          </div>
                        )}
                      </div>
                    )}
                    <SignatureCanvas
                      ref={(ref) => setSigPad(ref)}
                      backgroundColor="white"
                      penColor="black"
                      // Use the dynamic canvasWidth here
                      canvasProps={{
                        width: canvasWidth,
                        height: 180,
                        className: 'sigCanvas'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="clear-sig-btn"
                    onClick={() => sigPad && sigPad.clear()}
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="form-group full animate-in terms-checkbox-container" onClick={() => {
                  if (!termsAccepted) {
                    setShowTermsModal(true);
                  } else {
                    setTermsAccepted(false);
                  }
                }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={() => { }}
                    required
                    style={{ display: 'none' }}
                  />
                  <div className={`custom-checkbox ${termsAccepted ? 'checked' : ''}`}>
                    {termsAccepted && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                  <span className="terms-checkbox-text">
                    By using Core Rx Return Services, you affirm that you have read, understood, and agree to be bound by these <span className="terms-link" onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}>Terms and Conditions</span> *
                  </span>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${loading ? "processing" : ""} animate-in`}
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
                  <p>Thank you. Our team will review your information and be in touch shortly. All information shared will remain confidential</p>
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

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
        isAccepted={termsAccepted}
      />
    </div>
  );
}

export default App;