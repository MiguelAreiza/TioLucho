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

    ExecSp(`sp_GetLiquidation`).then( data => {

        if (data[0].rpta == 0) {
            toastr.Info('Aun no hay liquidaciones registradas');
            return;
        }

        $('#gridLiquidations').kendoGrid({
            language: "es-ES",
            dataSource: {
                data: data,
                aggregate: [{
                    field: "IntTotal",
                    aggregate: "sum"
                }],
                group: { 
                    field: "StrName",
                    aggregates: [
                        { field: "IntTotal", aggregate: "sum" }
                    ]
                }
            },
            autoSync: true,
            schema: {
                model: {
                    fields: {
                        StrName: { type: "string", editable: false },
                        StrLoad: { type: "string", editable: false },
                        StrReturn: { type: "string", editable: false },
                        StrChange: { type: "string", editable: false },
                        IntSales: { type: "number", editable: false },
                        IntCosts: { type: "number", editable: false },
                        IntTotal: { type: "number", editable: false },
                        StrDate: { type: "string", editable: false }
                    }
                },
            },
            height: 500,
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
                    field: "StrName",
                    title: "Vendedor",
                    groupHeaderTemplate: " #=data.value# &nbsp;&nbsp;-&nbsp;&nbsp; Total: #= MoneyCast(aggregates.IntTotal.sum) #"
                },
                {
                    field: "StrDate",
                    title: "Fecha",
                    template: "#= StrDate.split('T')[0] #"                      
                },
                {
                    field: "StrLoad",
                    title: "Cargue"
                },
                {
                    field: "StrReturn",
                    title: "Sobrante"
                },
                {
                    field: "StrChange",
                    title: "Cambios"
                },
                {
                    field: "IntSales",
                    title: "Ventas",
                    template: "#= MoneyCast(IntSales) #"  
                },
                {
                    field: "IntCosts",
                    title: "Gastos",
                    template: "#= MoneyCast(IntCosts) #" 
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