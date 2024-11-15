<?php
include('conexion.php');
$response = array('status' => 'error');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correo = $_POST['correo'];
    $clave = $_POST['clave'];

    $query = "SELECT * FROM Usuario WHERE correo = '$correo'";
    $result = mysqli_query($conexion, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $usuario = mysqli_fetch_assoc($result);

        if ($usuario['status'] == 1 && $usuario['clave'] == $clave) {
            $response = array(
                'status' => 'success',
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre']
            );
        } else {
            $response['status'] = 'Cuenta inactiva o contraseña incorrecta';
        }
    }
}

echo json_encode($response);
?>