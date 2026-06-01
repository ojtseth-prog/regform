 <?php
// 1. Headers first to prevent CORS blocks during potential crashes
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── Terms Acceptance Validation ─────────────────────────────────────────────
// Must accept terms before registration can proceed
$terms_accepted = isset($_POST['terms_accepted']) && $_POST['terms_accepted'] === '1';
if (!$terms_accepted) {
    echo json_encode(["success" => false, "error" => "You must accept the Terms and Conditions to complete registration."]);
    exit();
}

require_once __DIR__ . '/vendor/autoload.php';

// Manually load FPDF since Composer sometimes misses the global alias
$fpdf_path = __DIR__ . '/vendor/setasign/fpdf/fpdf.php';
if (file_exists($fpdf_path)) {
    require_once $fpdf_path;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ─── Config ───────────────────────────────────────────────────────────────────
$db_host       = "localhost";
$db_user       = "u416162286_new_dbcallify";
$db_password   = "iMPACTPROTECH@2023";
$db_name       = "u416162286_new_dbcallify";
$admin_email   = "info@corerxreturns.com";
$smtp_user     = "allen@impactproph.com";
$smtp_password = "jtie zdrt npms lgcd";
$upload_dir    = __DIR__ . '/uploads/';
$reg_time = date('m/d/Y h:i A');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function postVal(string $key, string $default = ''): string {
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : $default;
}

function h($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

function formatPhone(string $raw): string {
    $digits = preg_replace('/\D/', '', $raw);
    if (strlen($digits) === 10) {
        return '1(' . substr($digits, 0, 3) . ')-' . substr($digits, 3, 3) . '-' . substr($digits, 6, 4);
    } elseif (strlen($digits) === 11 && $digits[0] === '1') {
        return '1(' . substr($digits, 1, 3) . ')-' . substr($digits, 4, 3) . '-' . substr($digits, 7, 4);
    }
    return $digits;
}

function saveBase64Image($base64String, $outputFile) {
    $data = explode(',', $base64String);
    if (count($data) > 1) {
        return file_put_contents($outputFile, base64_decode($data[1]));
    }
    return false;
}

// ─── Collect fields ───────────────────────────────────────────────────────────
$pharmacy_name   = postVal('pharmacy_name');
$dba_name        = postVal('dba_name');
$address         = postVal('address');
$city            = postVal('city');
$state           = postVal('state');
$zip_code        = postVal('zip_code');
$contact_number  = formatPhone(postVal('contact_number'));
$mobile          = formatPhone(postVal('mobile'));
$fax             = formatPhone(postVal('fax'));
$email_address   = postVal('email_address');
$contact_person  = postVal('contact_person');
$authorized_name = postVal('authorized_name');

// Wholesalers
$wholesalers = [];
// Map the primary field from React to the first wholesaler
$primary_wholesaler = postVal('drug_wholesaler'); 

for($i=1; $i<=3; $i++) {
    $wholesalers[$i] = [
        // If it's the first one, use the primary value, otherwise look for drug_wholesaler_2/3
        'name' => ($i === 1) ? $primary_wholesaler : postVal("drug_wholesaler_$i"),
        'acct' => postVal("account_number_$i"),
        'addr' => postVal("wholesaler_address_$i"),
        'city' => postVal("wholesaler_city_$i"),
        'stat' => postVal("wholesaler_state_$i"),
        'zip'  => postVal("wholesaler_zip_$i"),
    ];
}

// Manufacturers
$manufacturers = [];
for($i=1; $i<=3; $i++) {
    $manufacturers[$i] = [
        'name' => postVal("manufacturer_$i"),
        'acct' => postVal("manufacturer_acct_$i")
    ];
}

$signed_date = postVal('signed_date', date('m/d/Y'));

// --- SAVE SIGNATURE IMAGE (Now that we have $inserted_id) ---
$sig_file_path = $upload_dir . 'sig_' . $inserted_id . '.png';
$has_signature = false;
$signature_data = postVal('signature_image'); // Get from React

if (!empty($signature_data)) {
    $has_signature = saveBase64Image($signature_data, $sig_file_path);
}


// ─── DB connect ───────────────────────────────────────────────────────────────
$conn = new mysqli($db_host, $db_user, $db_password, $db_name);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit();
}
$conn->set_charset('utf8mb4');

// ─── File uploads ─────────────────────────────────────────────────────────────
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

function uploadFile(string $key) {
    global $upload_dir;
    if (!isset($_FILES[$key]) || $_FILES[$key]['error'] !== UPLOAD_ERR_OK) return null;
    $ext  = pathinfo($_FILES[$key]['name'], PATHINFO_EXTENSION);
    $name = $key . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    return move_uploaded_file($_FILES[$key]['tmp_name'], $upload_dir . $name) ? $name : null;
}

$state_lic_file = uploadFile('state_lic_file');
$dea_lic_file   = uploadFile('dea_lic_file');
$state_lic_original = isset($_FILES['state_lic_file']['name']) ? $_FILES['state_lic_file']['name'] : '';
$dea_lic_original   = isset($_FILES['dea_lic_file']['name']) ? $_FILES['dea_lic_file']['name'] : '';

// ─── DB Insert ────────────────────────────────────────────────────────────────
$sql = "INSERT INTO registration (pharmacy_name, dba_name, address, city, state, zip_code, contact_number, mobile, email_address, contact_person, drug_wholesaler, authorized_name, state_lic_file, dea_lic_file, `timestamp`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW())";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssssssssss", $pharmacy_name, $dba_name, $address, $city, $state, $zip_code, $contact_number, $mobile, $email_address, $contact_person, $wholesalers[1]['name'], $authorized_name, $state_lic_file, $dea_lic_file);
$stmt->execute();
$inserted_id = $stmt->insert_id;
$stmt->close();

// ─── Generate PDF via FPDF ──────────────────────────────────────────────────
$pdf_filename = 'Application_' . $inserted_id . '_' . time() . '.pdf';
$pdf_path = $upload_dir . $pdf_filename;

try {
    $pdf = new \FPDF('P', 'mm', 'Letter');
    $pdf->AddFont('Calibri', '', 'calibri.php');
    $pdf->AddFont('Calibri', 'B', 'calibrib.php');
    $pdf->AddPage();
    $pdf->SetAutoPageBreak(false);

    $fontMain = 'Calibri'; 
    $left_m = 10;
    $width = 196;

    // --- 1. HEADER SECTION ---
    $logo_path = __DIR__ . '/pics/corerx.jpeg';
    if (file_exists($logo_path)) {
        $pdf->Image($logo_path, 90, 8, 35);
    }
    $pdf->SetY(44);
    $pdf->SetFont($fontMain, 'B', 16);
    $pdf->Cell(0, 6, 'REVERSE DISTRIBUTION SERVICES', 0, 1, 'C');
    $pdf->SetFont($fontMain, 'BU', 14);
    $pdf->Cell(0, 6, 'Customer Information Form', 0, 1, 'C');
    $pdf->Ln(2);

    /**
     * UPDATED HELPER: Label and Bold Value on same line with custom sizes
     * $lSize = Label Font Size
     * $vSize = Value Font Size
     */
 $drawCustomRow = function($x, $y, $w, $h, $label, $value, $lSize = 8.5, $vSize = 10.5, $border = '1') use ($pdf, $fontMain) {
        // Position for the border box
        $pdf->SetXY($x, $y);
        // This draws the borders using TBLR logic
        $pdf->Cell($w, $h, '', $border); 

        // Position back inside the box for text
        $pdf->SetXY($x + 1.5, $y);
        $pdf->SetFont($fontMain, '', $lSize);
        $label_w = $pdf->GetStringWidth($label) + 1.5;
        $pdf->Cell($label_w, $h, iconv('UTF-8', 'windows-1252', $label), 0, 0, 'L');
        
        $pdf->SetFont($fontMain, 'B', $vSize);
        $val = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', (string)$value);
        $pdf->Cell(0, $h, $val, 0, 0, 'L');
    };

    $curr_y = $pdf->GetY();

    // --- SECTION 1: CUSTOMER INFO ---
    $drawCustomRow($left_m, $curr_y, $width, 9, 'Corporate Name:', $pharmacy_name, 16, 14, '1'); $curr_y += 9;
    $drawCustomRow($left_m, $curr_y, $width, 9, 'DBA Name:', $dba_name, 18, 14, '1'); $curr_y += 9;
    $drawCustomRow($left_m, $curr_y, $width, 9, 'Address:', $address, 14, 12, '1'); $curr_y += 9;
    
    // City, State, Zip (State & Zip hide Left border)
    $col3 = $width / 3;
    $drawCustomRow($left_m, $curr_y, $col3, 8, 'City:', $city, 12, 12, 'LTB');
    $drawCustomRow($left_m + $col3, $curr_y, $col3, 8, 'State:', $state, 12, 12, 'TB');
    $drawCustomRow($left_m + ($col3*2), $curr_y, $col3, 8, 'Zip Code:', $zip_code, 12, 12, 'TBR');
    $curr_y += 8;

    // Phone, Fax (Fax hides Left border)
    $col2 = $width / 2;
    $drawCustomRow($left_m, $curr_y, $col2, 8, 'Phone:', $contact_number, 12, 12, 'LTB');
    $drawCustomRow($left_m + $col2, $curr_y, $col2, 8, 'Fax:', $fax, 12, 12, 'TBR');
    $curr_y += 8;

    // Mobile, Email (Email hides Left border)
    $drawCustomRow($left_m, $curr_y, $col2, 8, 'Mobile:', $mobile, 12, 12, 'LTB');
    $drawCustomRow($left_m + $col2, $curr_y, $col2, 8, 'Email:', $email_address, 12, 12, 'TBR');
    $curr_y += 8;

    $drawCustomRow($left_m, $curr_y, $width, 8, 'Contact Name:', $contact_person, 11, 11, '1'); $curr_y += 8;

    // Licenses (Exp Dates hide Left border)
    $licW = 115; $expW = 81;
    $drawCustomRow($left_m, $curr_y, $licW, 8, 'State Lic. No:', ($state_lic_file ? $state_lic_original : ''), 18, 11, '1');
    $drawCustomRow($left_m + $licW, $curr_y, $expW, 8, 'Exp Date:', '', 14, 14, 'TBR');
    $curr_y += 8;

    $drawCustomRow($left_m, $curr_y, $licW, 8, 'DEA Lic. No:', ($dea_lic_file ? $dea_lic_original : ''), 18, 11, '1');
    $drawCustomRow($left_m + $licW, $curr_y, $expW, 8, 'Exp Date:', '', 14, 14, 'TBR');
    $curr_y += 8;

    // --- SECTION 2: WHOLESALER ---
// --- SECTION 2: WHOLESALER ---
    $pdf->SetFont($fontMain, 'BU', 14);
    $pdf->SetXY($left_m, $curr_y);
    $pdf->Cell($width, 6, 'Wholesaler/Supplier Information', 0, 1, 'C');
    $curr_y += 6;

    $ws_w = $width / 3;

    // Row 1: Labels only ("Drug Wholesaler")
    $pdf->SetFont($fontMain, '', 14);
    for ($i = 1; $i <= 3; $i++) {
        $border = ($i === 1) ? 'LT' : 'T'; // Match merged look
        $pdf->SetXY($left_m + (($i-1)*$ws_w), $curr_y);
        $pdf->Cell($ws_w, 6, 'Drug Wholesaler', 'LTR'); 
    }
    $curr_y += 6;

    // Row 2: ACTUAL VALUES (The names go here)
    $pdf->SetFont($fontMain, 'B', 14);
    for ($i = 1; $i <= 3; $i++) {
        $pdf->SetXY($left_m + (($i-1)*$ws_w), $curr_y);
        $val = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $wholesalers[$i]['name']);
        $pdf->Cell($ws_w, 8, $val, 'TLBR', 0, 'L'); // Centered bold name
    }
    $curr_y += 8;

    // Row 3: Account# (Labels + Values)
    for ($i = 1; $i <= 3; $i++) {
        $hasL = ($i === 1) ? '1' : 'TBR';
        $drawCustomRow($left_m + (($i-1)*$ws_w), $curr_y, $ws_w, 7, 'Account#:', $wholesalers[$i]['acct'], 16, 16, $hasL);
    }
    $curr_y += 7;

    // Row 4: Address
    for ($i = 1; $i <= 3; $i++) {
        $hasL = ($i === 1) ? '1' : 'TBR';
        $drawCustomRow($left_m + (($i-1)*$ws_w), $curr_y, $ws_w, 7, 'Address:', $wholesalers[$i]['addr'], 10, 10, $hasL);
    }
    $curr_y += 7;

    // WH Stacked
    for ($i = 1; $i <= 3; $i++) {
        $x = $left_m + (($i-1)*$ws_w);
        $b = ($i === 1) ? 1 : 'TBR';
        $pdf->SetXY($x, $curr_y);
        $pdf->Cell($ws_w, 15, '', $b); 
        
        $pdf->SetXY($x + 1.5, $curr_y + 0.5); 
        $pdf->SetFont($fontMain, '', 10); $pdf->Cell(8, 5, 'City:'); 
        $pdf->SetFont($fontMain, 'B', 8.5); $pdf->Cell(0, 5, $wholesalers[$i]['city']);
        $pdf->SetXY($x + 1.5, $curr_y + 5); 
        $pdf->SetFont($fontMain, '', 10); $pdf->Cell(10, 5, 'State:'); 
        $pdf->SetFont($fontMain, 'B', 8.5); $pdf->Cell(0, 5, $wholesalers[$i]['stat']);
        $pdf->SetXY($x + 1.5, $curr_y + 9.5); 
        $pdf->SetFont($fontMain, '', 10); $pdf->Cell(8, 5, 'ZIP:'); 
        $pdf->SetFont($fontMain, 'B', 8.5); $pdf->Cell(0, 5, $wholesalers[$i]['zip']);
    }
    $curr_y += 15;

    // --- SECTION 3: MANUFACTURER ---
    $pdf->SetFont($fontMain, 'BU', 14);
    $pdf->SetXY($left_m, $curr_y);
    $pdf->Cell($width, 6, 'Manufacturer Direct Account', 0, 1, 'C');
    $curr_y += 6;

    for ($i = 1; $i <= 3; $i++) {
        $drawCustomRow($left_m, $curr_y, 115, 7, 'Manufacturer:', $manufacturers[$i]['name'], 14, 14, '1');
        $drawCustomRow($left_m + 115, $curr_y, 81, 7, 'Account No.:', $manufacturers[$i]['acct'], 14, 14, 'TBR');
        $curr_y += 7;
    }

    // --- TERMS & SIGNATURE ---
    $pdf->Ln(8); 
    $pdf->SetFont($fontMain, 'B', 10);
    $pdf->Cell(0, 5, 'Please attach a copy of a Valid State and DEA License', 0, 1, 'C');
    $pdf->Cell(0, 5, 'Please attach a copy of your current/active Wholesaler Invoice', 0, 1, 'C');
    $pdf->Ln(5);
    $pdf->SetFont($fontMain, 'B', 10);
    $terms_text = "By using the Core Rx Return Services, you affirm that you have read, understood and agree to be bound by these Terms and Conditions that you have the legal authority to bind yourself and the entity you represent. You further represent and warrant that the medications are not suspect or illegitimate and were purchased from a licensed wholesaler whose information is listed above.";

    $pdf->MultiCell($width, 6, iconv('UTF-8', 'windows-1252', $terms_text), 0, 'J');

   // --- SIGNATURE SECTION ---
// --- SIGNATURE SECTION ---
    $pdf->Ln(8);
    $current_sig_y = $pdf->GetY();
    
    $pdf->SetFont($fontMain, '', 10);
    $pdf->Cell(30, 8, 'Authorized Name:', 0, 0);
    $pdf->SetFont($fontMain, 'B', 10);
    $pdf->Cell(55, 8, iconv('UTF-8', 'ASCII//TRANSLIT', $authorized_name), 'B', 0);
    
    $pdf->SetFont($fontMain, '', 10);
    $pdf->Cell(20, 8, '  Signature:', 0, 0);
    
    // Position the image exactly on the signature line
if ($has_signature && file_exists($sig_file_path)) {
    // Increase the width to 50 or 60 to compensate for the non-trimmed margins
    $pdf->Image($sig_file_path, $pdf->GetX(), $current_sig_y - 6, 50, 15);
}
    $pdf->Cell(45, 8, '', 'B', 0); 
    
    $pdf->Cell(12, 8, '  Date:', 0, 0);
    $pdf->SetFont($fontMain, 'B', 10);
    $pdf->Cell(34, 8, $signed_date, 'B', 1);

    // --- FOOTER ---
    $pdf->SetY(265);
    $pdf->SetFont($fontMain, '', 9);
    $pdf->SetTextColor(100);
    $pdf->Cell(0, 4, '225A Sunrise Hwy Lynbrook, NY 11563     TOLL FREE 888-700-9896     FAX 1-800-498-9028     INFO@CORERXRETURNS.COM', 0, 0, 'C');

    $pdf->Output('F', $pdf_path);
} catch (Exception $e) {
    error_log("PDF Error: " . $e->getMessage());
    $pdf_path = null;
}

