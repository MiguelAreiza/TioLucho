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
        toastr.Success('Gestion de no ventas');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {
    
    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    ExecSp(`sp_GetNotSales`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no hay no compras registradas');
            return;
        }

        $('#gridNotSales').kendoGrid({
            language: "es-ES",
            dataSource: data,
            autoSync: true,
            schema: {
                model: {
                    fields: {
                        StrClient: { type: "string", editable: false },
                        StrUser: { type: "string", editable: false },
                        StrDate: { type: "string", editable: false },
                        StrReason: { type: "string", editable: false }
                    }
                },
            },
            height: 450,
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
                    field: "StrClient",
                    title: "Cliente"
                },
                {
                    field: "StrDate",
                    title: "Fecha",
                    template: "#= StrDate.split(',')[0] #"
                },
                {
                    field: "StrDate",
                    title: "Hora",
                    template: "#= StrDate.split(',')[1] #"
                },
                {
                    field: "StrUser",
                    title: "Vendedor"
                },
                {
                    field: "StrReason",
                    title: "Motivo"
                }
            ]
        });
        
    }).catch( error => {
        toastr.Error('Contacta tu administrador');
    });

});