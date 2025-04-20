<?php
include('../../db_connection.php');

$data = json_decode(file_get_contents("php://input"), true);
$level_id = $data['level_id'];

if (!$level_id) {
    echo json_encode(['status' => 'error', 'message' => 'Level ID is required']);
    exit;
}

$query = $conn->prepare("SELECT id, course_code, course_name FROM courses WHERE level_id = ?");
$query->bind_param("i", $level_id);
$query->execute();
$result = $query->get_result();

$courses = [];
while ($row = $result->fetch_assoc()) {
    $courses[] = [
        'id' => $row['id'],
        'course_code' => $row['course_code'],
        'course_name' => $row['course_name']
    ];
}

echo json_encode(['status' => 'success', 'data' => $courses]);
?>
