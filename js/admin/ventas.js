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
        toastr.Success('Gestion de ventas');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {
    
    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    ExecSp(`sp_GetInvoices`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no hay ventas registradas');
            return;
        }

        $('#gridSales').kendoGrid({
            language: "es-ES",
            dataSource: {
                data: data,
                aggregate: [{
                    field: "IntTotal",
                    aggregate: "sum"
                }],
                group: { 
                    field: "IntSerial",
                    aggregates: [
                        { field: "IntTotal", aggregate: "sum" }
                    ]
                }
            },
            autoSync: true,
            schema: {
                model: {
                    fields: {
                        StrUser: { type: "string", editable: false },
                        StrClient: { type: "string", editable: false },
                        StrDate: { type: "string", editable: false },
                        IntSerial: { type: "string", editable: false },
                        StrProduct: { type: "string", editable: false },
                        IntSale: { type: "string", editable: false },
                        IntChange: { type: "string", editable: false },
                        IntTotal: { type: "string", editable: false }
                    }
                },
            },
            height: 600,
            scrollable: true,
            sortable: true,
            filterable: true,
            resizable: true,
            editable: false,
            toolbar: ["excel", "search"],
            mobile: true,
            // groupable: true,
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
                    field: "IntSerial",
                    title: "Factura",
                    groupHeaderTemplate: "Factura #=data.value# &nbsp;&nbsp;-&nbsp;&nbsp; Total: #= MoneyCast(aggregates.IntTotal.sum) #"
                },
                {
                    field: "StrProduct",
                    title: "Producto"
                },
                {
                    field: "IntSale",
                    title: "Venta"
                },
                {
                    field: "IntChange",
                    title: "Cambio"
                },
                {
                    field: "IntTotal",
                    title: "Total",
                    template: "#= MoneyCast(IntTotal) #"                        
                }
            ]
        });
        
    }).catch( error => {
        toastr.Error('Contacta tu administrador');
    });

});