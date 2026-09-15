<?php
require_once __DIR__ . '/../includes/auth.php';
requirePermission('category.manage');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $code = trim($_POST['code'] ?? '');
    if ($code !== '') {
        $pdo = db();
        // Refuse to delete a category still referenced by any species.
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM species WHERE category_code = :code');
        $stmt->execute(['code' => $code]);
        if ((int) $stmt->fetchColumn() === 0) {
            $pdo->prepare('DELETE FROM categories WHERE code = :code')->execute(['code' => $code]);
        }
    }
}

header('Location: categories.php');
exit;
