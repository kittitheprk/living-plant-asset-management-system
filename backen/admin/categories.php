<?php
require_once __DIR__ . '/../includes/auth.php';
requirePermission('category.manage');

$pdo = db();
$categories = $pdo->query(
    'SELECT c.*, (SELECT COUNT(*) FROM species s WHERE s.category_code = c.code) AS species_count
     FROM categories c ORDER BY c.code ASC'
)->fetchAll();
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ผู้ดูแลระบบ — ประเภทพืช</title>
<link rel="stylesheet" href="../public/assets/css/style.css">
</head>
<body>
<div class="admin-wrap">
  <div class="topbar">
    <h1>ประเภทพืช</h1>
    <?php require __DIR__ . '/_nav.php'; ?>
  </div>

  <p><a class="btn" href="category_form.php">+ เพิ่มประเภทพืช</a></p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>ชื่อ</th><th>จำนวนชนิดพันธุ์</th><th></th></tr>
      </thead>
      <tbody>
        <?php foreach ($categories as $c): ?>
        <tr>
          <td><?= e($c['name_th']) ?></td>
          <td><?= (int) $c['species_count'] ?></td>
          <td>
            <?php if ((int) $c['species_count'] === 0): ?>
            <form class="inline" method="post" action="category_delete.php" data-confirm="ลบประเภทพืชนี้ใช่หรือไม่?">
              <input type="hidden" name="code" value="<?= e($c['code']) ?>">
              <button class="btn btn-sm btn-danger" type="submit">ลบ</button>
            </form>
            <?php endif; ?>
          </td>
        </tr>
        <?php endforeach; ?>
        <?php if (!$categories): ?>
        <tr><td colspan="3">ยังไม่มีประเภทพืช</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
  <p class="field-hint mb-lg">ประเภทพืชที่เพิ่มใหม่จะไปแสดงในตัวเลือก "ประเภทพืช" ตอนเพิ่ม/แก้ไขชนิดพันธุ์โดยอัตโนมัติ</p>
</div>
<?php require __DIR__ . '/_confirm_modal.php'; ?>
</body>
</html>
