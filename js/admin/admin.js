'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
        $('#nameRoute').html(getUser.NameRoute);
        toastr.Success('Gestion de la app');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}

$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#cardClients').click( () => {
        location.href = './clientes/';
    });

    $('#cardCategories').click( () => {        
        location.href = './categorias/';
    });

    $('#cardProducts').click( () => {        
        location.href = './productos/';
    });

    $('#cardRoutes').click( () => {        
        location.href = './rutas/';
    });

    $('#cardSales').click( () => {        
        location.href = './ventas/';
    });
    
    $('#cardNotSales').click( () => {        
        location.href = './noCompras/';
    });

    $('#cardInventories').click( () => {        
        location.href = './inventarios/';
    });

    $('#cardLiquidations').click( () => {        
        location.href = './liquidaciones/';
    });

    $('#cardUsers').click( () => {        
        location.href = './usuarios/';
    });

    $('#cardCosts').click( () => {        
        location.href = './gastos/';
    });

});