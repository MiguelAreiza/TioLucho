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
        toastr.Success('Gestion de rutas');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddRoute').click( () => {
        $('.modal').show();
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#strName').val('');
        sessionStorage.removeItem('RouteEdit');
    });
    
    $('#formRoute').submit( (e) => {

        e.preventDefault();

        let name = e.target[0].value;
        
        if (!sessionStorage.RouteEdit) {
            ExecSp(`sp_CreateRoute '${name}'`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe una ruta con estos datos');
                    return;
                }
                
                toastr.Success('Ruta creada con exito');
                LoadGrid();
                $('#strName').val('');
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.RouteEdit){
            ExecSp(`sp_UpdateRoute '${sessionStorage.RouteEdit}', '${name}'`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar la ruta');
                    return;
                }
                
                toastr.Success('Ruta actualizada con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetRoutes`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay rutas registradas');
                return;
            }

            $('#gridRoutes').kendoGrid({
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
                                click: DeleteRoute
                            },
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditRoute
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
        
        function EditRoute(e) {
            $('.btnEdit').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('RouteEdit', dataItem.Id);

            $('#strName').val(dataItem.StrName);

            $('.modal').show();
        }

        function DeleteRoute(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            
            ExecSp(`sp_DeleteRoute '${dataItem.Id}'`).then( data => {

                if (data[0].rpta == -4) {
                    toastr.Warning('No se puede eliminar, tiene relaciones en otras tablas');
                    return;
                }
                if (data[0].rpta == -2) {                    
                    toastr.Warning('Error al eliminar');
                    return;
                }
                
                toastr.Success('Ruta eliminada con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    }

});