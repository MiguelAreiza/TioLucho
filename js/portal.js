'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../login/');
} else {    
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../login/');
        }

        $('#nameUser').html(getUser.NameUser);
        $('#nameRoute').html(getUser.NameRoute);
        toastr.Success(`Bienvenido ${getUser.NameUser}`);

    }).catch( error => {
        goLocation.ChangeView('../login/');
    });
}

$(document).ready( () => {

    $('#userMenu').click( () => {
        goLocation.ChangeView('./perfil/');
    });
    
    $('#cardSale').click( () => {
        // goLocation.ChangeView('./venta/');
        location.href = './venta/';
    });
    
    $('#cardInventory').click( () => {
        goLocation.ChangeView('./inventario/');
    });
    
    $('#cardClients').click( () => {
        goLocation.ChangeView('./clientes/');
    });

    $('#cardLiquidation').click( () => {
        goLocation.ChangeView('./liquidacion/');
    });
    
    $('#cardCosts').click( () => {
        goLocation.ChangeView('./gasto/');
    });

});