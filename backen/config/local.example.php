<?php
// Copy this file to `local.php` (same folder) and fill in your real keys.
// local.php is gitignored — it never gets committed, so your key stays
// out of version control and off this machine only.
//
//   cp config/local.example.php config/local.php
//
// Then edit config/local.php and paste your key on the line below.

if (!defined('GEMINI_API_KEY')) {
    define('GEMINI_API_KEY', 'paste-your-gemini-api-key-here');
}

// Optional — only uncomment if you want a model other than the default
// set in config/config.php.
// if (!defined('GEMINI_MODEL')) {
//     define('GEMINI_MODEL', 'gemini-2.0-flash');
// }
