<?php
// Отримуємо дані з форми
$name = $_POST['name'] ?? '';
$phone = $_POST['phone'] ?? '';
$size = $_POST['comment'] ?? '';
$price = $_POST['product_price'] ?? '1199'; // Дефолтна ціна, якщо не передана
$page_url = $_POST['page_url'] ?? '';
$page_title = $_POST['page_title'] ?? '';
$utm_source = $_POST['utm_source'] ?? '';
$utm_medium = $_POST['utm_medium'] ?? '';
$utm_campaign = $_POST['utm_campaign'] ?? '';
$utm_content = $_POST['utm_content'] ?? '';
$utm_term = $_POST['utm_term'] ?? '';

// Отримуємо IP-адресу
$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Не визначено';

// Валідація даних
if (empty($name) || empty($phone) || empty($size) || !in_array($price, ['1199', '1599', '1899', '2379'])) {
    file_put_contents('fb_api_log.txt', 'Invalid form data: ' . json_encode($_POST) . PHP_EOL, FILE_APPEND);
    header('Location: index.html');
    exit;
}

// Токен і chat_id твого Telegram-бота
$token = '8002574576:AAE4Vak-cMAVMAJB6EmjxXQrFCxkurBcSjQ';
$chat_id = '-1002427903134';

// Формуємо повідомлення з новою структурою
$message = "НОВА ЗАЯВКА 📋\n\n";
$message .= "Ім'я: $name\n";
$message .= "Телефон: $phone\n";
$message .= "Розмір: $size\n";
$message .= "Ціна: $price грн\n";
$message .= "IP адреса: $ip_address\n\n";
$message .= "🌐 Сайт: $page_url\n";
$message .= "📄 Назва сторінки: $page_title\n";
if (!empty($utm_source)) $message .= "📊 utm_source: $utm_source\n";
if (!empty($utm_medium)) $message .= "📊 utm_medium: $utm_medium\n";
if (!empty($utm_campaign)) $message .= "📊 utm_campaign: $utm_campaign\n";
if (!empty($utm_content)) $message .= "📊 utm_content: $utm_content\n";
if (!empty($utm_term)) $message .= "📊 utm_term: $utm_term\n";

// Відправляємо повідомлення у Telegram
$telegram_url = "https://api.telegram.org/bot$token/sendMessage?chat_id=$chat_id&text=" . urlencode($message);
file_get_contents($telegram_url);

// --- ВІДПРАВКА в Facebook Conversion API ---
$user_data = [
    'ph' => hash('sha256', preg_replace('/\D/', '', $phone)),
    'fn' => hash('sha256', mb_strtolower(trim($name), 'UTF-8')),
    'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'country' => hash('sha256', 'ua')
];

$access_token = 'EAAMAGLRNT74BOZCG2vI62XPB0fmiQRJLjkOs9rQbGSWIljYZBmL4w5IMM9szRp5eQxDdqX3fv2xIThtCUu1IJ66MB2ZADMFL1oTTdOc6kUtUtYJvySD0YRuJWJwlDp5ShET1IKBxBVKXeHeqIZBDaIQv6ZCuUZCXf4VuwpifxG9kxhIpiGkOe0ktm1iFncSQZDZD';
$pixel_id = '2723708877831670';

$event_id = uniqid();

$data = [
    'data' => [
        [
            'event_name' => 'Purchase',
            'event_time' => time(),
            'event_id' => $event_id,
            'user_data' => $user_data,
            'custom_data' => [
                'currency' => 'UAH',
                'value' => (float)$price
            ],
            'action_source' => 'website'
        ]
    ],
    'access_token' => $access_token
];

$ch = curl_init("https://graph.facebook.com/v18.0/$pixel_id/events");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);

if ($result === false) {
    file_put_contents('fb_api_log.txt', 'CURL Error: ' . curl_error($ch) . PHP_EOL, FILE_APPEND);
} else {
    $decoded_result = json_decode($result, true);
    if (isset($decoded_result['error'])) {
        file_put_contents('fb_api_log.txt', 'API Error: ' . json_encode($decoded_result['error']) . PHP_EOL, FILE_APPEND);
    } else {
        file_put_contents('fb_api_log.txt', 'Success: ' . $result . PHP_EOL, FILE_APPEND);
    }
}
curl_close($ch);

// Редірект на головну
header('Location: index.html');
exit;
?>