<?php

$conexion = new mysqli(
    "localhost",
    "root",
    "",
    "mathwar"
);

if($conexion->connect_error){
    die("Error de conexión");
}

?>