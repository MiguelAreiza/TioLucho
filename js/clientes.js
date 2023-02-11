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
        toastr.Success('Clientes asignados');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}

$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });
    
    ExecSp(`sp_GetClientsByRouteId '${getUser.RouteId}'`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('El usuario aun no cuenta con clientes');
            return;
        }
    
        let html = ``;
        for (let i = 0; i < data.length; i++) {
            html += `<div class="record">
                        <label>${data[i].StrName}</label>
                        <label>${data[i].StrTel}</label>
                        <label>${data[i].StrAddress}</label>                          
                    </div>`;            
        }

        $('#records').html(html);
        $('#cantClients').html(`Clientes: ${data.length}`);
            
    }).catch( error => {
        toastr.Error('Contacta tu administrador');
    });

});