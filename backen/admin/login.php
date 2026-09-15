<?php
require_once __DIR__ . '/../includes/auth.php';

startAdminSession();
$pdo = db();

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    if (attemptAdminLogin($pdo, $username, $password)) {
        header('Location: dashboard.php');
        exit;
    }
    $error = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
}
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>เข้าสู่ระบบผู้ดูแล</title>
<link rel="stylesheet" href="../public/assets/css/style.css">
</head>
<body>
<div class="admin-wrap admin-wrap-login">
  <h1>เข้าสู่ระบบผู้ดูแล</h1>
  <?php if ($error): ?><div class="flash error"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <label for="username">ชื่อผู้ใช้</label>
    <input type="text" id="username" name="username" required autofocus>
    <label for="password">รหัสผ่าน</label>
    <input type="password" id="password" name="password" required>
    <p><button class="btn" type="submit">เข้าสู่ระบบ</button></p>
  </form>
</div>
</body>
</html>
