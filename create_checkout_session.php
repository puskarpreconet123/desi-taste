<?php
/**
 * Desi Taste - Stripe Checkout Session Creator
 * Securely creates a session using raw cURL to avoid external package dependencies.
 */

// 1. Get the Stripe Secret Key from environment variables
$stripe_secret_key = getenv('STRIPE_SECRET_KEY');

if (!$stripe_secret_key) {
    // If not in standard environment, check $_ENV or $_SERVER
    if (isset($_ENV['STRIPE_SECRET_KEY'])) {
        $stripe_secret_key = $_ENV['STRIPE_SECRET_KEY'];
    } elseif (isset($_SERVER['STRIPE_SECRET_KEY'])) {
        $stripe_secret_key = $_SERVER['STRIPE_SECRET_KEY'];
    }
}

// 2. If Stripe Secret Key is missing, show a beautiful error page
if (empty($stripe_secret_key)) {
    http_response_code(500);
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Configuration Error | Desi Taste</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="css/style.css" />
    </head>
    <body class="bg-[#fdfaf7] min-h-screen flex items-center justify-center p-6 silk-texture">
        <div class="max-w-md w-full glass-premium p-8 text-center border border-[#c44b00]/20 rounded-3xl relative">
            <div class="menu-card-border-detail"></div>
            <span class="text-5xl block mb-4">⚠️</span>
            <h1 class="font-headline-md text-2xl text-[#231d1a] mb-3 font-semibold">Payment Config Error</h1>
            <p class="text-xs text-[#6e615b] leading-relaxed mb-6 font-light">
                The Stripe Payment Gateway is not configured. The administrator needs to set the <code class="bg-[#f6f1eb] text-[#c44b00] px-1.5 py-0.5 rounded font-mono text-[10px]">STRIPE_SECRET_KEY</code> environment variable in the hosting dashboard (e.g. Render).
            </p>
            <a href="payment.html" class="btn-luxury-secondary-light py-2 px-6 rounded-full inline-block text-xs">
                Back to Payments
            </a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// 3. Process the POST request and amount
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: payment.html');
    exit;
}

$amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0.0;
$reference = isset($_POST['reference']) ? htmlspecialchars(trim($_POST['reference']), ENT_QUOTES, 'UTF-8') : '';

// Validate amount
if ($amount <= 0.0) {
    header('Location: payment.html?error=invalid_amount');
    exit;
}

// Stripe expects amounts in cents (integers)
$amount_cents = intval(round($amount * 100));

// 4. Generate dynamic success and cancel redirect URLs
$proto = 'http';
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
    $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'];
} elseif (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    $proto = 'https';
}
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';

// Generate URLs back to the root of the project
$success_url = $proto . "://" . $host . "/payment_success.html?amount=" . urlencode($amount);
$cancel_url = $proto . "://" . $host . "/payment_cancel.html";

// 5. Build Stripe API Post Data
$data = [
    'payment_method_types' => ['card'],
    'line_items' => [
        [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => [
                    'name' => 'Secure Online Payment',
                    'description' => !empty($reference) ? "Ref: " . $reference : 'Desi Taste Indische Restaurant Payment',
                ],
                'unit_amount' => $amount_cents,
            ],
            'quantity' => 1,
        ]
    ],
    'mode' => 'payment',
    'success_url' => $success_url,
    'cancel_url' => $cancel_url,
];

$post_fields = http_build_query($data);

// 6. Initiate cURL Request to Stripe Checkout Session API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
curl_setopt($ch, CURLOPT_USERPWD, $stripe_secret_key . ":"); // Auth using API key as username, password is blank
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/x-www-form-urlencoded"
]);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// 7. Handle Stripe API Response
if ($http_status === 200 && $response) {
    $session = json_decode($response, true);
    if (isset($session['url'])) {
        // Redirect client to Stripe Checkout page
        header("Location: " . $session['url']);
        exit;
    }
}

// 8. Error handling for API errors
http_response_code(500);
$error_msg = "Could not create payment session. Please try again later.";
if ($response) {
    $error_data = json_decode($response, true);
    if (isset($error_data['error']['message'])) {
        $error_msg = htmlspecialchars($error_data['error']['message']);
    }
} elseif ($curl_error) {
    $error_msg = "Network Connection Error: " . htmlspecialchars($curl_error);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Payment Error | Desi Taste</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-[#fdfaf7] min-h-screen flex items-center justify-center p-6 silk-texture">
    <div class="max-w-md w-full glass-premium p-8 text-center border border-[#c44b00]/20 rounded-3xl relative">
        <div class="menu-card-border-detail"></div>
        <span class="text-5xl block mb-4">💳</span>
        <h1 class="font-headline-md text-2xl text-[#231d1a] mb-3 font-semibold">Payment Failed</h1>
        <p class="text-xs text-[#6e615b] leading-relaxed mb-6 font-light">
            <?php echo $error_msg; ?>
        </p>
        <a href="payment.html" class="btn-luxury-secondary-light py-2 px-6 rounded-full inline-block text-xs">
            Try Again
        </a>
    </div>
</body>
</html>
