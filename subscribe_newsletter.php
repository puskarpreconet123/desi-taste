<?php
/**
 * Desi Taste - Newsletter Subscription Email Handler
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
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// 4. Validate Required Fields
if (empty($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Validate Email Syntax directly on raw input
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Sanitize email after validation
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// 5. Build Premium HTML Email Template
$to = 'desitaste363@gmail.com';
$subject = "✉️ New Newsletter Subscription - Desi Taste";

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
    <title>New Newsletter Subscription</title>
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
                            <h2 style='color: #1c1c19; font-family: \"Playfair Display\", Georgia, serif; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;'>New Newsletter Subscriber</h2>
                            <p style='color: #584238; font-size: 14px; line-height: 1.6; margin: 0;'>Hello, a user has subscribed to the newsletter on the Desi Taste website. Here is their email address:</p>
                        </td>
                    </tr>

                    <!-- Details Box -->
                    <tr>
                        <td style='padding: 20px 40px 30px 40px;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #f7f3ee; border-left: 4px solid #ffbe30; padding: 18px; border-radius: 4px 12px 12px 4px;'>
                                <tr>
                                    <td>
                                        <span style='color: #7b5800; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.5px;'>Subscriber Email</span>
                                        <a href='mailto:{$email}' style='color: #9c3f00; font-size: 16px; font-weight: bold; text-decoration: none;'>{$email}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Subtle disclaimer footer -->
                    <tr>
                        <td style='background-color: #ebe8e3; padding: 20px 40px; text-align: center; border-radius: 0 0 24px 24px;'>
                            <p style='color: #584238; font-size: 11px; margin: 0; line-height: 1.4;'>
                                This message was automatically sent from the newsletter subscription system on the official Desi Taste website.
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

if (send_html_mail($to, $subject, $message_body, $from_email, $email, 'Desi Taste')) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for subscribing! You are now on our list to receive exclusive offers and chef updates.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'The server encountered an error while processing your subscription. Please try again later.'
    ]);
}
exit;
