<?php

session_start();

include("conexion.php");

$gmail = $_POST["gmail"];
$password = $_POST["password"];

/* BUSCAR */
$sql = "SELECT * FROM usuarios
WHERE gmail='$gmail'";

$resultado = $conexion->query($sql);

/* SI EXISTE */
if($resultado->num_rows > 0){

    $user = $resultado->fetch_assoc();

    /* VERIFICAR PASSWORD */
    if(
        password_verify(
            $password,
            $user["password"]
        )
    ){

        $_SESSION["user"] =
        $user["usuario"];

        $_SESSION["gmail"] =
        $user["gmail"];

        echo "
        <script>

        localStorage.setItem(
            'loginOK',
            'true'
        );

        window.location =
        'index.html';

        </script>
        ";

        exit;

    }

}

/* ERROR */
echo "
<script>

alert('Datos incorrectos');

window.location='index.html';

</script>
";

?>