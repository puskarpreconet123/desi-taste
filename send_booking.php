<?php
/**
 * Desi Taste - Table Reservation Email Handler
 * Matches the warm gold and brown aesthetic of Desi Taste.
 */

// 1. Set Response Headers for JSON output
header('Content-Type: application/json; charset=utf-8');

// 2. Prevent Direct Access/Non-POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// 3. Extract, Clean and Sanitize Inputs
$name = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name']), ENT_QUOTES, 'UTF-8') : '';
$phone = isset($_POST['phone']) ? htmlspecialchars(trim($_POST['phone']), ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$guests = isset($_POST['guests']) ? htmlspecialchars(trim($_POST['guests']), ENT_QUOTES, 'UTF-8') : '';
$date = isset($_POST['date']) ? htmlspecialchars(trim($_POST['date']), ENT_QUOTES, 'UTF-8') : '';
$time = isset($_POST['time']) ? htmlspecialchars(trim($_POST['time']), ENT_QUOTES, 'UTF-8') : '';
$occasion = isset($_POST['occasion']) ? htmlspecialchars(trim($_POST['occasion']), ENT_QUOTES, 'UTF-8') : 'standard';
$message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message']), ENT_QUOTES, 'UTF-8') : '';

// Map occasion value to a user-friendly label
$occasions = [
    'standard' => 'Standard Lunch / Dinner',
    'birthday' => 'Birthday Celebration 🎂',
    'anniversary' => 'Anniversary 💖',
    'business' => 'Business Dinner 💼',
    'other' => 'Other Special Event ✨'
];
$occasion_label = isset($occasions[$occasion]) ? $occasions[$occasion] : $occasion;

// 4. Validate Required Fields
if (empty($name) || empty($phone) || empty($email) || empty($guests) || empty($date) || empty($time)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please fill out all required fields (*).'
    ]);
    exit;
}

// Validate Email Syntax directly on raw input (safeguards against typos)
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Sanitize email after validation for safe usage
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// Format Date safely (prevents defaulting to 01.01.1970 on bad input)
$timestamp = strtotime($date);
$formatted_date = ($timestamp !== false) ? date('d.m.Y', $timestamp) : $date;

// 5. Build Premium HTML Email Template
$to = 'desitaste363@gmail.com';

// Prevent Header Injection by stripping newline characters from dynamic subject fields
$name_clean_subject = str_replace(["\r", "\n"], '', $name);
$subject = "🍽️ New Table Reservation Request from " . $name_clean_subject;

// Detect host domain dynamically to ensure SPF alignment and prevent DMARC spam block
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'desitaste.de';
$host = preg_replace('/^www\./', '', $host);
if (strpos($host, '.') === false) {
    $host = 'desitaste.de'; // Safe fallback
}
$from_email = "no-reply@" . $host;

// (Email headers will be dynamically constructed in the robust sending function below)

// HTML Message Body with premium brown, gold, and warm styling
$message_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>New Table Reservation</title>
</head>
<body style='margin: 0; padding: 0; background-color: #fdf9f4; font-family: \"Be Vietnam Pro\", \"Helvetica Neue\", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
    <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #fdf9f4; padding: 40px 20px;'>
        <tr>
            <td align='center'>
                <!-- Main Email Card container -->
                <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e6e2dd; box-shadow: 0 8px 30px rgba(156, 63, 0, 0.04);'>
                    
                    <!-- Top Brand Header Banner -->
                    <tr>
                        <td align='center' style='background: linear-gradient(135deg, #9c3f00 0%, #7a3000 100%); padding: 40px 40px 35px 40px; border-bottom: 4px solid #ffbe30;'>
                            <h1 style='color: #ffffff; font-family: \"Playfair Display\", Georgia, serif; font-size: 28px; font-weight: 600; margin: 0 0 5px 0; letter-spacing: 1px;'>Desi Taste</h1>
                            <p style='color: #ffbe30; font-size: 11px; text-transform: uppercase; font-weight: 600; margin: 0; letter-spacing: 3px;'>Indische Restaurant</p>
                        </td>
                    </tr>

                    <!-- Intro Text -->
                    <tr>
                        <td style='padding: 40px 40px 10px 40px;'>
                            <h2 style='color: #1c1c19; font-family: \"Playfair Display\", Georgia, serif; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;'>Table Reservation Request</h2>
                            <p style='color: #584238; font-size: 14px; line-height: 1.6; margin: 0;'>Hello, you have received a new online table booking request from the Desi Taste website. Please review the details below:</p>
                        </td>
                    </tr>

                    <!-- Details Grid -->
                    <tr>
                        <td style='padding: 20px 40px 15px 40px;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse;'>
                                
                                <!-- Customer Name -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td width='35%' style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>Customer Name</td>
                                    <td width='65%' style='padding: 14px 0; color: #1c1c19; font-size: 15px; font-weight: 500;'>{$name}</td>
                                </tr>

                                <!-- Phone -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>Phone Number</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px;'>
                                        <a href='tel:{$phone}' style='color: #9c3f00; text-decoration: none; font-weight: 500;'>{$phone}</a>
                                    </td>
                                </tr>

                                <!-- Email -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>Email Address</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px;'>
                                        <a href='mailto:{$email}' style='color: #9c3f00; text-decoration: none; font-weight: 500;'>{$email}</a>
                                    </td>
                                </tr>

                                <!-- Date & Time -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>Date &amp; Time</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px; font-weight: bold;'>
                                        📅 {$formatted_date} &nbsp;|&nbsp; ⏰ {$time}
                                    </td>
                                </tr>

                                <!-- Guests -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>No. of Guests</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px; font-weight: 500;'>
                                        {$guests} " . ($guests == '1' ? 'Person' : 'People') . "
                                    </td>
                                </tr>

                                <!-- Occasion -->
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;'>Occasion</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px;'>
                                        {$occasion_label}
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
";

