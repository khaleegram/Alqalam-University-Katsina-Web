<?php
include('db_connection.php');

header('Content-Type: application/json');

$query = "SELECT * FROM venues";
$result = $conn->query($query);

$venues = [];
while ($row = $result->fetch_assoc()) {
    $venues[] = [
        'name' => $row['name'],
        'capacity' => $row['capacity']
    ];
}

echo json_encode($venues);
?>
