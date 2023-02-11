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
        toastr.Success('Configura tu perfil');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}

$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnChangePass').click( () => {
        goLocation.ChangeView('./change/');
    });
    
    if (getUser.RoleId.toUpperCase() == 'D8042D1F-6879-46A2-8EF3-39C06EB15529') {
        
        $('#btnOptions').click( () => {
            goLocation.ChangeView('../admin/');
        });

    } else {
        $('#btnOptions').hide();
    }

    $('#btnLogOut').click( () => {
        goLocation.ChangeView('../../login/');
        sessionStorage.removeItem('AppUser');
    });

});