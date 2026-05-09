<?php
$conexion = new mysqli(
    "mysql.ferrocarril.interno",
    "root",
    "Sr.AHMBlMZopaSbBgloPQhjfePaYnSFOy",
    "railway",
    3306
);

if ($conexion->connect_error){
    die("Error de conexión");
}
?>
