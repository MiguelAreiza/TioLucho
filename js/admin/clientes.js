'use strict';

if (!sessionStorage.AppUser) {
    goLocation.ChangeView('../../../login/');
} else {
    ExecSp(`sp_ValidateUserById '${getUser.Id}'`).then( data => {

        if (data[0].rpta == 0) {
            goLocation.ChangeView('../../../login/');
        }
    
        $('#nameUser').html(getUser.NameUser);
        $('#nameRoute').html(getUser.NameRoute);
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
        $('#blActive').prop("checked", true);
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#cardQR').html('');
        $('#strName').val('');
        $('#strTel').val('');
        $('#strAddress').val('');
        $('#blActive').prop("checked", true);
        sessionStorage.removeItem('ClientEdit');
    });
    
    $('#formClient').submit( (e) => {

        e.preventDefault();

        let route = e.target[0].value;
        let name = e.target[1].value;
        let tel = e.target[2].value;
        let contact = e.target[3].value;
        let address = e.target[4].value;
        let delivery = (e.target[5].checked)? 1 : 0 ;
        let active = (e.target[6].checked)? 1 : 0 ;
        
        if (!sessionStorage.ClientEdit) {
            ExecSp(`sp_CreateClient '${route}', '${name}', '${tel}', '${contact}', '${address}', ${active}, ${delivery}`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe un cliente con estos datos');
                    return;
                }
                
                toastr.Success('Cliente creado con exito');
                LoadGrid();
    
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
                        e.target[4].value = '';
                        e.target[5].checked = false;
                        e.target[6].checked = true;
                            
                    }).catch( error => {
                        toastr.Error('Contacta tu administrador');
                    });
                
                }, 1500);
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.ClientEdit){
            ExecSp(`sp_UpdateClient '${sessionStorage.ClientEdit}', '${route}', '${name}', '${tel}', '${contact}', '${address}', ${active}, ${delivery}`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar el cliente');
                    return;
                }
                
                toastr.Success('Cliente actualizado con exito');
                LoadGrid();
                    
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
                            StrContact: { type: "string", editable: false },
                            StrAddress: { type: "string", editable: false },
                            BlActive: { type: "string", editable: false },
                            BlDelivery: { type: "string", editable: false }
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
                                iconClass: "btnDelete",
                                text: " ",
                                click: DeleteClient
                            },
                            { 
                                iconClass: "btnQR",
                                text: "📥",
                                click: DownloadQR
                            },
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditClient
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
                        field: "StrContact",
                        title: "Contacto"
                    },
                    {
                        field: "StrAddress",
                        title: "Dirección"
                    },
                    {
                        field: "BlActive",
                        title: "Activo"
                    },
                    {
                        field: "BlDelivery",
                        title: "Domicilio"
                    }
                ]
            });
            
        }).catch( error => {
            location.reload();
            toastr.Error('Contacta tu administrador');
        });
        
        function EditClient(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('ClientEdit', dataItem.Id);

            LoadRoutes(dataItem.RouteFk);
            $('#strName').val(dataItem.StrName);
            $('#strTel').val(dataItem.StrTel);
            $('#strContact').val(dataItem.StrContact);
            $('#strAddress').val(dataItem.StrAddress);
            $('#blDelivery').prop("checked", dataItem.BlDelivery);
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

        function DeleteClient(e) {
            $('.btnDelete').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr"));
            
            ExecSp(`sp_DeleteClient '${dataItem.Id}'`).then( data => {

                if (data[0].rpta == -4) {
                    toastr.Warning('No se puede eliminar, tiene relaciones en otras tablas');
                    return;
                }
                
                if (data[0].rpta == -2) {                    
                    toastr.Warning('Error al eliminar');
                    return;
                }
                
                toastr.Success('Cliente eliminado con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
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