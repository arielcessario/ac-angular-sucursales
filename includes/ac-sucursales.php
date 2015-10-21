<?php
/* TODO: Toda la parte de seguridad tiene que estar en todos los php que hagamos
 * */


session_start();

require 'PHPMailerAutoload.php';

// Token
$decoded_token = null;

if (file_exists('../../../includes/MyDBi.php')) {
    require_once '../../../includes/MyDBi.php';
    require_once '../../../includes/config.php';
} else {
    require_once 'MyDBi.php';
}

$data = file_get_contents("php://input");

// Decode data from js
$decoded = json_decode($data);


// Si la seguridad está activa
if ($jwt_enabled) {

    // Carga el jwt_helper
    if (file_exists('../../../jwt_helper.php')) {
        require_once '../../../jwt_helper.php';
    } else {
        require_once 'jwt_helper.php';
    }

    // Las funciones en el if no necesitan usuario logged
    if (($decoded == null) && (($_GET["function"] != null) &&
            ($_GET["function"] == 'getSucursales')))
    {
        $token = '';
    } else {
        checkSecurity();
    }
}


if ($decoded != null) {
    if ($decoded->function == 'createSucursal') {
        createSucursal($decoded->sucursal);
    } else if ($decoded->function == 'updateSucursal') {
        updateSucursal($decoded->sucursal);
    } else if ($decoded->function == 'removeSucursal') {
        removeSucursal($decoded->sucursal_id);
    }
} else {
    $function = $_GET["function"];
    if ($function == 'getSucursales') {
        getSucursales();
    }
}


/////// INSERT ////////
/**
 * @description Crea una sucursal
 * @param $sucursal
 */
function createSucursal($sucursal)
{
    $db = new MysqliDb();
    $db->startTransaction();
    $sucursal_decoded = checkSucursal(json_decode($sucursal));

    $data = array(
        'nombre' => $sucursal_decoded->nombre,
        'direccion' => $sucursal_decoded->direccion,
        'telefono' => $sucursal_decoded->telefono
    );

    $result = $db->insert('sucursales', $data);
    if ($result > -1) {
        $db->commit();
        echo json_encode($result);
    } else {
        $db->rollback();
        echo json_encode(-1);
    }
}


/////// UPDATE ////////
/**
 * @description Modifica una sucursal
 * @param $sucursal
 */
function updateSucursal($sucursal)
{
    $db = new MysqliDb();
    $db->startTransaction();
    $sucursal_decoded = checkSucursal(json_decode($sucursal));
    $db->where('sucursal_id', $sucursal_decoded->sucursal_id);

    $data = array(
        'nombre' => $sucursal_decoded->nombre,
        'direccion' => $sucursal_decoded->direccion,
        'telefono' => $sucursal_decoded->telefono
    );

    $result = $db->update('sucursales', $data);
    if ($result) {
        $db->commit();
        echo json_encode($result);
    } else {
        $db->rollback();
        echo json_encode(-1);
    }
}


/////// REMOVE ////////
/**
 * @description Elimina una sucursal
 * @param $sucursal_id
 */
function removeSucursal($sucursal_id)
{
    $db = new MysqliDb();

    $db->where("sucursal_id", $sucursal_id);
    $results = $db->delete('sucursales');

    if ($results) {
        echo json_encode(1);
    } else {
        echo json_encode(-1);
    }
}


/////// GET ////////
/**
 * @description Obtiene las sucursales
 */
function getSucursales()
{
    $db = new MysqliDb();
    $results = $db->get('sucursales');

    echo json_encode($results);
}