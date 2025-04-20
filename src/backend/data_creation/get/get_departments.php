<?php
include('../../db_connection.php'); // Database connection file

header('Content-Type: application/json');

// Check for POST request containing college_id
$input = json_decode(file_get_contents('php://input'), true);
$college_id = filter_var($input['college_id'], FILTER_VALIDATE_INT);

if ($college_id) {
    // Fetch departments based on college_id
    $query = "SELECT * FROM departments WHERE college_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $college_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $departments = [];
    while ($row = $result->fetch_assoc()) {
        $departments[] = [
            'id' => $row['id'],
            'name' => $row['name']
        ];
    }

    echo json_encode($departments);

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid college ID']);
}

$conn->close();
?>
