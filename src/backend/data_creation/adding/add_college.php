<?php
include('../../db_connection.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $college_name = filter_var($input['name'], FILTER_SANITIZE_STRING);

    $query = "INSERT INTO colleges (name) VALUES (?)";
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
        exit;
    }

    $stmt->bind_param('s', $college_name);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'College added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add college', 'error' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
