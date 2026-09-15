<?php
require_once __DIR__ . '/functions.php';

function startAdminSession(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('tree_admin_sess');
        session_start();
    }
}

function adminLoggedIn(): bool
{
    startAdminSession();
    return !empty($_SESSION['admin_id']);
}

function requireAdmin(): void
{
    if (!adminLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Deny-by-default permission check (see docs/rbac.md). Queried fresh
 * against role_permissions on every call rather than cached in session —
 * these are small tables (a few dozen rows total) and this keeps a role
 * change (via admin.manage) take effect on the admin's very next request
 * instead of needing a session-invalidation mechanism.
 */
function can(string $permissionKey): bool
{
    if (empty($_SESSION['admin_role_id'])) {
        return false;
    }
    $stmt = db()->prepare(
        'SELECT 1 FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = :role_id AND p.permission_key = :key
         LIMIT 1'
    );
    $stmt->execute(['role_id' => $_SESSION['admin_role_id'], 'key' => $permissionKey]);
    return (bool) $stmt->fetchColumn();
}

/**
 * Gates a page/action to a specific permission (e.g.
 * requirePermission('tree.create')). Must be the first check in any
 * admin/*.php or api/*.php script that touches protected data — frontend
 * button-hiding is UX only, this is the actual security boundary. Sends a
 * plain 403 rather than redirecting, since the visitor is already logged
 * in and a login redirect would just loop.
 */
function requirePermission(string $permissionKey): void
{
    requireAdmin();
    if (!can($permissionKey)) {
        http_response_code(403);
        echo 'Forbidden — your role does not have access to this page.';
        exit;
    }
}

function attemptAdminLogin(PDO $pdo, string $username, string $password): bool
{
    $stmt = $pdo->prepare('SELECT id, password_hash, role_id FROM admins WHERE username = :u');
    $stmt->execute(['u' => $username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        startAdminSession();
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_role_id'] = (int) $admin['role_id'];
        return true;
    }
    return false;
}

function adminLogout(): void
{
    startAdminSession();
    $_SESSION = [];
    session_destroy();
}

/** Current admin's role_key/name_th, for display (e.g. "signed in as Programmer"). */
function currentAdminRole(PDO $pdo): ?array
{
    if (empty($_SESSION['admin_role_id'])) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT role_key, name_th, name_en FROM roles WHERE id = :id');
    $stmt->execute(['id' => $_SESSION['admin_role_id']]);
    return $stmt->fetch() ?: null;
}
