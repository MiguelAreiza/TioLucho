'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../../login/');
        }
    
        $('#nameRoute').html(getUser.NameRoute);
        toastr.Success('Actualiza tu contraseña');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#strNewPass, #strConfirmPass').change( () => {

        const OLD = $('#strOldPass').val();
        const PASS1 = $('#strNewPass').val();
        const PASS2 = $('#strConfirmPass').val();

        if (PASS1 && PASS2 && PASS1 !== PASS2) {
            toastr.Warning('Las contraseñas no coinciden');
        }

        if (PASS1 == OLD || PASS2 == OLD) {
            toastr.Info('La contraseña no puede ser igual a la actual');
        }

    });

    $('#formChange').submit( (e) => {
        
        e.preventDefault();

        const OLD = e.target[0].value;
        const PASS1 = e.target[1].value;
        const PASS2 = e.target[2].value;

        if (PASS1 && PASS2 && PASS1 !== PASS2) {
            toastr.Warning('Las contraseñas no coinciden');
            return;
        }

        if (PASS1 == OLD || PASS2 == OLD) {
            toastr.Info('La contraseña no puede ser igual a la actual');
            return;
        }
        
        ExecSp(`sp_ChangePassword '${getUser.Id}', '${OLD}', '${PASS1}'`).then( data => {
            if (data[0].rpta == 0 || data[0].rpta == -2) {
                toastr.Error('Contacta tu administrador', 'Error');
                return;
            }

            if (data[0].rpta == -3) {
                toastr.Warning('Contraseña incorrecta');
                e.target[0].value = '';
                e.target[0].focus();
                return
            }
            
            toastr.Success('Contraseña actualizada correctamente');
            e.target[0].value = '';
            e.target[1].value = '';
            e.target[2].value = '';

        }).catch( error => {
            toastr.Error('Contacta tu administrador', 'Error');
        });

    });

});