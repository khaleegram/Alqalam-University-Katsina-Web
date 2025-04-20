<?php
include('db_connection.php');

header('Content-Type: application/json');

$query = "SELECT cc.course_code, cc.course_name, GROUP_CONCAT(d.name) AS departments, SUM(cc.students_count) AS students_count 
          FROM combined_courses cc 
          JOIN departments d ON FIND_IN_SET(d.id, cc.department_ids) 
          GROUP BY cc.course_code";
$result = $conn->query($query);

$combined_courses = [];
while ($row = $result->fetch_assoc()) {
    $combined_courses[] = [
        'course_code' => $row['course_code'],
        'course_name' => $row['course_name'],
        'departments' => explode(',', $row['departments']),
        'students_count' => $row['students_count']
    ];
}

echo json_encode($combined_courses);
?>
