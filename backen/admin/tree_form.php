<?php
require_once __DIR__ . '/../includes/auth.php';
requireAdmin();

$pdo = db();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
requirePermission($id ? 'tree.update' : 'tree.create');
$tree = null;
if ($id) {
    $stmt = $pdo->prepare('SELECT * FROM trees WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $tree = $stmt->fetch();
    if (!$tree) {
        http_response_code(404);
        exit('ไม่พบต้นไม้นี้');
    }
}

$errors = [];

$speciesList = getAllSpecies($pdo);
$zones = getAllZones($pdo);
$statuses = ['healthy' => 'สมบูรณ์', 'needs_attention' => 'ต้องดูแล', 'removed' => 'นำออกแล้ว'];
$healthLabels = ['good' => 'ดี', 'fair' => 'พอใช้', 'poor' => 'ทรุดโทรม'];
$observations = $id ? getObservationsForTree($pdo, $id) : [];
$maintenanceLogs = $id ? getMaintenanceLogsForTree($pdo, $id) : [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $speciesId = (int) ($_POST['species_id'] ?? 0);
    $zoneId = (int) ($_POST['zone_id'] ?? 0);
    $areaCode = trim($_POST['area_code'] ?? '');
    $label = trim($_POST['label'] ?? '') ?: null;
    $status = $_POST['status'] ?? 'healthy';
    $slug = trim($_POST['slug'] ?? '') ?: null;
    $mapUrl = trim($_POST['map_url'] ?? '') ?: null;
    $displayOrder = (int) ($_POST['display_order'] ?? 0);
    $isActive = isset($_POST['is_active']) ? 1 : 0;

    $latitudeRaw = trim($_POST['latitude'] ?? '');
    $longitudeRaw = trim($_POST['longitude'] ?? '');
    $latitude = $latitudeRaw !== '' ? (float) $latitudeRaw : null;
    $longitude = $longitudeRaw !== '' ? (float) $longitudeRaw : null;

    if (!$speciesId || !getSpeciesById($pdo, $speciesId)) {
        $errors[] = 'กรุณาเลือกชนิดพันธุ์ให้ถูกต้อง';
    }
    if (!$zoneId || !getZoneById($pdo, $zoneId)) {
        $errors[] = 'กรุณาเลือกโซนให้ถูกต้อง';
    }
    if (!preg_match('/^\d{2}$/', $areaCode)) {
        $errors[] = 'พื้นที่ในสวนต้องเป็นตัวเลข 2 หลัก';
    }
    if (!isset($statuses[$status])) {
        $errors[] = 'สถานะไม่ถูกต้อง';
    }
    if ($latitudeRaw !== '' && ($latitude < -90 || $latitude > 90)) {
        $errors[] = 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90';
    }
    if ($longitudeRaw !== '' && ($longitude < -180 || $longitude > 180)) {
        $errors[] = 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180';
    }
    if ($slug !== null) {
        $dupSlugStmt = $pdo->prepare('SELECT id FROM trees WHERE slug = :slug AND id != :id');
        $dupSlugStmt->execute(['slug' => $slug, 'id' => $id]);
        if ($dupSlugStmt->fetchColumn() !== false) {
            $errors[] = "สลัก \"$slug\" ถูกใช้โดยต้นไม้อื่นแล้ว กรุณาใช้ค่าอื่น";
        }
    }
    if ($displayOrder <= 0) {
        $errors[] = 'ลำดับการแสดงผลต้องเป็นจำนวนบวก';
    } else {
        $dupStmt = $pdo->prepare('SELECT id FROM trees WHERE display_order = :order AND id != :id');
        $dupStmt->execute(['order' => $displayOrder, 'id' => $id]);
        if ($dupStmt->fetchColumn() !== false) {
            $errors[] = "ลำดับการแสดงผล $displayOrder ถูกใช้โดยต้นไม้อื่นแล้ว กรุณาใช้ลำดับอื่น";
        }
    }

    // Uploaded files replace the existing image only if a new one was chosen;
    // otherwise the tree keeps whatever it already had (null on create).
    $imagePath = $tree['image_path'] ?? null;
    $mapImagePath = $tree['map_image_path'] ?? null;
    $newImagePath = null;
    $newMapImagePath = null;

    if (!$errors) {
        try {
            $newImagePath = saveUploadedImage($_FILES['image'] ?? [], 'tree');
            $newMapImagePath = saveUploadedImage($_FILES['map_image'] ?? [], 'maps');
        } catch (RuntimeException $e) {
            $errors[] = $e->getMessage();
        }
    }

    if (!$errors) {
        if ($newImagePath !== null) {
            $imagePath = $newImagePath;
        }
        if ($newMapImagePath !== null) {
            $mapImagePath = $newMapImagePath;
        }

        // Only bump location_updated_at when the coordinates actually change,
        // so re-saving the form for unrelated edits doesn't look like a move.
        $prevLat = isset($tree['latitude']) ? (float) $tree['latitude'] : null;
        $prevLng = isset($tree['longitude']) ? (float) $tree['longitude'] : null;
        $locationChanged = $latitude !== $prevLat || $longitude !== $prevLng;
        $locationUpdatedAt = $locationChanged ? date('Y-m-d H:i:s') : ($tree['location_updated_at'] ?? null);

        $params = [
            'species_id' => $speciesId, 'zone_id' => $zoneId, 'area_code' => $areaCode, 'label' => $label, 'status' => $status,
            'slug' => $slug,
            'image_path' => $imagePath, 'map_image_path' => $mapImagePath, 'map_url' => $mapUrl,
            'latitude' => $latitude, 'longitude' => $longitude, 'location_updated_at' => $locationUpdatedAt,
            'display_order' => $displayOrder, 'is_active' => $isActive,
        ];

        try {
            if ($id) {
                $stmt = $pdo->prepare(
                    'UPDATE trees SET species_id=:species_id, zone_id=:zone_id, area_code=:area_code, label=:label, status=:status,
                     slug=:slug, image_path=:image_path, map_image_path=:map_image_path, map_url=:map_url,
                     latitude=:latitude, longitude=:longitude, location_updated_at=:location_updated_at,
                     display_order=:display_order, is_active=:is_active
                     WHERE id=:id'
                );
                $stmt->execute($params + ['id' => $id]);
                $treeId = $id;
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO trees (species_id, zone_id, area_code, label, status, slug, image_path, map_image_path, map_url,
                     latitude, longitude, location_updated_at, display_order, is_active)
                     VALUES (:species_id, :zone_id, :area_code, :label, :status, :slug, :image_path, :map_image_path, :map_url,
                     :latitude, :longitude, :location_updated_at, :display_order, :is_active)'
                );
                $stmt->execute($params);
                $treeId = (int) $pdo->lastInsertId();
            }
        } catch (PDOException $e) {
            // Someone else (or another tab) saved a conflicting slug/display_order
            // between our validation check above and this write — don't crash,
            // discard whatever we just uploaded, and ask the admin to retry.
            deletePublicFile($newImagePath);
            deletePublicFile($newMapImagePath);
            if ($e->getCode() === '23000') {
                $errors[] = 'สลักหรือลำดับการแสดงผลนี้เพิ่งถูกใช้โดยการบันทึกอื่น กรุณาตรวจสอบและลองใหม่อีกครั้ง';
            } else {
                throw $e;
            }
        }
    }

    if (!$errors) {
        // Now that the tree has an id and its final public URL is settled,
        // (re)generate its QR code and persist the path.
        $qrCodePath = generateTreeQrCode($treeId);
        $pdo->prepare('UPDATE trees SET qr_code_path = :qr WHERE id = :id')
            ->execute(['qr' => $qrCodePath, 'id' => $treeId]);

        // The plant_code's category/species/zone/area segment may have just
        // changed (new species/zone/area_code) — recompute it, and if it
        // did change, send the admin to print an updated tag/QR.
        $codeChanged = recomputeTreePlantCode($pdo, $treeId);

        // Clean up the files that got replaced, now that the DB row points elsewhere.
        if ($newImagePath !== null && !empty($tree['image_path'])) {
            deletePublicFile($tree['image_path']);
        }
        if ($newMapImagePath !== null && !empty($tree['map_image_path'])) {
            deletePublicFile($tree['map_image_path']);
        }

        header('Location: dashboard.php' . ($codeChanged ? '?reprint=' . $treeId : ''));
        exit;
    }

    // keep entered values on validation error
    $tree = array_merge($tree ?? [], [
        'species_id' => $speciesId, 'zone_id' => $zoneId, 'area_code' => $areaCode, 'label' => $label, 'status' => $status,
        'slug' => $slug, 'map_url' => $mapUrl, 'display_order' => $displayOrder, 'is_active' => $isActive,
        'latitude' => $latitudeRaw, 'longitude' => $longitudeRaw,
    ]);
}

