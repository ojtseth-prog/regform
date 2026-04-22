<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$db_host = "localhost";
$db_user = "u826896242_registration";
$db_password = "iMPACTPROTECH@2023";
$db_name = "u826896242_registration";

$conn = new mysqli($db_host, $db_user, $db_password, $db_name);


if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$pharmacy_name = $data['pharmacy_name'] ?? '';
$address = $data['address'] ?? '';
$contact_number = $data['contact_number'] ?? '';
$email_address = $data['email_address'] ?? '';

if (empty($pharmacy_name) || empty($address) || empty($contact_number) || empty($email_address)) {
    http_response_code(400);
    echo json_encode(["error" => "All pharmacy fields are required"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO registration (pharmacy_name, address, contact_number, email_address) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $pharmacy_name, $address, $contact_number, $email_address);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "message" => "Registration successful",
        "id" => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>