<?php
include('db_connection.php'); // Database connection file

header('Content-Type: application/json');

$query = "SELECT * FROM colleges";
$result = $conn->query($query);

$colleges = [];
while ($row = $result->fetch_assoc()) {
    $colleges[] = [
        'id' => $row['id'],
        'name' => $row['name']
    ];
}

echo json_encode($colleges);
?>
