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
        
        toastr.Success('Nueva venta');
        sessionStorage.removeItem('Delivery');

    }).catch( error => {
        goLocation.ChangeView('../../login/');
    });
}

$(document).ready( () => {
    
    let sales = []; 

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

    $('#blNotSale').change( (e) => {

        if (e.target.checked) {
            $('#ReasonField').show();
            $('#btnNotificate').show();
        } else {
            $('#ReasonField').hide();
            $('#btnNotificate').hide();
        }

    });

    $('#notSale').submit( (e) => {

        e.preventDefault();
        
        let reason = e.target[1].value;

        if (!reason) {
            toastr.Warning('Debes ingresar un motivo de no compra');
            return;
        }

        ExecSp(`sp_CreateNotSale '${getUser.Id}', '${$('#strClient').val()}', '${new Date().toLocaleString().replace(' ', '')}', '${reason}'`).then( data => {

            if (data[0].rpta == -1 || data[0].rpta == -2) {
                toastr.Warning('Intentalo de nuevo, error al generar notificación');
                return;
            }
            
            toastr.Success('Notificación generada con exito');
            setTimeout(() => {
                goLocation.ChangeView('../');
            }, 1500);
        
        }).catch( error => {
            goLocation.ChangeView('../');
        });

    });

    var Scanner = new Html5QrcodeScanner(
        "reader", { 
            fps: 10, 
            qrbox: 250 
        }
    );
    
    Scanner.render(onScanSuccess, onScanError);
    
    $("#reader > div:nth-child(1)").hide();
    $("#reader__dashboard_section_csr > div > button").click();
    $("#reader__dashboard_section > div:nth-child(2)").hide();

    function onScanSuccess(qrCodeMessage) {
        
        $('#audioQr')[0].play();

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(qrCodeMessage)) {            
            toastr.Warning('Qr no valido');
            return;
        }

        ExecSp(`sp_ValidateClientQR '${qrCodeMessage}', '${getUser.RouteId}'`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Warning('Cliente no registrado para esta ruta');
                return;
            }
            
            $('#strClient').html(`<option value="${data[0].Id}">${data[0].StrName}</option>`);

            if (data[0].BlDelivery == 1) {
                sessionStorage.setItem('Delivery','true');
                $('#IntTotal').prop('disabled', false);
            } else {
                sessionStorage.removeItem('Delivery')
                $('#IntTotal').prop('disabled', true);
            }

            setTimeout(() => {                
                $('#reader').remove();
            }, 200);
        
        }).catch( error => {
            toastr.Info('Intentalo de nuevo', 'Error en la lectura');
        });

    }
    
    function onScanError(errorMessage) {
        toastr.Info('Enfoca el codigo');
    }
    
    $('#btnBack, #LogoHome, #btnCancel').click( () => {        
        goLocation.ChangeView('../');
    });
    
    $('#btnSave').click( () => {
        
        if (sales.length < 1) {
            toastr.Warning('No tienes registros para facturar');
            return;
        }

        ExecSp(`sp_CreateInvoice '${getUser.Id}', '${$('#strClient').val()}', '${new Date().toLocaleString().replace(' ', '')}'`).then(async data => {

            if (data[0].rpta == -1 || data[0].rpta == -2) {
                toastr.Warning('Intentalo de nuevo, error al generar consecutivo');
                return;
            }
            
            let invoice = data[0].Id;

            for (let i = 0; i < sales.length; i++) {
                let prodId = sales[i].prodId;
                let cantV = sales[i].cantV;
                let cantC = sales[i].cantC;
                let total = parseFloat(sales[i].total.split(' ')[1].replace(',', ''));
                await ExecSp(`sp_CreateSale '${invoice}', '${prodId}', ${cantV}, ${cantC}, ${total}`).then( data => {
                    if (data[0].rpta == -1 || data[0].rpta == -2) {
                        toastr.Warning('Error en Proceso de facturación');
                        return
                    }                
                }).catch( error => {
                    toastr.Warning('Error en Proceso de facturación');
                    return
                });
            }

            toastr.Success('Factura generada con exito');
            setTimeout(() => {
                goLocation.ChangeView('../');
            }, 1500);
        
        }).catch( error => {
            toastr.Error('Error al generar la factura, intentalo de nuevo');
        });    

    });

    $('#strProduct, #IntCantV').change( (e) => {
        if (!sessionStorage.Delivery) {
            let cant = e.target.form[1].value;
            let price = e.target.form[0].value.split('/')[1];
    
            if (cant && price) {
                e.target.form[3].value = MoneyCast(parseFloat(cant) * parseFloat(price));
            }
        }
    });

    $('#formSale').submit( (e) => {

        e.preventDefault();

        let produ = e.target[0].value.split('/')[2];
        let prodId = e.target[0].value.split('/')[0];
        let cantV = e.target[1].value;
        let cantC = e.target[2].value;
        let total = e.target[3].value;

        if (sessionStorage.Delivery) {
            total = MoneyCast(parseInt(cantV) * parseFloat(total));
        }

        if (sales.filter(sale => sale.prodId == prodId).length > 0) {
            toastr.Warning('Ya ingresaste este producto');
            return;
        }

        ExecSp(`sp_ValidateStock '${getUser.Id}', '${prodId}'`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('No cuentas con stock de este producto');
                return;
            }
            
            if (data[0].IntStock < (parseInt(cantV) + parseInt(cantC))) {                
                toastr.Info(`No te alcanza, solo cuentas con ${data[0].IntStock} unidades`);
                return;
            }

            $('#records').append(`<div id="record${sales.length + 1}" class="record">
                                <label>${produ}</label>
                                <label>${cantV}</label>
                                <label>${cantC}</label>
                                <label>${total}</label>
                            </div> `);
        
            sales.push({'prodId':prodId,'cantV':cantV,'cantC':cantC,'total':total});

            let actual = parseFloat($('#totalInvoice').html().split(' ')[1].replace(',',''));
            let nuevo = parseFloat(total.split(' ')[1].replace(',',''));

            $('#totalInvoice').html(MoneyCast(actual + nuevo));

            e.target[0].value = '';
            e.target[1].value = '';
            e.target[2].value = 0;
            e.target[3].value = '';
        
        }).catch( error => {
            goLocation.ChangeView('../');
        });

    });

});