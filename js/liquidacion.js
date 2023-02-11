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
        toastr.Success('Detalle a liquidar');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}


$(document).ready( () => {

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });
    
    ExecSp(`sp_GetPreLiquidation '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('El usuario aun no cuenta con una liquidación para mostrar');
            return;
        }
    
        let html = ``;
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            html += `<div class="record">
                        <label>${data[i].StrName}</label>
                        <label>${data[i].IntLoad}</label>
                        <label>${data[i].IntStock}</label>  
                        <label>${MoneyCast(data[i].Total)}</label>                          
                    </div>`;
            total += data[i].Total;
        }

        $('#records').html(html);
        $('#totalLiquidation').html(MoneyCast(total));

        ExecSp(`sp_GetCostsByUser '${getUser.Id}'`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('El usuario no ha tenido gastos el dia de hoy');
                return;
            }
            
            let html = ``;
            let totalC = 0;
            for (let i = 0; i < data.length; i++) {
                html += `<div class="record">
                            <label>${data[i].StrRemarks}</label>
                            <label>-</label>
                            <label>-</label>  
                            <label style="color:#f00;">-${MoneyCast(data[i].IntTotal)}</label>                          
                        </div>`;
                totalC += data[i].IntTotal;
            }
    
            $('#records').append(html);
            $('#totalLiquidation').html(MoneyCast(total - totalC));
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
            
    }).catch( error => {
        toastr.Error('Contacta tu administrador');
    });

});