// If customer included a special request message, add a custom styling box for it
if (!empty($message)) {
    $message_body .= "
                    <!-- Special Requests Box -->
                    <tr>
                        <td style='padding: 15px 40px;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                                <tr>
                                    <td style='background-color: #f7f3ee; border-left: 4px solid #ffbe30; padding: 18px; border-radius: 4px 12px 12px 4px;'>
                                        <span style='color: #7b5800; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.5px;'>Special Requests &amp; Notes</span>
                                        <p style='color: #1c1c19; font-size: 13px; line-height: 1.5; margin: 0; font-style: italic;'>\"{$message}\"</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
    ";
}

$message_body .= "
                    <!-- Call-to-action Footer Links -->
                    <tr>
                        <td align='center' style='padding: 30px 40px 40px 40px;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-top: 1px solid #f1ede8; padding-top: 25px;'>
                                <tr>
                                    <td align='center'>
                                        <!-- Quick Reply Button -->
                                        <a href='mailto:{$email}?subject=Reservation Confirmation - Desi Taste' style='display: inline-block; background-color: #9c3f00; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 600; border-radius: 50px; box-shadow: 0 4px 12px rgba(156, 63, 0, 0.2); transition: all 0.3s ease;'>
                                            Confirm Reservation by Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Subtle disclaimer footer -->
                    <tr>
                        <td style='background-color: #ebe8e3; padding: 20px 40px; text-align: center; border-radius: 0 0 24px 24px;'>
                            <p style='color: #584238; font-size: 11px; margin: 0; line-height: 1.4;'>
                                This message was automatically sent from the booking system on the official Desi Taste website.
                            </p>
                            <p style='color: #8c7166; font-size: 10px; margin: 6px 0 0 0;'>
                                Klosterstraße 8, 14913 Jüterbog, Germany | Tel: +49 176 61686063
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";

// 6. Define Robust Mail Sender Function
function send_html_mail($to, $subject, $message_body, $from_email, $reply_to = '', $from_name = 'Desi Taste') {
    // 1. Try with \r\n and -f flag (Standard RFC compliant)
    $headers_crlf = "MIME-Version: 1.0\r\n";
    $headers_crlf .= "Content-Type: text/html; charset=UTF-8\r\n";
    if (!empty($reply_to)) {
        $headers_crlf .= "Reply-To: $reply_to\r\n";
    }
    $headers_crlf .= "From: $from_name <$from_email>\r\n";
    $headers_crlf .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    if (@mail($to, $subject, $message_body, $headers_crlf, "-f$from_email")) {
        return true;
    }

    // 2. Try with \r\n without -f flag
    if (@mail($to, $subject, $message_body, $headers_crlf)) {
        return true;
    }

    // 3. Try with \n line endings (Linux Postfix compatibility) and -f flag
    $headers_lf = "MIME-Version: 1.0\n";
    $headers_lf .= "Content-Type: text/html; charset=UTF-8\n";
    if (!empty($reply_to)) {
        $headers_lf .= "Reply-To: $reply_to\n";
    }
    $headers_lf .= "From: $from_name <$from_email>\n";
    $headers_lf .= "X-Mailer: PHP/" . phpversion() . "\n";

    if (@mail($to, $subject, $message_body, $headers_lf, "-f$from_email")) {
        return true;
    }

    // 4. Try with \n line endings without -f flag
    if (@mail($to, $subject, $message_body, $headers_lf)) {
        return true;
    }

    return false;
}

