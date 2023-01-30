'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
        toastr.Success('Nueva venta');
    
    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}

$(document).ready( () => {

    // function onScanSuccess(qrCodeMessage) {
    //     $('#strClient').val(qrCodeMessage.toLowerCase());
    // }
    
    // function onScanError(errorMessage) {
    //     toastr.Info('Enfoca el codigo');
    // }
    
    // var Scanner = new Html5QrcodeScanner(
    //     "reader", { 
    //         fps: 10, 
    //         qrbox: 250 
    //     }
    // );
    
    // Scanner.render(onScanSuccess, onScanError);
    
    // $("#reader > div:nth-child(1)").hide();
    // $("#reader__dashboard_section_csr > div > button").click();
    // $("#reader__dashboard_section > div:nth-child(2)").hide();

    // if ($("#reader__camera_selection")[0][1]) {
    //     $("#reader__camera_selection").val($("#reader__camera_selection")[0][1].value)
    // }

    ExecSp(`sp_GetClientsByRouteId '${getUser.RouteId}'`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no existen clientes para esta ruta');
            return;
        }
        
        let html = `<option value="">Cliente</option>`;

        for (let i = 0; i < data.length; i++) {
            html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
        }

        $('#strClient').html(html);
    
    }).catch( error => {
        goLocation.ChangeView('../');
    });

    
    
    let sales = [];
    
    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });
    
    $('#btnChangePass').click( () => {
        goLocation.ChangeView('./change/');
    });
    
    ExecSp(`sp_GetProducts`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no existen productos');
            return;
        }
        
        let html = `<option value="">Producto</option>`;

        for (let i = 0; i < data.length; i++) {
            html += `<option value="${data[i].Id}/${data[i].IntPrice}/${data[i].StrName}">${data[i].StrName}</option>`;
        }

        $('#strProduct').html(html);
    
    }).catch( error => {
        goLocation.ChangeView('../');
    });
    
    $('#strProduct, #IntCantV').change( (e) => {
        let cant = e.target.form[1].value;
        let price = e.target.form[0].value.split('/')[1];

        if (cant && price) {
            e.target.form[3].value = MoneyCast(parseFloat(cant) * parseFloat(price));
        }
    });

    $('#formSale').submit( (e) => {

        e.preventDefault();

        let produ = e.target[0].value.split('/')[2];
        let cantV = e.target[1].value;
        let cantC = e.target[2].value;
        let total = e.target[3].value;

        if (sales.filter(sale => sale.produ == produ).length > 0) {
            toastr.Warning('Ya ingresaste este producto');
            return;
        }
        
        $('#records').append(`<div id="record${sales.length + 1}" class="record">
                                <label>${produ}</label>
                                <label>${cantV}</label>
                                <label>${cantC}</label>
                                <label>${total}</label>
                            </div> `);
        
        sales.push({'produ':produ,'cantV':cantV,'cantC':cantC,'total':total});

        e.target[0].value = '';
        e.target[1].value = '';
        e.target[2].value = '';
        e.target[3].value = '';

    });

});