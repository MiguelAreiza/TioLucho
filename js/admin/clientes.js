'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
        toastr.Success('Gestion de clientes');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddClient').click( () => {
        $('.modal').show();
        LoadRoutes();
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        LoadGrid();
        $('#cardQR').html('');
        $('#strName').val('');
        $('#strTel').val('');
        $('#strAddress').val('');
        $('#blActive').prop("checked", false);
        sessionStorage.removeItem('ClientEdit');
    });
    
    $('#formClient').submit( (e) => {

        e.preventDefault();

        let route = e.target[0].value;
        let name = e.target[1].value;
        let tel = e.target[2].value;
        let address = e.target[3].value;
        let active = (e.target[4].checked)? 1 : 0 ;
        
        if (!sessionStorage.ClientEdit) {
            ExecSp(`sp_CreateClient '${route}', '${name}', '${tel}', '${address}', ${active}`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe un cliente con estos datos');
                    return;
                }
                
                toastr.Success('Cliente creado con exito');
    
                $('#cardQR').html('');         
    
                new QRCode("cardQR", {
                    text: data[0].Id,
                    width: 200,
                    height: 200,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
    
                setTimeout(() => {
                    let base64Data = $("#cardQR > img").prop('src');
                    
                    ExecSp(`sp_AsignClientQR '${data[0].Id}', '${base64Data}'`).then( data => {
            
                        if (data[0].rpta == 0 || data[0].rpta == -2) {
                            toastr.Info('Error al asiganr el codigo QR');
                            return;
                        }
                        
                        toastr.Success('QR asignado correctamente');
    
                        e.target[0].value = '';
                        e.target[1].value = '';
                        e.target[2].value = '';
                        e.target[3].value = '';
                            
                    }).catch( error => {
                        toastr.Error('Contacta tu administrador');
                    });
                
                }, 1000);
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.ClientEdit){
            ExecSp(`sp_UpdateClient '${sessionStorage.ClientEdit}', '${route}', '${name}', '${tel}', '${address}', ${active}`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar el cliente');
                    return;
                }
                
                toastr.Success('Cliente actualizado con exito');    
                sessionStorage.removeItem('ClientEdit');
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetClients`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay clientes registrados');
                return;
            }

            $('#gridClients').kendoGrid({
                language: "es-ES",
                dataSource: data,
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string", editable: false },
                            RouteFk: { type: "string", editable: false },
                            StrQRCode: { type: "string", editable: false },
                            StrName: { type: "string", editable: false },
                            StrTel: { type: "string", editable: false },
                            StrAddress: { type: "string", editable: false },
                            BlActive: { type: "string", editable: false }
                        }
                    },
                },
                height: 350,
                scrollable: true,
                sortable: true,
                filterable: true,
                resizable: true,
                editable: false,
                toolbar: ["excel", "search"],
                mobile: true,
                dataBound: function () {
                    for (var i = 0; i < this.columns.length; i++) {
                    this.autoFitColumn(i);
                    }
                },
                columns: [
                    { 
                        command: [
                            { 
                                iconClass: "btnEdit",
                                text: "Editar",
                                click: EditClient
                            },
                            { 
                                iconClass: "btnQR",
                                text: " ",
                                click: DownloadQR
                            }
                        ], 
                        title: "Acciones"
                    },
                    {
                        field: "StrName",
                        title: "Nombre"
                    },
                    {
                        field: "StrTel",
                        title: "Celular"
                    },
                    {
                        field: "StrAddress",
                        title: "Dirección"
                    }
                ]
            });
            
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
        
        function EditClient(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('ClientEdit', dataItem.Id);

            LoadRoutes(dataItem.RouteFk);
            $('#strName').val(dataItem.StrName);
            $('#strTel').val(dataItem.StrTel);
            $('#strAddress').val(dataItem.StrAddress);
            $('#blActive').prop("checked", dataItem.BlActive);
            $('#cardQR').html(`<img style="display: block;" title="${dataItem.StrName}" src="${dataItem.StrQRCode}">`);

            $('.modal').show();
        }
        function DownloadQR(e) {
            $('.btnQR').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr")); 
            fetch(dataItem.StrQRCode)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${dataItem.StrName}Qr.png`;
                link.click();
            });
        }

    }

    function LoadRoutes(value = '') {        
        ExecSp(`sp_GetRoutes`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay rutas registradas');
                return;
            }
            
            let html = `<option value="">Ruta</option>`;

            for (let i = 0; i < data.length; i++) {
                html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
            }

            $('#routeFk').html(html).val(value);;
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
    }

});