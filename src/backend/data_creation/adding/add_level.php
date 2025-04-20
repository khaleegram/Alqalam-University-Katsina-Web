<?php
include('../../db_connection.php');
header('Content-Type: application/json');

// Get input data
$data = json_decode(file_get_contents("php://input"), true);

$level = filter_var($data['level'], FILTER_SANITIZE_NUMBER_INT);
$department_id = filter_var($data['department_id'], FILTER_SANITIZE_NUMBER_INT);
$students_count = filter_var($data['students_count'], FILTER_SANITIZE_NUMBER_INT);

if (!$level || !$department_id || !$students_count || $students_count <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required and must be valid.']);
    exit;
}

// Database transaction
$conn->begin_transaction();
try {
    $query = "INSERT INTO levels (department_id, level, students_count) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("isi", $department_id, $level, $students_count);

    if ($stmt->execute()) {
        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Level added successfully.']);
    } else {
        throw new Exception('Failed to add level.');
    }
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
