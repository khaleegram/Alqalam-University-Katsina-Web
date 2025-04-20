<?php
include('db_connection.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];

    $query = "INSERT INTO staff (name, email) VALUES (?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $name, $email);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Staff added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add staff']);
    }
}
?>
