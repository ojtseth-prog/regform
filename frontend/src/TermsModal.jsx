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

              <div className="highlight-box">
                <strong>IMPORTANT:</strong> By Using Core Rx Return Services, you affirm that you have read, understood, and agree to be bound by these Terms and Conditions that you have the legal authority to bind yourself and the entity you represent. You further represent and warrant that the medications are not suspect or illegitimate and were purchased from a licensed wholesaler whose information is listed above.
              </div>

              <p>Please read the following Terms and Conditions (these "Terms") carefully. The acceptability, valuation, and acceptance of any return is at the sole discretion of Core Rx Returns and/or the manufacturer. By returning goods to Core Rx Returns, you agree to the following Terms:</p>

              <h2>RETURNS - Process for Product Returns</h2>
              <p>In order to return acceptable returnable goods to Core Rx Returns, customers will be required to create an inventory list of items to be returned.</p>
              <p>Core Rx Returns requires the following from each returning entity: Inventory List, Transaction Information (TI): (A) the proprietary or established name or names of the product; (B) the strength and dosage form of the product; (C) the National Drug Code (NDC) number of the product; (D) the container size; (E) the number of containers; (F) the lot number of the product; (G) the date of the transaction; (H) the date of the shipment, if more than 24 hours after the date of the transaction; (I) the business name and address of the person from whom ownership is being transferred; and (J) the business name and address of the "person to whom ownership is being transferred."</p>
              <p>For Schedule II narcotics, a completed DEA Form 222 (Core Rx Returns will supply form)</p>
              <p>A Return Authorization (RA) will then be provided. If the required information noted above is not provided, no RA will be granted and no credit will be issued. Customer agrees to provide additional information as requested by Core Rx Returns. RA is required to return products. Credit will not be issued without prior notification and authorization of the return.</p>
              <p>All returns, once approved, must be accompanied by your inventory list showing NDC, Quantity, Lot #, Expiration Date. All returns must be received by the CoreRx Returns Return Agent, with the RA label attached on the exterior of the box and the inventory list contained within the box.</p>
              <p>This is the most efficient way to obtain authorization to return and obtain a return label and track the progress of your return. Returned quantities will be reviewed by Core Rx Returns, and final credit will be based on the manufacturer’s credit determination minus Core Rx Returns and wholesaler processing fees. Costs incurred by Core Rx Returns due to failure to follow these instructions, will be deducted from the credit issued.</p>
              <p>The percentage of unsalable products eligible for credit varies greatly and is influenced by product mix, inventory management, and whether opened (partial) or unopened. Manufacturer credit varies according to a specific manufacturer’s returned goods policy. Such policies and product eligibility criteria are constantly changing even without notice. An item for which the manufacturer provided credit in the past may no longer be eligible for credit, and vice versa. At times, manufacturers will take back credit previously issued to Core Rx Returns after that credit was already distributed to the end user/customer. In that case Core Rx Returns will withhold credit payments to that customer until the sum of the manufacturer’s chargeback is replaced.</p>
              <p>Core Rx Returns only accepts unsalable returns of prescription drugs, controlled drugs, including Class II-Vs, recalled drugs.</p>

              <h2>Returnable Product for Reimbursement</h2>
              <p>Full and partial containers of prescription drug products in original packaging</p>

              <h2>Returnable Items, No Reimbursement</h2>
              <p>The following may be returned for proper disposal only; customer acknowledges and agrees that there will be no reimbursement for: Reconstituted products, Products that require refrigeration or to be kept frozen with certain exceptions (e.g. certain insulin pens or other medications that manufacturers give credit for), Products packaged in tubes (e.g. creams, ointments) that are open, Products packaged in vials, syringes, and bags that are open, Inhaler/nasal products that are open or removed from the outer wrapping, Full containers of Over-the-Counter products</p>

              <h2>Non-returnable Product</h2>
              <p>Products in salable condition, Professional samples, Product(s) provided free of charge, donations, or labeled "clinical trials.", Products obtained from a source other than a source of normal distribution, Products purchased from another pharmacy or a prescriber, Products distributed outside of the U.S., Puerto Rico, and all U.S. territories, Products with labeling in a foreign language , Products purchased or otherwise obtained in violation of any Federal, State or local law or regulation, Products with a label defaced, removed, covered or unreadable., Products with a removed or missing or unreadable DEA, NDC, Lot number or expiration date where not caused by a previously affixed pharmacy label., Unauthorized returns, Products dispensed to patients, Returns are subject to acceptance by Core Rx Returns at its principal place of business. Notwithstanding any other provisions, wherever Core Rx Returns, in its sole discretion, has any doubt as to the source of the goods or whether they are counterfeit, Core Rx Returns reserves the right to place the goods into a "Transaction Hold". The Customer will be asked to provide accurate or complete information before the return will be accepted. If the Customer does not provide corrected Transaction Data within one hour of the request being made or if there is a question about the product being Suspect or Illegitimate or the accompanying documents being fraudulent, the return will be Quarantined without prior notice. Core Rx Returns does not accept Health and Beauty Care products, including private labels. Core Rx Returns will only issue credit on eligible products based on manufacturer policy.</p>

              <h2>Shipping</h2>
              <p>Unless expressly authorized in writing, freight charges for all returns are the responsibility of the customer. COD shipments will be refused. Insuring and tracking returns are the responsibility of the customer.</p>
              <p>For controlled substances, Customers will be notified immediately upon receipt of the return, of any mistakes, including shortages, in the controlled substance return. Failure of the customer to resolve the matter within 24 hours will obligate Core Rx Returns to report controlled product substance shortages directly to the DEA on a DEA-106, Report of Theft or Loss of controlled Substances, online at: www.deadiversion.usdoj.gov/21CFR_reorts/theft/index.html.</p>

              <h2>Payment Terms</h2>
              <p>All processing fees will be deducted from credits received. The processing fee for Core Rx Returns’ services is a percentage of actual credit received. Additional processing fees may be deducted for wholesaler processing.</p>
              <p>You will receive multiple credits and checks as the returns are processed.</p>
              <p>The percent of product’s return value for prescriptions drugs is determined by the manufacturer. Core Rx Returns does not determine actual credit issued. All processing fees will be subtracted from this amount.</p>
              <p>Core Rx Returns reserves the right to destroy without notification, credit, or return to the customer, any product return that does not conform to these terms and conditions. Customers are advised that the process from when you return product to Core Rx Returns to the time the manufacturer issues credit can take anywhere from 6-12 months. Since the expected credit paybacks from individual manufacturers is highly variable and constantly changing, we do not issue estimated credits amounts to the pharmacy.</p>
              <p>At times, manufacturers will take back credit previously issued to Core Rx Returns after that credit was already distributed to the end user/customer. In that case Core Rx Returns will withhold credit payments to that customer until the sum of the manufacturer’s chargeback is replaced. This retroactive credit reversal may occur months later and is beyond the control of Core Rx Returns.</p>

              <h2>Liability</h2>
              <p>Core Rx Returns shall have no responsibility or liability for products returned without prior notification.</p>
              <p>Core Rx Returns shall not be liable for any loss, claim, or damage resulting from products, delivery, or failure of delivery thereof, and the Pharmacy agrees to hold Core Rx Returns harmless for any such loss, claim, or damage.</p>
              <p>Any Core Rx Returns on product returns must be resolved within twelve (12) months of original return (debit memo) date.</p>

              <h2>Disclaimer</h2>
              <p>Core Rx Returns is not responsible for returns which are lost, damaged or not complaint with return procedures. Core Rx Returns reserves the right to make all final determinations. These terms and conditions may be modified by Core Rx Returns at its option, from time to time, upon written notice to customers.</p>

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
