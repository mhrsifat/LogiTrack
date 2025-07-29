<?php
require_once __DIR__ . '/../config/config.php';

class Router
{
    private $routes = [
        'GET'    => [],
        'POST'   => [],
        'PUT'    => [],
        'DELETE' => [],
    ];

    public function get(string $uri, string $action)
    {
        $this->routes['GET'][$this->normalize($uri)] = $action;
    }

    public function post(string $uri, string $action)
    {
        $this->routes['POST'][$this->normalize($uri)] = $action;
    }

    public function put(string $uri, string $action)
    {
        $this->routes['PUT'][$this->normalize($uri)] = $action;
    }

    public function delete(string $uri, string $action)
    {
        $this->routes['DELETE'][$this->normalize($uri)] = $action;
    }

    public function dispatch()
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if ($requestMethod === 'OPTIONS') {
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            $origins_string = $_ENV['ALLOWED_ORIGINS'];
            $allowed_origins = array_map('trim', explode(',', $origins_string));

            if (in_array($origin, $allowed_origins)) {
                header("Access-Control-Allow-Origin: $origin");
                header("Access-Control-Allow-Credentials: true");
                header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
                header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
                http_response_code(200);
                exit();
            } else {
                http_response_code(403);
                exit("Forbidden origin");
            }
        }

        // Set CORS headers on actual requests
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $origins_string = $_ENV['ALLOWED_ORIGINS'];
        $allowed_origins = array_map('trim', explode(',', $origins_string));

        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
            header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
        }

        // Support method override header for PUT/DELETE
        if ($requestMethod === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
            $override = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
            if (in_array($override, ['PUT', 'DELETE'])) {
                $requestMethod = $override;
            }
        }

        $requestUri = $this->normalize($_SERVER['REQUEST_URI']);

        $matchedAction = null;
        $params = [];

        // Match routes with parameter support
        foreach ($this->routes[$requestMethod] as $route => $action) {
            // Convert route pattern to regex, e.g. /users/{id} => /users/([^/]+)
            $pattern = preg_replace('#\{[a-zA-Z_][a-zA-Z0-9_-]*\}#', '([^/]+)', $route);
            $pattern = "#^" . $pattern . "$#";

            if (preg_match($pattern, $requestUri, $matches)) {
                array_shift($matches); // first element is full match, remove it
                $matchedAction = $action;
                $params = $matches;
                break;
            }
        }

        if ($matchedAction) {
            $this->callActionWithParams($matchedAction, $params);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
        }
    }

    private function callActionWithParams(string $action, array $params)
    {
        list($controllerName, $method) = explode('@', $action);
        $controllerFile = __DIR__ . '/../controllers/' . $controllerName . '.php';

        if (!file_exists($controllerFile)) {
            http_response_code(500);
            echo json_encode(['error' => 'Controller not found']);
            return;
        }

        require_once $controllerFile;
        $controller = new $controllerName();

        if (!method_exists($controller, $method)) {
            http_response_code(500);
            echo json_encode(['error' => 'Method not found in controller']);
            return;
        }

        // Call the controller method with route params
        call_user_func_array([$controller, $method], $params);
    }

    private function normalize(string $uri): string
    {
        $basePath = $_ENV['BASE_DIR'] ?? '';
        $parsed = parse_url($uri, PHP_URL_PATH);
        $path = '/' . ltrim(str_replace($basePath, '', $parsed), '/');
        return rtrim($path, '/') ?: '/';
    }
}
