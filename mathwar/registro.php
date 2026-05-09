<?php

include("conexion.php");

$gmail = $_POST["gmail"];
$usuario = $_POST["usuario"];
$password = password_hash(
    $_POST["password"],
    PASSWORD_DEFAULT
);

$check = $conexion->query(
    "SELECT * FROM usuarios WHERE gmail='$gmail'"
);

if($check->num_rows > 0){

    echo "EXISTE";
    exit;

}

$sql = "INSERT INTO usuarios
(gmail, usuario, password)

VALUES

('$gmail', '$usuario', '$password')";

if($conexion->query($sql)){

    echo "OK";

}else{

    echo "ERROR";
}

?>