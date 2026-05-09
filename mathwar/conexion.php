<?php
$conexion = new mysqli(
    "mysql.railway.internal",
    "root",
    "Sr. AHMBlMZopaSbBgloPQhjfePaYnSFOy",
    "railway",
    3306
);

if($conexion->connect_error){
    die("Error: " . $conexion->connect_error);
}
?>
