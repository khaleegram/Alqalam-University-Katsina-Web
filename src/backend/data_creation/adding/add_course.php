<?php
include('../../db_connection.php');

$data = json_decode(file_get_contents("php://input"), true);

$course_code = $data['course_code'];
$course_name = $data['course_name'];
$level_id = $data['level_id'];

if (!$course_code || !$course_name || !$level_id) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}

$query = "INSERT INTO courses (course_code, course_name, level_id) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssi", $course_code, $course_name, $level_id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Course added successfully.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add course.']);
}
?>
