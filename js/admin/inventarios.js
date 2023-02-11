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
        toastr.Success('Gestion de inventarios');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddInventory').click( () => {
        $('.modal').show();
        $('#intAdd').hide();
        LoadUsers();
        LoadProducts();
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#userFk').html('');
        $('#productFk').html('');
        $('#intLoad').val('');
        $('#intStock').val('');
        $('#intAdd').val('');
        $('#userFk').prop('disabled', false);
        $('#productFk').prop('disabled', false);
        sessionStorage.removeItem('InventoryEdit');
    });

    $('#intLoad').keyup( (e) => {
        $('#intStock').val(e.target.value);
    });

    $('#intAdd').change( (e) => {
        if (!e.target.value) {            
            $('#intLoad').val(parseInt(sessionStorage.Load));
            $('#intStock').val(parseInt(sessionStorage.Stock));
        } else {
            $('#intLoad').val(parseInt(sessionStorage.Load) + parseInt(e.target.value));
            $('#intStock').val(parseInt(sessionStorage.Stock) + parseInt(e.target.value));
        }
    });
    
    $('#formInventory').submit( (e) => {

        e.preventDefault();

        let user = e.target[0].value;
        let product = e.target[1].value;
        let load = e.target[2].value;
        let stock = e.target[3].value;
        
        if (!sessionStorage.InventoryEdit) {
            ExecSp(`sp_CreateInventory '${user}', '${product}', ${load}, ${stock}`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe inventario de este producto');
                    return;
                }
                
                toastr.Success('Inventario creado con exito');
                LoadGrid();
    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.InventoryEdit){
            ExecSp(`sp_UpdateInventory '${sessionStorage.InventoryEdit}', ${load}, ${stock}`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar el inventario');
                    return;
                }
                
                toastr.Success('Inventario actualizado con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetInventory`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay inventarios registrados');
                return;
            }

            $('#gridInventories').kendoGrid({
                language: "es-ES",
                dataSource: {
                    data: data,
                    aggregate: [{
                        field: "IntStock",
                        aggregate: "sum"
                    }],
                    group: { 
                        field: "StrUser",
                        aggregates: [
                            { field: "IntStock", aggregate: "sum" }
                        ]
                    }
                },
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string", editable: false },
                            UserFk: { type: "string", editable: false },
                            StrUser: { type: "string", editable: false },
                            ProductFk: { type: "string", editable: false },
                            StrProduct: { type: "string", editable: false },
                            IntLoad: { type: "number", editable: false },
                            IntStock: { type: "number", editable: false }
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
                        command: [
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditInventory
                            }
                        ], 
                        title: "Acciones"
                    },
                    {
                        field: "StrUser",
                        title: "Vendedor",
                        groupHeaderTemplate: "#=data.value# &nbsp;&nbsp;-&nbsp;&nbsp; #= aggregates.IntStock.sum # Productos"
                    },
                    {
                        field: "StrProduct",
                        title: "Producto"
                    },
                    {
                        field: "IntLoad",
                        title: "Cargue"
                    },
                    {
                        field: "IntStock",
                        title: "Stock"
                    }
                ]
            });
            
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
        
        function EditInventory(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('InventoryEdit', dataItem.Id);
            
            sessionStorage.setItem('Stock', dataItem.IntStock);
            sessionStorage.setItem('Load', dataItem.IntLoad);
            $('#intAdd').show();

            LoadUsers(dataItem.UserFk);
            LoadProducts(dataItem.ProductFk);
            $('#intLoad').val(dataItem.IntLoad);
            $('#intStock').val(dataItem.IntStock);

            $('#userFk').prop('disabled', true);
            $('#productFk').prop('disabled', true);

            $('.modal').show();
        }

    }

    function LoadUsers(value = '') {        
        ExecSp(`sp_GetActiveUsers`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay usuarios registrados');
                return;
            }
            
            let html = `<option value="">Usuario</option>`;

            for (let i = 0; i < data.length; i++) {
                html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
            }

            $('#userFk').html(html).val(value);;
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
    }

    function LoadProducts(value = '') {        
        ExecSp(`sp_GetProducts`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay productos registrados');
                return;
            }
            
            let html = `<option value="">Producto</option>`;

            for (let i = 0; i < data.length; i++) {
                html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
            }

            $('#productFk').html(html).val(value);;
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
    }

});