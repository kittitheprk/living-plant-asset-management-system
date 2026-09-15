<?php
require_once __DIR__ . '/../includes/auth.php';
requirePermission('species.manage');

$pdo = db();
$speciesList = $pdo->query(
    'SELECT sp.*, (SELECT COUNT(*) FROM trees t WHERE t.species_id = sp.id) AS tree_count
     FROM species sp ORDER BY sp.name ASC'
)->fetchAll();
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ผู้ดูแลระบบ — ชนิดพันธุ์</title>
<link rel="stylesheet" href="../public/assets/css/style.css">
</head>
<body>
<div class="admin-wrap">
  <div class="topbar">
    <h1>ชนิดพันธุ์</h1>
    <?php require __DIR__ . '/_nav.php'; ?>
  </div>

  <p><a class="btn" href="species_form.php">+ เพิ่มชนิดพันธุ์</a></p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>รหัสจำแนกพันธุ์</th><th>ชื่อ</th><th>ชื่อวิทยาศาสตร์</th><th>จำนวนต้นไม้</th><th></th></tr>
      </thead>
      <tbody>
        <?php foreach ($speciesList as $sp): ?>
        <tr>
          <td><?= e($sp['classification_id'] ?? '') ?></td>
          <td><?= e($sp['name']) ?></td>
          <td><em><?= e($sp['name_scientific'] ?? '') ?></em></td>
          <td><?= (int) $sp['tree_count'] ?></td>
          <td>
            <div class="btn-row">
              <a class="btn-outline btn-sm" href="species_form.php?id=<?= (int) $sp['id'] ?>">แก้ไข</a>
              <?php if ((int) $sp['tree_count'] === 0): ?>
              <form class="inline" method="post" action="species_delete.php" data-confirm="ลบชนิดพันธุ์นี้ใช่หรือไม่?">
                <input type="hidden" name="id" value="<?= (int) $sp['id'] ?>">
                <button class="btn btn-sm btn-danger" type="submit">ลบ</button>
              </form>
              <?php endif; ?>
            </div>
          </td>
        </tr>
        <?php endforeach; ?>
        <?php if (!$speciesList): ?>
        <tr><td colspan="5">ยังไม่มีชนิดพันธุ์</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>
<?php require __DIR__ . '/_confirm_modal.php'; ?>
</body>
</html>
