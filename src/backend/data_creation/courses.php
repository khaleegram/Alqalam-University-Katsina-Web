<?php
include('../db_connection.php');

// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle pre-flight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ------------------
// GET Requests
// ------------------
if ($method === 'GET') {
    // 1. Fetch Programs
    if (isset($_GET['fetch_programs']) && $_GET['fetch_programs'] == 1) {
        $query = $conn->prepare("SELECT program_id, name FROM programs");
        if (!$query) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        $query->execute();
        $result = $query->get_result();
        $programs = [];
        while ($row = $result->fetch_assoc()) {
            $programs[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $programs]);
        exit;
    }

    // 2. Fetch Levels for a given Program
    if (isset($_GET['program_id']) && !isset($_GET['fetch_students'])) {
        $prog_id = filter_var($_GET['program_id'], FILTER_SANITIZE_NUMBER_INT);
        if (!$prog_id) {
            echo json_encode(['status' => 'error', 'message' => 'A valid Program ID is required.']);
            exit;
        }
        $query = $conn->prepare("SELECT id, level, program_id, students_count FROM levels WHERE program_id = ?");
        if (!$query) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        $query->bind_param("i", $prog_id);
        $query->execute();
        $result = $query->get_result();
        $levels = [];
        while ($row = $result->fetch_assoc()) {
            $levels[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $levels]);
        exit;
    }

    // 3. Fetch Courses for a given Level
    if (isset($_GET['level_id']) && !isset($_GET['fetch_students'])) {
        $level_id = filter_var($_GET['level_id'], FILTER_SANITIZE_NUMBER_INT);
        if (!$level_id) {
            echo json_encode(['status' => 'error', 'message' => 'Level ID is required to fetch courses.']);
            exit;
        }
        $query = $conn->prepare("SELECT id, course_code, course_name, level_id, credit_unit, created_at, updated_at FROM courses WHERE level_id = ?");
        if (!$query) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        $query->bind_param("i", $level_id);
        $query->execute();
        $result = $query->get_result();
        $courses = [];
        while ($row = $result->fetch_assoc()) {
            $courses[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $courses]);
        exit;
    }

    // 4. Default: Fetch all Courses with Levels and Program info
    $query = "
        SELECT 
            c.id, 
            c.course_code, 
            c.course_name, 
            c.level_id, 
            c.credit_unit,
            c.created_at,
            c.updated_at,
            l.level, 
            p.program_id, 
            p.name AS program_name 
        FROM courses c 
        LEFT JOIN levels l ON c.level_id = l.id 
        LEFT JOIN programs p ON l.program_id = p.program_id
    ";
    $result = $conn->query($query);
    if (!$result) {
        echo json_encode(['status' => 'error', 'message' => 'Query failed: ' . $conn->error]);
        exit;
    }
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $courses]);
    exit;
}

// ------------------
// POST Request - Add a Course
// ------------------
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $course_code = isset($data['course_code']) ? strtoupper(trim($data['course_code'])) : '';
    $course_name = isset($data['course_name']) ? ucwords(strtolower(trim($data['course_name']))) : '';
    $level_id    = isset($data['level_id']) ? $data['level_id'] : '';
    $credit_unit = isset($data['credit_unit']) ? $data['credit_unit'] : '';

    if (!$course_code || !$course_name || !$level_id || !$credit_unit) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    $checkQuery = $conn->prepare("SELECT id FROM courses WHERE course_code = ?");
    if (!$checkQuery) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $checkQuery->bind_param("s", $course_code);
    $checkQuery->execute();
    $checkResult = $checkQuery->get_result();
    if ($checkResult->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Duplicate record: Course already exists.']);
        exit;
    }

    $query = "INSERT INTO courses (course_code, course_name, level_id, credit_unit, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("ssii", $course_code, $course_name, $level_id, $credit_unit);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Course added successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add course: ' . $stmt->error]);
    }
    exit;
}

// ------------------
// PUT Request - Update a Course
// ------------------
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id          = isset($data['id']) ? $data['id'] : '';
    $course_code = isset($data['course_code']) ? strtoupper(trim($data['course_code'])) : '';
    $course_name = isset($data['course_name']) ? ucwords(strtolower(trim($data['course_name']))) : '';
    $level_id    = isset($data['level_id']) ? $data['level_id'] : '';
    $credit_unit = isset($data['credit_unit']) ? $data['credit_unit'] : '';

    if (!$id || !$course_code || !$course_name || !$level_id || !$credit_unit) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE courses SET course_code = ?, course_name = ?, level_id = ?, credit_unit = ?, updated_at = NOW() WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("ssiii", $course_code, $course_name, $level_id, $credit_unit, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Course updated successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update course: ' . $stmt->error]);
    }
    exit;
}

// ------------------
// DELETE Request - Delete a Course
// ------------------
elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = isset($data['id']) ? $data['id'] : '';

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Course ID is required.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM courses WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Course deleted successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete course: ' . $stmt->error]);
    }
    exit;
}

// ------------------
// Unsupported Request Method
// ------------------
echo json_encode(['status' => 'error', 'message' => 'Request method not supported.']);
exit;
?>
