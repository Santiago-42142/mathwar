<?php

session_start();

if(!isset($_SESSION["user"])){

    echo "NO";

}else{

    echo $_SESSION["user"];

}

?>