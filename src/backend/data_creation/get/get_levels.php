<?php
include('../../db_connection.php');
header('Content-Type: application/json');

// Get input data
$data = json_decode(file_get_contents("php://input"), true);
$department_id = filter_var($data['department_id'], FILTER_SANITIZE_NUMBER_INT);

if (!$department_id) {
    echo json_encode(['status' => 'error', 'message' => 'Department ID is required.']);
    exit;
}

try {
    // Query to fetch levels based on department ID
    $query = "SELECT * FROM levels WHERE department_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $department_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $levels = [];
    while ($row = $result->fetch_assoc()) {
        $levels[] = [
            'id' => $row['id'],
            'level' => $row['level'],
            'students_count' => $row['students_count']
        ];
    }

    echo json_encode(['status' => 'success', 'data' => $levels]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
