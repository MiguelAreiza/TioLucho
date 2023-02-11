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
        toastr.Success('Inventario actual');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}


$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });
    
    ExecSp(`sp_GetInventoryByUser '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('El usuario aun no cuenta con inventario');
            return;
        }
    
        let html = ``;
        for (let i = 0; i < data.length; i++) {
            html += `<div class="record">
                        <label>${data[i].StrName}</label>
                        <label>${data[i].IntLoad}</label>
                        <label>${data[i].IntStock}</label>                          
                    </div>`;            
        }

        $('#records').html(html);
        $('#dateInventory').html(new Date().toLocaleDateString());
            
    }).catch( error => {
        toastr.Error('Contacta tu administrador');
    });

});