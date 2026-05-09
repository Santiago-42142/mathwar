<?php
$conexion = new mysqli(
    getenv('MYSQLHOST') ?: 'mysql.railway.internal',
    getenv('MYSQLUSER') ?: 'root',
    getenv('MYSQLPASSWORD') ?: 'Sr. AHMBlMZopaSbBgloPQhjfePaYnSFOy',
    getenv('MYSQLDATABASE') ?: 'railway',
    3306
);

if($conexion->connect_error){
    die("Error de conexión: " . $conexion->connect_error);
}
?>