// ─── Send Email ───────────────────────────────────────────────────────────────
$mail = new PHPMailer(true);
$mail_sent = false;
$pdf_actually_generated = false;
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_user;
    $mail->Password   = $smtp_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom($smtp_user, 'CoreRx Pharmacy Registration');
    $mail->addAddress($admin_email);
    $mail->addReplyTo($email_address, $pharmacy_name);

    // Attachments
    if ($pdf_path && file_exists($pdf_path)) {
        $mail->addAttachment($pdf_path, 'CoreRx_Application_Form.pdf');
    }
    if ($state_lic_file && file_exists($upload_dir . $state_lic_file)) {
        $mail->addAttachment($upload_dir . $state_lic_file, 'State_License.' . pathinfo($state_lic_file, PATHINFO_EXTENSION));
    }
    if ($dea_lic_file && file_exists($upload_dir . $dea_lic_file)) {
        $mail->addAttachment($upload_dir . $dea_lic_file, 'DEA_License.' . pathinfo($dea_lic_file, PATHINFO_EXTENSION));
    }

    $mail->isHTML(true);
    $mail->Subject = "NEW PHARMACY REGISTRATION from  {$pharmacy_name}";
 $mail->Body = "
    <div style='background-color: #f4f7f6; padding: 30px; font-family: Arial, sans-serif;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;'>
            <!-- Header -->
            <div style='background-color: #004a99; padding: 20px; text-align: center;'>
                <h2 style='color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;'>New Pharmacy Registration</h2>
            </div>
            
            <!-- Body -->
            <div style='padding: 25px; color: #333333; line-height: 1.6;'>
                <p style='margin-top: 0;'>Good Day,</p>
                <p>A new pharmacy registration has been submitted through the portal. Below are the key details:</p>
                
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 150px; color: #666;'>Pharmacy Name</td>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>".h($pharmacy_name)."</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #666;'>Contact Person</td>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>".h($contact_person)."</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #666;'>Email Address</td>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'><a href='mailto:".h($email_address)."' style='color: #004a99; text-decoration: none;'>".h($email_address)."</a></td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #666;'>Submission Date</td>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>$reg_time</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #666;'>Registration ID</td>
                        <td style='padding: 10px; border-bottom: 1px solid #eeeeee;'>#$inserted_id</td>
                    </tr>
                </table>

                <div style='background-color: #fff9e6; border-left: 4px solid #ffcc00; padding: 15px; margin-top: 20px;'>
                    <p style='margin: 0; font-size: 13px; color: #856404;'>
                        <strong>Note:</strong> The completed Application Form (PDF), State License, and DEA License have been attached to this email for your review.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style='background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;'>
                This is an automated notification from CoreRx Returns Portal.
            </div>
        </div>
    </div>";


    $mail->send();
    $mail_sent = true;
       if ($mail_sent) {
        // 1. Delete the generated PDF
        if (file_exists($pdf_path)) unlink($pdf_path);
        
        // 2. Delete the signature image
        if (file_exists($sig_file_path)) unlink($sig_file_path);
        
        // 3. Delete the uploaded State License
       // if (!empty($state_lic_file)) {
       //     $state_path = $upload_dir . $state_lic_file;
       //     if (file_exists($state_path)) unlink($state_path);
       // }
        
        // 4. Delete the uploaded DEA License
      //  if (!empty($dea_lic_file)) {
       //     $dea_path = $upload_dir . $dea_lic_file;
       //     if (file_exists($dea_path)) unlink($dea_path);
       // }
    }

} catch (Exception $e) {
    error_log("Mail Error: " . $mail->ErrorInfo);
}

// ─── Response ───
echo json_encode([
    "success" => true, 
    "email_sent" => $mail_sent, 
    "pdf_generated" => $pdf_actually_generated 
]);
exit();