// Send email to restaurant owner
$owner_mail_success = send_html_mail($to, $subject, $message_body, $from_email, $email, 'Desi Taste Reservation');

// Send confirmation email to customer
$customer_subject = "🍽️ Your Table Reservation Request - Desi Taste";
$customer_message_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Reservation Request Received</title>
</head>
<body style='margin: 0; padding: 0; background-color: #fdf9f4; font-family: \"Be Vietnam Pro\", \"Helvetica Neue\", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
    <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #fdf9f4; padding: 40px 20px;'>
        <tr>
            <td align='center'>
                <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e6e2dd; box-shadow: 0 8px 30px rgba(156, 63, 0, 0.04);'>
                    <tr>
                        <td align='center' style='background: linear-gradient(135deg, #9c3f00 0%, #7a3000 100%); padding: 40px 40px 35px 40px; border-bottom: 4px solid #ffbe30;'>
                            <h1 style='color: #ffffff; font-family: \"Playfair Display\", Georgia, serif; font-size: 28px; font-weight: 600; margin: 0 0 5px 0; letter-spacing: 1px;'>Desi Taste</h1>
                            <p style='color: #ffbe30; font-size: 11px; text-transform: uppercase; font-weight: 600; margin: 0; letter-spacing: 3px;'>Indische Restaurant</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px 40px 10px 40px;'>
                            <h2 style='color: #1c1c19; font-family: \"Playfair Display\", Georgia, serif; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;'>Dear {$name},</h2>
                            <p style='color: #584238; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;'>Thank you for your table reservation request. We have received your booking details and will finalize your reservation shortly.</p>
                            <p style='color: #584238; font-size: 14px; line-height: 1.6; margin: 0;'>Here is a summary of your requested reservation details:</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 20px 40px 15px 40px;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse;'>
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td width='35%' style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase;'>Guests</td>
                                    <td width='65%' style='padding: 14px 0; color: #1c1c19; font-size: 15px; font-weight: 500;'>{$guests} " . ($guests == '1' ? 'Person' : 'People') . "</td>
                                </tr>
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase;'>Date &amp; Time</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px; font-weight: bold;'>📅 {$formatted_date} &nbsp;|&nbsp; ⏰ {$time}</td>
                                </tr>
                                <tr style='border-bottom: 1px solid #f1ede8;'>
                                    <td style='padding: 14px 0; color: #7b5800; font-size: 13px; font-weight: 600; text-transform: uppercase;'>Occasion</td>
                                    <td style='padding: 14px 0; color: #1c1c19; font-size: 15px;'>{$occasion_label}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 15px 40px;'>
                            <p style='color: #584238; font-size: 13px; line-height: 1.6; margin: 0;'>Please note: This is a request receipt. Our team will verify table availability for your selected date and time and follow up with a final confirmation email or phone call.</p>
                            <p style='color: #584238; font-size: 13px; line-height: 1.6; margin: 15px 0 0 0;'>If you need to change or cancel your reservation, please call us directly at <a href='tel:+4917661686063' style='color: #9c3f00; text-decoration: none; font-weight: bold;'>+49 176 61686063</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='background-color: #ebe8e3; padding: 20px 40px; text-align: center; border-radius: 0 0 24px 24px;'>
                            <p style='color: #584238; font-size: 11px; margin: 0; line-height: 1.4;'>We look forward to welcoming you to Desi Taste!</p>
                            <p style='color: #8c7166; font-size: 10px; margin: 6px 0 0 0;'>Klosterstraße 8, 14913 Jüterbog, Germany | Tel: +49 176 61686063</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
@send_html_mail($email, $customer_subject, $customer_message_body, $from_email, '', 'Desi Taste');

// Check owner mail success for API response
if ($owner_mail_success) {
    echo json_encode([
        'success' => true,
        'message' => 'Reservation request successfully received and email dispatched.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'The server encountered an error while dispatching your request email. Please try again or call the restaurant directly.'
    ]);
}
exit;
