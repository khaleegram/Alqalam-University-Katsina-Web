<?php
include('../../db_connection.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $level = $_POST['level'];
    $course_code = $_POST['course_code'];
    $course_name = $_POST['course_name'];
    $department_id = $_POST['department_id'];
    $students_count = $_POST['students_count'];

    $query = "INSERT INTO levels_courses (level, course_code, course_name, department_id, students_count) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('issii', $level, $course_code, $course_name, $department_id, $students_count);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Level & Course added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add Level & Course']);
    }
}
?>
