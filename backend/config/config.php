<?php

if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool
    {
        return $needle !== '' && strpos($haystack, $needle) !== false;
    }
}

function loadEnvFile(array $paths)
{
    foreach ($paths as $path) {
        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (strpos($line, '#') === 0) continue;
                if (!str_contains($line, '=')) continue;

                list($key, $value) = explode('=', $line, 2);

                $key = trim($key);
                $value = trim($value);

                // Put in environment variables
                putenv("$key=$value");

                // Also add to $_ENV superglobal
                $_ENV[$key] = $value;
            }
            return true;
        }
    }
    return false;
}

loadEnvFile([
    __DIR__ . '/../.env.production',
    __DIR__ . '/../.env.development',
    __DIR__ . '/../.env',
]);
