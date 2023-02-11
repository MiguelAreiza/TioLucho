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
        toastr.Success('Gastos del día');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}


$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });
    
    ExecSp(`sp_GetCostsByUser '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('El usuario no ha tenido gastos el dia de hoy');
            return;
        }
        
        let html = ``;
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            html += `<div class="record">
                        <label>${data[i].StrDate.split('T')[0]}</label>
                        <label>${data[i].StrRemarks}</label>
                        <label>${MoneyCast(data[i].IntTotal)}</label>                          
                    </div>`;
            total += data[i].IntTotal;
        }

        $('#records').html(html);
        $('#totalCosts').html(MoneyCast(total));
        
    }).catch( error => {debugger
        toastr.Error('Contacta tu administrador');
    });

    $('#formCost').submit( (e) => {

        e.preventDefault();

        let remark = e.target[0].value;
        let total = e.target[1].value;

        ExecSp(`sp_CreateCost '${getUser.Id}', '${remark}', ${total}`).then( data => {

            if (data[0].rpta == -1 || data[0].rpta == -2) {
                toastr.Warning('Error al crear el gasto intentalo de nuevo');
                return;
            }
            
            toastr.Success('Gasto creado con exito');
            setTimeout(() => {
                goLocation.ChangeView('../');
            }, 2000);
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });

    });

});