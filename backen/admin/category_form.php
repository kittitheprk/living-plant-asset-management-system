<?php
require_once __DIR__ . '/../includes/auth.php';
requirePermission('category.manage');

$pdo = db();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nameTh = trim($_POST['name_th'] ?? '');
    if ($nameTh === '') {
        $errors[] = 'กรุณาระบุชื่อ';
    }

    if (!$errors) {
        $code = nextCategoryCode($pdo);
        $stmt = $pdo->prepare('INSERT INTO categories (code, name_th) VALUES (:code, :name_th)');
        $stmt->execute(['code' => $code, 'name_th' => $nameTh]);
        header('Location: categories.php');
        exit;
    }
}
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>เพิ่มประเภทพืช</title>
<link rel="stylesheet" href="../public/assets/css/style.css">
</head>
<body>
<div class="admin-wrap admin-wrap-narrow">
  <p><a class="btn-outline btn-sm" href="categories.php">&larr; กลับไปหน้าประเภทพืช</a></p>
  <h1>เพิ่มประเภทพืช</h1>
  <p class="field-hint">กรอกเป็นภาษาไทยอย่างเดียว — ระบบจะแปลเป็นอังกฤษ/จีนให้อัตโนมัติตอนผู้เข้าชมเปิดหน้าต้นไม้ด้วยภาษานั้น<?= AI_ENABLED ? '' : ' (ต้องตั้งค่า Gemini API key ก่อน — ดูที่หน้า <a href="settings.php#ai-translation">ตั้งค่า</a>)' ?></p>

  <?php foreach ($errors as $err): ?>
    <div class="flash error"><?= e($err) ?></div>
  <?php endforeach; ?>

  <form method="post">
    <label for="name_th">ชื่อ (ไทย)</label>
    <input type="text" id="name_th" name="name_th" value="<?= e($_POST['name_th'] ?? '') ?>" required autofocus>

    <p><button class="btn" type="submit">บันทึก</button></p>
  </form>
</div>
</body>
</html>
