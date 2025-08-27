<?php
// Generate password hashes for the demo accounts

echo "=== CyberQuiz 3D Password Hashes ===\n\n";

$passwords = [
    'admin123' => 'Admin',
    'teacher123' => 'Teacher', 
    'student123' => 'Student'
];

foreach ($passwords as $password => $role) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    echo "$role password ($password):\n";
    echo "$hash\n\n";
}

echo "Use these hashes in the database INSERT statements.\n";
?>
