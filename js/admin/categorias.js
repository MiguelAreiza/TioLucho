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
        toastr.Success('Gestion de categorias');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddCategory').click( () => {
        $('.modal').show();
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#strName').val('');
        sessionStorage.removeItem('CategoryEdit');
    });
    
    $('#formCategory').submit( (e) => {

        e.preventDefault();

        let name = e.target[0].value;
        
        if (!sessionStorage.CategoryEdit) {
            ExecSp(`sp_CreateCategory '${name}'`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe una categoria con estos datos');
                    return;
                }
                
                toastr.Success('Categoría creada con exito');
                LoadGrid();
                $('#strName').val('');
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.CategoryEdit){
            ExecSp(`sp_UpdateCategory '${sessionStorage.CategoryEdit}', '${name}'`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar la categoría');
                    return;
                }
                
                toastr.Success('Categoría actualizada con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetCategories`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay categorias registradas');
                return;
            }

            $('#gridCategories').kendoGrid({
                language: "es-ES",
                dataSource: data,
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string", editable: false },
                            StrName: { type: "string", editable: false }
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
                columns: [
                    { 
                        command: [
                            { 
                                iconClass: "btnDelete",
                                text: " ",
                                click: DeleteCategory
                            },
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditCategory
                            }
                        ], 
                        title: "Acciones"
                    },
                    {
                        field: "StrName",
                        title: "Nombre"
                    }
                ]
            });
            
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
        
        function EditCategory(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('CategoryEdit', dataItem.Id);

            $('#strName').val(dataItem.StrName);

            $('.modal').show();
        }

        function DeleteCategory(e) {
            $('.btnDelete').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr"));
            
            ExecSp(`sp_DeleteCategory '${dataItem.Id}'`).then( data => {

                if (data[0].rpta == -4) {
                    toastr.Warning('No se puede eliminar, tiene relaciones en otras tablas');
                    return;
                }
                if (data[0].rpta == -2) {                    
                    toastr.Warning('Error al eliminar');
                    return;
                }
                
                toastr.Success('Categoría eliminada con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    }

});