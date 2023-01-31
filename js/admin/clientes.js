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

    ExecSp(`sp_GetClients`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no hay clientes registrados');
            return;
        }
        
        $("#grid").kendoGrid({
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
                    },
                },
            },
            height: 350,
            scrollable: true,
            sortable: true,
            filterable: true,
            resizable: true,
            editable: false,
            toolbar: ["excel", "search"],
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
                            text: " ",
                            // click: EditAvatar
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

    $('#btnAddClient').click( () => {
        $('.modal').show();
        sessionStorage.setItem('Action', 'New');
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        sessionStorage.removeItem('Action');
    });
    
    $('#btnSaveClient').cl

});