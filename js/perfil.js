'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
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
    
    if (getUser.RoleId.toUpperCase() == '57712132-2A95-430A-8198-E3665E80D8D2') {
        
        $('#btnOptions').click( () => {
            goLocation.ChangeView('../admin/');
        });

    } else {
        $('#btnOptions').hide();
    }

    $('#btnLogOut').click( () => {
        goLocation.ChangeView('../../login/');
    });

});