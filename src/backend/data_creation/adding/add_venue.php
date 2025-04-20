<?php
include('db_connection.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $venue_name = $_POST['venue_name'];
    $capacity = $_POST['capacity'];

    $query = "INSERT INTO venues (name, capacity) VALUES (?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $venue_name, $capacity);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Venue added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add venue']);
    }
}
?>
