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
        toastr.Success('Gestion de productos');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddProduct').click( () => {
        $('.modal').show();
        LoadCategories();
        $('#blActive').prop("checked", true);
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#categoryFk').html('');
        $('#strName').val('');
        $('#intCost').val('');
        $('#intPrice').val('');
        $('#blActive').prop("checked", true);
        sessionStorage.removeItem('ProductEdit');
    });
    
    $('#formProduct').submit( (e) => {

        e.preventDefault();

        let category = e.target[0].value;
        let name = e.target[1].value;
        let cost = e.target[2].value;
        let price = e.target[3].value;
        let active = (e.target[4].checked)? 1 : 0 ;
        
        if (!sessionStorage.ProductEdit) {
            ExecSp(`sp_CreateProduct '${category}', '${name}', '${cost}', '${price}', ${active}`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe un producto con estos datos');
                    return;
                }
                
                toastr.Success('Producto creado con exito');
                LoadGrid();
    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.ProductEdit){
            ExecSp(`sp_UpdateProduct '${sessionStorage.ProductEdit}', '${category}', '${name}', '${cost}', '${price}', ${active}`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar el producto');
                    return;
                }
                
                toastr.Success('Producto actualizado con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetAllProducts`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay productos registrados');
                return;
            }

            $('#gridProducts').kendoGrid({
                language: "es-ES",
                dataSource: data,
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string", editable: false },
                            CategoryFk: { type: "string", editable: false },
                            StrName: { type: "string", editable: false },
                            IntCost: { type: "string", editable: false },
                            IntPrice: { type: "string", editable: false },
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
                                iconClass: "btnDelete",
                                text: " ",
                                click: DeleteProduct
                            },
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditProduct
                            }
                        ], 
                        title: "Acciones"
                    },
                    {
                        field: "StrName",
                        title: "Nombre"
                    },
                    {
                        field: "IntCost",
                        title: "Costo",
                        template: "#= MoneyCast(IntCost) #"
                    },
                    {
                        field: "IntPrice",
                        title: "Precio",
                        template: "#= MoneyCast(IntPrice) #"
                    },
                    {
                        title: "Ganancia",
                        template: "#= MoneyCast(IntPrice - IntCost) #"
                    },
                    {
                        field: "BlActive",
                        title: "Activo"
                    }
                ]
            });
            
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
        
        function EditProduct(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('ProductEdit', dataItem.Id);

            LoadCategories(dataItem.CategoryFk);
            $('#strName').val(dataItem.StrName);
            $('#intCost').val(dataItem.IntCost);
            $('#intPrice').val(dataItem.IntPrice);
            $('#blActive').prop("checked", dataItem.BlActive);

            $('.modal').show();
        }
        
        function DeleteProduct(e) {
            $('.btnEdit').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr"));
            
            ExecSp(`sp_DeleteProduct '${dataItem.Id}'`).then( data => {

                if (data[0].rpta == -4) {
                    toastr.Warning('No se puede eliminar, tiene relaciones en otras tablas');
                    return;
                }
                if (data[0].rpta == -2) {                    
                    toastr.Warning('Error al eliminar');
                    return;
                }
                
                toastr.Success('Producto eliminada con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    }

    function LoadCategories(value = '') {        
        ExecSp(`sp_GetCategories`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay categorias registradas');
                return;
            }
            
            let html = `<option value="">Categoría</option>`;

            for (let i = 0; i < data.length; i++) {
                html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
            }

            $('#categoryFk').html(html).val(value);;
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
    }

});