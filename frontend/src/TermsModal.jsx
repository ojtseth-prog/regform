import React, { useRef, useState, useEffect } from 'react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, onAccept, isAccepted }) => {
  const contentRef = useRef(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(isAccepted);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(isAccepted);
      setTimeout(() => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight <= clientHeight + 20) {
            setHasScrolledToBottom(true);
          }
        }
      }, 100);
    }
  }, [isOpen, isAccepted]);

  const handleScroll = () => {
    if (contentRef.current && !hasScrolledToBottom) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal-content">
        <button className="terms-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        <div className="terms-modal-header">
          <img src="/logo.jpg" alt="CoreRx Returns Logo" />
          <div className="header-text">
            <h1>Terms and Conditions</h1>
            <p>Reverse Distribution Services Agreement</p>
          </div>
        </div>

        <div className="terms-modal-body" ref={contentRef} onScroll={handleScroll}>
          <div className="container">
            <div className="content">
              <p className="last-updated"><strong>Last Updated:</strong> May 29, 2026</p>

              <div className="highlight-box">
                <strong>IMPORTANT:</strong> By using the CoreRx Return Services, you affirm that you have read, understood, and agree to be bound by these Terms and Conditions. You further represent and warrant that you have the legal authority to bind yourself and the entity you represent.
              </div>

              <h2>1. Definitions</h2>
              <p>In these Terms and Conditions, the following definitions apply:</p>
              <ul>
                <li><strong>"CoreRx"</strong> refers to CoreRx Returns, located at 225A Sunrise Hwy, Lynbrook, NY 11563.</li>
                <li><strong>"Customer"</strong> refers to the pharmacy, healthcare facility, or entity registering for and using the return services.</li>
                <li><strong>"Services"</strong> refers to reverse distribution, pharmaceutical returns, and related services provided by CoreRx.</li>
                <li><strong>"Products"</strong> refers to pharmaceutical items, medications, and healthcare products being returned.</li>
                <li><strong>"Regulatory Authorities"</strong> refers to DEA, FDA, state boards of pharmacy, and other applicable regulatory bodies.</li>
              </ul>

              <h2>2. Acceptance of Terms</h2>
              <p>By accessing or using the CoreRx Returns Portal and Services, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, you must not use the Services. These terms constitute a legally binding agreement between you and CoreRx.</p>

              <h2>3. Eligibility and Registration</h2>
              <h3>3.1 Eligibility Requirements</h3>
              <ul>
                <li>You must be a licensed pharmacy, healthcare facility, or authorized entity permitted to handle pharmaceutical products.</li>
                <li>You must maintain valid state pharmacy licenses and DEA registrations where applicable.</li>
                <li>You must be in good standing with all relevant Regulatory Authorities.</li>
              </ul>

              <h3>3.2 Registration Accuracy</h3>
              <p>You agree to provide accurate, current, and complete information during the registration process. This includes but is not limited to:</p>
              <ul>
                <li>Corporate and DBA names</li>
                <li>Physical address and contact information</li>
                <li>Valid license numbers and expiration dates</li>
                <li>Authorized wholesaler and supplier information</li>
                <li>Manufacturer direct account details</li>
              </ul>

              <h3>3.3 Document Submission</h3>
              <p>You must submit copies of:</p>
              <ul>
                <li>Valid State Pharmacy License</li>
                <li>Valid DEA License (where applicable)</li>
                <li>Current/active Wholesaler Invoice</li>
              </ul>

              <h2>4. Product Returns and Compliance</h2>
              <h3>4.1 Product Authenticity</h3>
              <p>You represent and warrant that:</p>
              <ul>
                <li>All medications returned are not suspect or illegitimate</li>
                <li>Products were purchased from licensed wholesalers whose information is accurately provided</li>
                <li>Products have been stored and handled in accordance with manufacturer specifications</li>
                <li>Returned products are not counterfeit, diverted, or otherwise non-authentic</li>
              </ul>

              <h3>4.2 Compliance with Laws</h3>
              <p>You agree to comply with all applicable federal, state, and local laws, regulations, and guidelines governing:</p>
              <ul>
                <li>Pharmaceutical returns and reverse distribution</li>
                <li>Controlled substance handling and documentation (where applicable)</li>
                <li>Hazardous waste disposal regulations</li>
                <li>Chain of custody requirements</li>
                <li>Data privacy and security laws</li>
              </ul>

              <h3>4.3 Prohibited Items</h3>
              <p>You may not return:</p>
              <ul>
                <li>Counterfeit or suspected counterfeit products</li>
                <li>Products from unauthorized or unlicensed sources</li>
                <li>Hazardous materials not properly classified and documented</li>
                <li>Products subject to recall without proper documentation</li>
                <li>Any items that would violate DEA, FDA, or state regulations</li>
              </ul>

              <h2>5. Service Terms</h2>
              <h3>5.1 Service Description</h3>
              <p>CoreRx provides reverse distribution services including:</p>
              <ul>
                <li>Pharmaceutical returns processing</li>
                <li>Credit recovery coordination with manufacturers and wholesalers</li>
                <li>Proper disposal of non-returnable items</li>
                <li>Regulatory compliance documentation</li>
                <li>Customer support and account management</li>
              </ul>

              <h3>5.2 Fees and Payment</h3>
              <p>Fees for services will be communicated separately and are not included in this agreement. All fees must be paid according to the terms established in your service agreement with CoreRx.</p>

              <h3>5.3 Service Limitations</h3>
              <p>CoreRx reserves the right to:</p>
              <ul>
                <li>Refuse service for products that do not meet return criteria</li>
                <li>Suspend or terminate service for violations of these terms</li>
                <li>Modify service offerings with reasonable notice</li>
                <li>Require additional documentation for certain product categories</li>
              </ul>

              <h2>6. Confidentiality and Data Protection</h2>
              <h3>6.1 Confidential Information</h3>
              <p>Both parties agree to protect confidential information exchanged during the course of business. This includes business information, customer data, pricing, and proprietary processes.</p>

              <h3>6.2 Data Security</h3>
              <p>CoreRx implements reasonable security measures to protect your data. However, you acknowledge that no internet transmission is completely secure and use the portal at your own risk.</p>

              <h2>7. Liability and Indemnification</h2>
              <h3>7.1 Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, CoreRx shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.</p>

              <h3>7.2 Indemnification</h3>
              <p>You agree to indemnify, defend, and hold harmless CoreRx, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:</p>
              <ul>
                <li>Your violation of these Terms and Conditions</li>
                <li>Your return of counterfeit, diverted, or non-authentic products</li>
                <li>Your failure to comply with applicable laws and regulations</li>
                <li>Any misrepresentation in your registration information</li>
              </ul>

              <h2>8. Termination</h2>
              <h3>8.1 Termination by Customer</h3>
              <p>You may terminate your use of the Services at any time by providing written notice to CoreRx.</p>

              <h3>8.2 Termination by CoreRx</h3>
              <p>CoreRx may suspend or terminate your access to the Services immediately if:</p>
              <ul>
                <li>You violate any provision of these Terms</li>
                <li>Your licenses or registrations expire or are revoked</li>
                <li>You provide false or misleading information</li>
                <li>You return suspect or illegitimate products</li>
                <li>CoreRx determines that continued service would create legal or regulatory risk</li>
              </ul>

              <h2>9. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration in Nassau County, New York.</p>

              <h2>10. Changes to Terms</h2>
              <p>CoreRx reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the Services after changes constitutes acceptance of the modified terms.</p>

              <h2>11. Contact Information</h2>
              <p>For questions about these Terms and Conditions, please contact:</p>
              <div className="highlight-box">
                <strong>CoreRx Returns</strong><br />
                225A Sunrise Hwy<br />
                Lynbrook, NY 11563<br /><br />
                <strong>Toll Free:</strong> 888-700-9896<br />
                <strong>Fax:</strong> 1-800-498-9028<br />
                <strong>Email:</strong> info@corerxreturns.com<br />
                <strong>Website:</strong> corerxreturns.com
              </div>

              <h2>12. Entire Agreement</h2>
              <p>These Terms and Conditions constitute the entire agreement between you and CoreRx regarding the Services and supersede all prior agreements and understandings.</p>

            </div>
          </div>
        </div>

        <div className="terms-modal-footer">
          <p>By using the CoreRx Returns Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
          <button
            type="button"
            className={`back-link ${!hasScrolledToBottom ? 'disabled' : ''}`}
            onClick={() => {
              if (hasScrolledToBottom && !isAccepted && onAccept) {
                onAccept();
              }
              onClose();
            }}
            disabled={!hasScrolledToBottom}
          >
            {hasScrolledToBottom ? (isAccepted ? "Return to Registration" : "Accept and Return") : "Scroll to bottom to Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
