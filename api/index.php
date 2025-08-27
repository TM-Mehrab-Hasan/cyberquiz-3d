<?php
/**
 * API Router for 3D Anti-Cheat Quiz System
 * Routes requests to appropriate API endpoints
 */

require_once 'config.php';

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Parse the route
$route = str_replace('/api/', '', parse_url($request_uri, PHP_URL_PATH));
$route_parts = explode('/', $route);

// Initialize response
$response = [
    'success' => false,
    'message' => 'Invalid API endpoint',
    'data' => null
];

try {
    // Route to appropriate handler
    switch ($route_parts[0]) {
        case 'auth':
            require_once 'auth.php';
            $auth = new AuthAPI();
            $response = $auth->handleRequest();
            break;
            
        case 'quiz':
            // Quiz management endpoints
            $response = ['success' => false, 'message' => 'Quiz API not yet implemented'];
            break;
            
        case 'analytics':
            // Analytics endpoints
            $response = ['success' => false, 'message' => 'Analytics API not yet implemented'];
            break;
            
        case 'upload':
            // File upload endpoints
            $response = ['success' => false, 'message' => 'Upload API not yet implemented'];
            break;
            
        case 'health':
            // Health check endpoint
            $response = [
                'success' => true,
                'message' => 'API is healthy',
                'data' => [
                    'timestamp' => date('c'),
                    'version' => API_VERSION,
                    'status' => 'operational'
                ]
            ];
            break;
            
        default:
            $response = [
                'success' => false,
                'message' => 'Unknown API endpoint',
                'available_endpoints' => [
                    '/api/auth' => 'Authentication endpoints',
                    '/api/quiz' => 'Quiz management',
                    '/api/analytics' => 'Analytics and reporting',
                    '/api/upload' => 'File upload',
                    '/api/health' => 'System health check'
                ]
            ];
            http_response_code(404);
            break;
    }
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Internal server error',
        'error' => ENABLE_DEBUG_MODE ? $e->getMessage() : 'An error occurred'
    ];
    http_response_code(500);
    
    // Log the error
    logError($e->getMessage(), [
        'route' => $route,
        'method' => $request_method,
        'trace' => $e->getTraceAsString()
    ]);
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
?>
