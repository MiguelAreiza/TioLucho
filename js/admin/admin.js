'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
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
        goLocation.ChangeView('./clientes/');
    });

    $('#cardCategories').click( () => {        
        goLocation.ChangeView('./categorias/');
    });

    $('#cardProducts').click( () => {        
        goLocation.ChangeView('./productos/');
    });

    $('#cardRoutes').click( () => {        
        goLocation.ChangeView('./rutas/');
    });

    $('#cardSales').click( () => {        
        goLocation.ChangeView('./ventas/');
    });

    $('#cardInventories').click( () => {        
        goLocation.ChangeView('./inventarios/');
    });

    $('#cardLiquidations').click( () => {        
        goLocation.ChangeView('./liquidaciones/');
    });

    $('#cardUsers').click( () => {        
        goLocation.ChangeView('./usuarios/');
    });

    $('#cardCosts').click( () => {        
        goLocation.ChangeView('./gastos/');
    });

});