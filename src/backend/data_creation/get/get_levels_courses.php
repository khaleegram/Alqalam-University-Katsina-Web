<?php
include('db_connection.php');

header('Content-Type: application/json');

$query = "SELECT lc.level, lc.course_code, lc.course_name, d.name AS department_name, lc.students_count 
          FROM levels_courses lc 
          JOIN departments d ON lc.department_id = d.id";
$result = $conn->query($query);

$levels_courses = [];
while ($row = $result->fetch_assoc()) {
    $levels_courses[] = [
        'level' => $row['level'],
        'course_code' => $row['course_code'],
        'course_name' => $row['course_name'],
        'department_name' => $row['department_name'],
        'students_count' => $row['students_count']
    ];
}

echo json_encode($levels_courses);
?>