$v = fn($key, $default = '') => e((string) ($tree[$key] ?? $default));
?>
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $id ? 'แก้ไข' : 'เพิ่ม' ?>ต้นไม้</title>
<link rel="stylesheet" href="../public/assets/css/style.css">
</head>
<body>
<div class="admin-wrap admin-wrap-narrow">
  <p><a class="btn-outline btn-sm" href="dashboard.php">&larr; กลับไปหน้าต้นไม้</a></p>
  <h1><?= $id ? 'แก้ไขต้นไม้ — ' . e(assetCode($pdo, $id)) : 'เพิ่มต้นไม้' ?></h1>

  <?php foreach ($errors as $err): ?>
    <div class="flash error"><?= e($err) ?></div>
  <?php endforeach; ?>

  <?php if (!$speciesList): ?>
    <div class="flash error">ยังไม่มีชนิดพันธุ์ในระบบ กรุณา<a href="species_form.php">เพิ่มชนิดพันธุ์</a>ก่อน</div>
  <?php elseif (!$zones): ?>
    <div class="flash error">ยังไม่มีโซนในระบบ กรุณา<a href="zone_form.php">เพิ่มโซน</a>ก่อน</div>
  <?php else: ?>

  <form method="post" enctype="multipart/form-data">
    <label for="species_id">ชนิดพันธุ์</label>
    <select id="species_id" name="species_id" required>
      <option value="">— เลือกชนิดพันธุ์ —</option>
      <?php foreach ($speciesList as $sp): ?>
        <option value="<?= (int) $sp['id'] ?>" <?= (int) ($tree['species_id'] ?? 0) === (int) $sp['id'] ? 'selected' : '' ?>>
          <?= e($sp['name']) ?><?= $sp['name_scientific'] ? ' (' . e($sp['name_scientific']) . ')' : '' ?>
        </option>
      <?php endforeach; ?>
    </select>
    <p class="field-hint">
      ชื่อ คำอธิบาย วิธีดูแล และการจำแนกพันธุ์ อยู่ในข้อมูลชนิดพันธุ์ — <a href="species.php">จัดการชนิดพันธุ์</a>
    </p>

    <label for="zone_id">โซน</label>
    <select id="zone_id" name="zone_id" required>
      <option value="">— เลือกโซน —</option>
      <?php foreach ($zones as $z): ?>
        <option value="<?= (int) $z['id'] ?>" <?= (int) ($tree['zone_id'] ?? 0) === (int) $z['id'] ? 'selected' : '' ?>>
          <?= e($z['name']) ?> (<?= e($z['zone_code']) ?>)
        </option>
      <?php endforeach; ?>
    </select>

    <label for="area_code">พื้นที่ในสวน (ตัวเลข 2 หลัก สำหรับรหัสต้นไม้ 15 หลัก)</label>
    <input type="text" id="area_code" name="area_code" value="<?= $v('area_code', '01') ?>"
           pattern="\d{2}" maxlength="2" placeholder="เช่น 01" required>

    <label for="label">ป้ายชื่อ (ไม่บังคับ — ชื่อเรียกสำหรับเจ้าหน้าที่ เพื่อแยกต้นที่เป็นชนิดพันธุ์เดียวกัน)</label>
    <input type="text" id="label" name="label" value="<?= $v('label') ?>" placeholder="เช่น ใกล้ประตูทางเหนือ">

    <label for="status">สถานะ</label>
    <select id="status" name="status">
      <?php foreach ($statuses as $key => $label): ?>
        <option value="<?= e($key) ?>" <?= ($tree['status'] ?? 'healthy') === $key ? 'selected' : '' ?>><?= e($label) ?></option>
      <?php endforeach; ?>
    </select>

    <label for="slug">สลัก URL (ไม่บังคับ)</label>
    <input type="text" id="slug" name="slug" value="<?= $v('slug') ?>">

    <label for="image">รูปภาพต้นไม้</label>
    <?php if (!empty($tree['image_path'])): ?>
      <p><img src="../public/<?= e($tree['image_path']) ?>" alt="" class="preview-thumb"></p>
    <?php endif; ?>
    <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/gif,image/webp">

    <label for="latitude">ละติจูด (ไม่บังคับ — ตำแหน่งปัจจุบัน)</label>
    <input type="text" id="latitude" name="latitude" value="<?= $v('latitude') ?>" inputmode="decimal" placeholder="เช่น 17.4138">

    <label for="longitude">ลองจิจูด (ไม่บังคับ — ตำแหน่งปัจจุบัน)</label>
    <input type="text" id="longitude" name="longitude" value="<?= $v('longitude') ?>" inputmode="decimal" placeholder="เช่น 102.7870">
    <?php if (!empty($tree['location_updated_at'])): ?>
      <p class="field-hint">อัปเดตตำแหน่งล่าสุด: <?= e($tree['location_updated_at']) ?></p>
    <?php endif; ?>
    <p class="field-hint">
      Tree ID ภายใน (<?= $id ? e(assetCode($pdo, $id)) : 'NN-UD-xxxxxx' ?>) และลิงก์ QR จะคงเดิมแม้ย้ายต้นไม้ —
      แต่รหัสต้นไม้ 15 หลักที่พิมพ์บนป้าย (ประเภทพืช/รหัสชนิดพืช/โซน/พื้นที่/ลำดับ)
      จะเปลี่ยนถ้าย้ายโซนหรือพื้นที่ ต้องพิมพ์ป้ายใหม่
    </p>
    <?php if (!empty($tree['plant_code'])): ?>
      <p class="field-hint">
        รหัสต้นไม้ปัจจุบัน: <strong><?= e($tree['plant_code']) ?></strong>
        <?php if (!empty($tree['plant_code_updated_at'])): ?>
          (อัปเดตล่าสุด <?= e($tree['plant_code_updated_at']) ?>)
        <?php endif; ?>
      </p>
    <?php endif; ?>

    <label for="display_order">ลำดับการแสดงผล</label>
    <input type="number" id="display_order" name="display_order" value="<?= $v('display_order', $tree['display_order'] ?? '') ?>" min="1" required>

    <label>
      <input type="checkbox" name="is_active" <?= (!isset($tree['is_active']) || $tree['is_active']) ? 'checked' : '' ?>>
      เปิดใช้งาน (แสดงต่อผู้เข้าชม)
    </label>

    <p><button class="btn" type="submit">บันทึก</button></p>
  </form>
  <?php endif; ?>

  <?php if ($id): ?>
  <section id="observations" class="history-section">
    <h2>ประวัติการสำรวจ (Observation)</h2>
    <?php if ($observations): ?>
      <div class="table-scroll">
        <table>
          <thead><tr><th>วันที่</th><th>ความสูง (ซม.)</th><th>ทรงพุ่ม (ซม.)</th><th>สุขภาพ</th><th>ผู้บันทึก</th><th>หมายเหตุ</th><th></th></tr></thead>
          <tbody>
            <?php foreach ($observations as $ob): ?>
            <tr>
              <td><?= e($ob['observed_at']) ?></td>
              <td><?= e($ob['height_cm'] !== null ? $ob['height_cm'] : '—') ?></td>
              <td><?= e($ob['canopy_cm'] !== null ? $ob['canopy_cm'] : '—') ?></td>
              <td><?= e($healthLabels[$ob['health']] ?? $ob['health']) ?></td>
              <td><?= e($ob['recorded_by'] ?? '') ?></td>
              <td><?= e($ob['notes'] ?? '') ?></td>
              <td>
                <form class="inline" method="post" action="observation_delete.php" data-confirm="ลบรายการนี้?">
                  <input type="hidden" name="id" value="<?= (int) $ob['id'] ?>">
                  <input type="hidden" name="tree_id" value="<?= (int) $id ?>">
                  <button class="btn btn-sm btn-danger" type="submit">ลบ</button>
                </form>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php else: ?>
      <p class="muted-note">ยังไม่มีประวัติการสำรวจ</p>
    <?php endif; ?>

    <form method="post" action="observation_add.php" class="inline-add-form">
      <input type="hidden" name="tree_id" value="<?= (int) $id ?>">
      <div class="field-row">
        <label>วันที่<input type="date" name="observed_at" value="<?= e(date('Y-m-d')) ?>" required></label>
        <label>ความสูง (ซม.)<input type="text" name="height_cm" inputmode="decimal" placeholder="เช่น 250"></label>
        <label>ทรงพุ่ม (ซม.)<input type="text" name="canopy_cm" inputmode="decimal" placeholder="เช่น 180"></label>
        <label>สุขภาพ
          <select name="health">
            <?php foreach ($healthLabels as $key => $label): ?>
              <option value="<?= e($key) ?>"><?= e($label) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>ผู้บันทึก<input type="text" name="recorded_by" placeholder="ชื่อเจ้าหน้าที่"></label>
      </div>
      <label>หมายเหตุ<input type="text" name="notes" placeholder="ข้อสังเกตเพิ่มเติม"></label>
      <button class="btn btn-sm" type="submit">+ บันทึกการสำรวจ</button>
    </form>
  </section>

  <section id="maintenance" class="history-section">
    <h2>ประวัติการดูแล (Maintenance Log)</h2>
    <?php if ($maintenanceLogs): ?>
      <div class="table-scroll">
        <table>
          <thead><tr><th>วันที่</th><th>กิจกรรม</th><th>ผู้ปฏิบัติ</th><th>หมายเหตุ</th><th></th></tr></thead>
          <tbody>
            <?php foreach ($maintenanceLogs as $log): ?>
            <tr>
              <td><?= e($log['performed_at']) ?></td>
              <td><?= e($log['activity']) ?></td>
              <td><?= e($log['performed_by'] ?? '') ?></td>
              <td><?= e($log['notes'] ?? '') ?></td>
              <td>
                <form class="inline" method="post" action="maintenance_delete.php" data-confirm="ลบรายการนี้?">
                  <input type="hidden" name="id" value="<?= (int) $log['id'] ?>">
                  <input type="hidden" name="tree_id" value="<?= (int) $id ?>">
                  <button class="btn btn-sm btn-danger" type="submit">ลบ</button>
                </form>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php else: ?>
      <p class="muted-note">ยังไม่มีประวัติการดูแล</p>
    <?php endif; ?>

    <form method="post" action="maintenance_add.php" class="inline-add-form">
      <input type="hidden" name="tree_id" value="<?= (int) $id ?>">
      <div class="field-row">
        <label>วันที่<input type="date" name="performed_at" value="<?= e(date('Y-m-d')) ?>" required></label>
        <label>กิจกรรม<input type="text" name="activity" placeholder="เช่น รดน้ำ, ตัดแต่ง, ใส่ปุ๋ย" required></label>
        <label>ผู้ปฏิบัติ<input type="text" name="performed_by" placeholder="ชื่อเจ้าหน้าที่"></label>
      </div>
      <label>หมายเหตุ<input type="text" name="notes" placeholder="รายละเอียดเพิ่มเติม"></label>
      <button class="btn btn-sm" type="submit">+ บันทึกการดูแล</button>
    </form>
  </section>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/_confirm_modal.php'; ?>
</body>
</html>
