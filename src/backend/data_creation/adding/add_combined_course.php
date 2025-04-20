<?php
include('db_connection.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $course_code = $_POST['course_code'];
    $course_name = $_POST['course_name'];
    $department_ids = implode(',', $_POST['department_ids']); // Array of department IDs
    $students_count = $_POST['students_count'];

    $query = "INSERT INTO combined_courses (course_code, course_name, department_ids, students_count) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sssi', $course_code, $course_name, $department_ids, $students_count);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Combined Course added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add Combined Course']);
    }
}
?>
