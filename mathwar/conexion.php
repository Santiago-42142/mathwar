<?php
$conexion = new mysqli(
    "mysql.railway.internal",
    "root",
    getenv('MYSQL_ROOT_PASSWORD'),
    "railway",
    3306
);

if($conexion->connect_error){
    die("Error: " . $conexion->connect_error);
}
?>
