<?php
include('conexion.php');
$response = array('status' => 'error');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $clave = $_POST['clave'];

    $query = "SELECT * FROM Usuario WHERE correo = '$correo'";
    $result = mysqli_query($conexion, $query);

    if (mysqli_num_rows($result) > 0) {
        $response['status'] = 'Correo ya registrado';
    } else {
        $query = "INSERT INTO Usuario (nombre, correo, clave) VALUES ('$nombre', '$correo', '$clave')";
        if (mysqli_query($conexion, $query)) {
            $response['status'] = 'success';
        }
    }
}

echo json_encode($response);
?>
