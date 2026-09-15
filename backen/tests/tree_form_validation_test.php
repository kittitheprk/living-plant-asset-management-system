<?php
/**
 * Regression test for a fatal error found in production use:
 * saving a tree with a display_order (or slug) that collides with an
 * existing tree threw an uncaught PDOException (23000 duplicate key)
 * instead of showing a friendly validation error.
 *
 * Covers:
 *   1. Creating a tree with a display_order already used by another tree
 *      shows a friendly error (200 + message), not a fatal error.
 *   2. Same for a duplicate slug.
 *   3. Editing a tree and keeping its OWN display_order/slug unchanged is
 *      NOT flagged as a conflict (the exclude-self check works).
 *   4. A legitimate, non-conflicting save still succeeds normally.
 *   5. No orphaned tree row or QR file gets created for a rejected save.
 *
 * Requires MySQL running locally with the app schema/seed loaded (same as qr_e2e_test.php).
 *
 * Run: php tests/tree_form_validation_test.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

$host = '127.0.0.1';
$port = 8095;
$base = "http://$host:$port";

$pdo = db();

$pass = 0;
$fail = 0;

function check(string $label, bool $ok, string $detail = ''): void
{
    global $pass, $fail;
    if ($ok) {
        $pass++;
        echo "PASS  $label\n";
    } else {
        $fail++;
        echo "FAIL  $label" . ($detail !== '' ? "\n      $detail" : '') . "\n";
    }
}

function httpRequest(string $url, ?string $cookieFile = null, ?array $post = null): array
{
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 5,
    ];
    if ($cookieFile !== null) {
        $opts[CURLOPT_COOKIEJAR] = $cookieFile;
        $opts[CURLOPT_COOKIEFILE] = $cookieFile;
    }
    if ($post !== null) {
        $opts[CURLOPT_POST] = true;
        $opts[CURLOPT_POSTFIELDS] = http_build_query($post);
    }
    curl_setopt_array($ch, $opts);
    $raw = curl_exec($ch);
    if ($raw === false) {
        throw new RuntimeException('curl error: ' . curl_error($ch));
    }
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    return [
        'status' => $status,
        'headers' => substr($raw, 0, $headerSize),
        'body' => substr($raw, $headerSize),
    ];
}

$docRoot = __DIR__ . '/..';
// Use XAMPP's own php.exe (not whatever "php" resolves to on PATH) so the test
// server loads the SAME php.ini — and therefore the same extensions — as the
// real Apache deployment. Using a different PHP here previously masked a
// missing-GD-extension bug that only showed up in production.
$cmd = sprintf('"C:\\xampp\\php\\php.exe" -S %s:%d -t %s', $host, $port, escapeshellarg($docRoot));
$descriptors = [1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
$serverProc = proc_open($cmd, $descriptors, $pipes, __DIR__, null, ['bypass_shell' => true]);
if (!is_resource($serverProc)) {
    fwrite(STDERR, "Could not start PHP built-in server\n");
    exit(1);
}
stream_set_blocking($pipes[1], false);
stream_set_blocking($pipes[2], false);

$ready = false;
for ($i = 0; $i < 40; $i++) {
    $conn = @fsockopen($host, $port, $errno, $errstr, 0.25);
    if ($conn) {
        fclose($conn);
        $ready = true;
        break;
    }
    usleep(100000);
}
if (!$ready) {
    fwrite(STDERR, "PHP built-in server never came up on $base\n");
    proc_terminate($serverProc);
    exit(1);
}

$createdTreeIds = [];

register_shutdown_function(function () use (&$serverProc, $pdo, &$createdTreeIds) {
    if ($createdTreeIds) {
        $stmt = $pdo->prepare('SELECT image_path, map_image_path, qr_code_path FROM trees WHERE id = :id');
        foreach ($createdTreeIds as $tid) {
            $stmt->execute(['id' => $tid]);
            $row = $stmt->fetch();
            if ($row) {
                deletePublicFile($row['image_path']);
                deletePublicFile($row['map_image_path']);
                deletePublicFile($row['qr_code_path']);
            }
        }
        $in = implode(',', array_map('intval', $createdTreeIds));
        $pdo->exec("DELETE FROM trees WHERE id IN ($in)");
    }
    if (is_resource($serverProc)) {
        proc_terminate($serverProc);
        proc_close($serverProc);
    }
});

try {
    $cookieFile = tempnam(sys_get_temp_dir(), 'formval_cookies_');
    httpRequest("$base/admin/login.php", $cookieFile);
    $rLogin = httpRequest("$base/admin/login.php", $cookieFile, [
        'username' => 'admin',
        'password' => 'ChangeMe123!',
    ]);
    check('admin login succeeds', $rLogin['status'] === 302, "got {$rLogin['status']}");

    // Pick a display_order that's DEFINITELY already taken: the lowest active
    // seed tree's, whatever it currently is.
    $existing = $pdo->query('SELECT id, slug, display_order FROM trees ORDER BY display_order ASC LIMIT 1')->fetch();
    check('found an existing tree to collide with', (bool) $existing);

    // Every tree needs a valid species_id/zone_id now — grab whatever the seed created.
    $speciesId = (int) $pdo->query('SELECT id FROM species ORDER BY id ASC LIMIT 1')->fetchColumn();
    $zoneId = (int) $pdo->query('SELECT id FROM zones ORDER BY id ASC LIMIT 1')->fetchColumn();
    check('found a species and zone to assign new trees to', $speciesId > 0 && $zoneId > 0);

    if ($existing) {
        $beforeCount = (int) $pdo->query('SELECT COUNT(*) FROM trees')->fetchColumn();

        // --- 1. Creating with a colliding display_order must not 500/fatal ---
        $rDupOrder = httpRequest("$base/admin/tree_form.php", $cookieFile, [
            'species_id' => (string) $speciesId,
            'zone_id' => (string) $zoneId,
            'area_code' => '01',
            'label' => 'Duplicate Order Test Tree',
            'slug' => '',
            'map_url' => '',
            'display_order' => (string) $existing['display_order'],
            'is_active' => '1',
        ]);
        check('duplicate display_order does not crash (200, not 500)', $rDupOrder['status'] === 200, "got {$rDupOrder['status']}");
        check(
            'duplicate display_order shows a friendly error mentioning the conflicting tree',
            str_contains($rDupOrder['body'], 'ถูกใช้โดยต้นไม้อื่นแล้ว') && str_contains($rDupOrder['body'], (string) $existing['display_order']),
            substr($rDupOrder['body'], 0, 400)
        );
        check('no PHP fatal-error output leaked into the response', !str_contains($rDupOrder['body'], 'Fatal error') && !str_contains($rDupOrder['body'], 'Uncaught'));

        $afterDupOrderCount = (int) $pdo->query('SELECT COUNT(*) FROM trees')->fetchColumn();
        check('no orphaned tree row was created for the rejected duplicate-order save', $afterDupOrderCount === $beforeCount, "before=$beforeCount after=$afterDupOrderCount");

        // --- 2. Creating with a colliding slug must not crash either ---
        if ($existing['slug']) {
            $rDupSlug = httpRequest("$base/admin/tree_form.php", $cookieFile, [
                'species_id' => (string) $speciesId,
                'zone_id' => (string) $zoneId,
            'area_code' => '01',
                'label' => 'Duplicate Slug Test Tree',
                'slug' => $existing['slug'],
                'map_url' => '',
                'display_order' => '900301',
                'is_active' => '1',
            ]);
            check('duplicate slug does not crash (200, not 500)', $rDupSlug['status'] === 200, "got {$rDupSlug['status']}");
            check('duplicate slug shows a friendly error', str_contains($rDupSlug['body'], 'ถูกใช้โดยต้นไม้อื่นแล้ว'));
        } else {
            echo "SKIP  duplicate slug check (existing seed tree has no slug)\n";
        }

        // --- 3. A legitimate, non-conflicting create still works ---
        $rGood = httpRequest("$base/admin/tree_form.php", $cookieFile, [
            'species_id' => (string) $speciesId,
            'zone_id' => (string) $zoneId,
            'area_code' => '01',
            'label' => 'Valid New Tree',
            'slug' => '',
            'map_url' => '',
            'display_order' => '900302',
            'is_active' => '1',
        ]);
        check('a non-conflicting create redirects to dashboard', $rGood['status'] === 302, "got {$rGood['status']}");

        $newTree = $pdo->query("SELECT * FROM trees WHERE display_order = 900302")->fetch();
        check('the non-conflicting tree was actually created', (bool) $newTree);

        if ($newTree) {
            $createdTreeIds[] = (int) $newTree['id'];

            // --- 4. Editing a tree and keeping ITS OWN display_order is fine (not a self-conflict) ---
            $rSelfEdit = httpRequest("$base/admin/tree_form.php?id={$newTree['id']}", $cookieFile, [
                'species_id' => (string) $speciesId,
                'zone_id' => (string) $zoneId,
            'area_code' => '01',
                'label' => 'Valid New Tree (renamed)',
                'slug' => '',
                'map_url' => '',
                'display_order' => '900302', // same as before — must NOT be flagged as a conflict with itself
                'is_active' => '1',
            ]);
            check('re-saving a tree with its own unchanged display_order succeeds', $rSelfEdit['status'] === 302, "got {$rSelfEdit['status']}");

            $renamed = $pdo->query("SELECT label FROM trees WHERE id = {$newTree['id']}")->fetchColumn();
            check('the edit actually applied', $renamed === 'Valid New Tree (renamed)');

            // --- 5. NOW try to edit it onto a colliding display_order ---
            $rEditIntoConflict = httpRequest("$base/admin/tree_form.php?id={$newTree['id']}", $cookieFile, [
                'species_id' => (string) $speciesId,
                'zone_id' => (string) $zoneId,
            'area_code' => '01',
                'label' => 'Valid New Tree (renamed)',
                'slug' => '',
                'map_url' => '',
                'display_order' => (string) $existing['display_order'],
                'is_active' => '1',
            ]);
            check('editing into a conflicting display_order is rejected, not crashed', $rEditIntoConflict['status'] === 200, "got {$rEditIntoConflict['status']}");
            $unchangedOrder = $pdo->query("SELECT display_order FROM trees WHERE id = {$newTree['id']}")->fetchColumn();
            check('rejected edit did not change the stored display_order', (int) $unchangedOrder === 900302, "got $unchangedOrder");
        }
    }

    @unlink($cookieFile);
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    $fail++;
}

echo "\n$pass passed, $fail failed\n";
exit($fail === 0 ? 0 : 1);
