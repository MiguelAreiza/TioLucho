'use strict';
sessionStorage.removeItem('AppUser');

$(document).ready( () => {

    $('#btnBack').click( () => {

        goLocation.ChangeView('../../');

    });

    $('#formLogin').submit( (e) => {

        e.preventDefault();

        const USER = e.target[0].value;
        const PASS = e.target[1].value;

        ExecSp(`sp_ValidateLogin '${USER}', '${PASS}'`).then( data => {

            if (data[0].rpta == 0) {

                toastr.Warning('Credenciales erradas');
                return;

            }

            goLocation.ChangeView('../portal/');
            sessionStorage.setItem('AppUser', JSON.stringify(data[0]));

        }).catch( error => {
            toastr.Error('Contacta tu administrador', 'Error');
        });

    });

});