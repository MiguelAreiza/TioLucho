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
        toastr.Success('Gestion de usuarios');
    
    }).catch( error => {
        goLocation.ChangeView('../../../login/');
    });
}

$(document).ready( () => {

    LoadGrid();

    $('#btnBack, #LogoHome').click( () => {        
        goLocation.ChangeView('../');
    });

    $('#btnAddUser').click( () => {
        $('.modal').show();
        LoadRoles();
        LoadRoutes();
        $('#blActive').prop("checked", true);
    });

    $('.closeModal').click( () => {
        $('.modal').hide();
        $('#roleFk').html('');
        $('#routeFk').html('');
        $('#strDoc').val('');
        $('#strName').val('');
        $('#strTel').val('');
        $('#strUser').val('');
        $('#strPass').val('');
        $('#strConfirm').val('');
        $('#blActive').prop("checked", true);
        sessionStorage.removeItem('UserEdit');
    });
    
    $('#formUser').submit( (e) => {

        e.preventDefault();

        let role = e.target[0].value;
        let route = e.target[1].value;
        let doc = e.target[2].value;
        let name = e.target[3].value;
        let tel = e.target[4].value;
        let user = e.target[5].value;
        let pass = e.target[6].value;
        let confirm = e.target[7].value;
        let active = (e.target[8].checked)? 1 : 0 ;

        if (pass !== confirm) {
            toastr.Warning('Las contraseñas deben de coincidir');
            return;
        }
        
        if (!sessionStorage.UserEdit) {
            ExecSp(`sp_CreateUser '${role}', '${route}', '${doc}', '${name}', '${tel}', '${user}', '${pass}', ${active}`).then( data => {

                if (data[0].rpta == -1 || data[0].rpta == -2) {
                    toastr.Info('Ya existe un usuario con estos datos');
                    return;
                }
                
                toastr.Success('Usuario creado con exito');
                LoadGrid();
                $('#roleFk').val('');
                $('#routeFk').val('');
                $('#strDoc').val('');
                $('#strName').val('');
                $('#strTel').val('');
                $('#strUser').val('');
                $('#strPass').val('');
                $('#strConfirm').val('');
                $('#blActive').prop("checked", true);
    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        } else if (sessionStorage.UserEdit){
            ExecSp(`sp_UpdateUser '${sessionStorage.UserEdit}', '${role}', '${route}', '${doc}', '${name}', '${tel}', '${user}', '${pass}', ${active}`).then( data => {

                if (data[0].rpta == 0 || data[0].rpta == -2) {
                    toastr.Warning('Error al actualizar el usuario');
                    return;
                }
                
                toastr.Success('Usuario actualizado con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    });
    
    function LoadGrid() {

        ExecSp(`sp_GetUsers`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay usuarios registrados');
                return;
            }

            $('#gridUsers').kendoGrid({
                language: "es-ES",
                dataSource: data,
                autoSync: true,
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string", editable: false },
                            RoleFk: { type: "string", editable: false },
                            RouteFk: { type: "string", editable: false },
                            StrDoc: { type: "string", editable: false },
                            StrName: { type: "string", editable: false },
                            StrTel: { type: "string", editable: false },
                            StrUser: { type: "string", editable: false },
                            StrPass: { type: "string", editable: false },
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
                                click: DeleteUser
                            },
                            { 
                                iconClass: "btnEdit",
                                text: "Edit",
                                click: EditUser
                            }
                        ], 
                        title: "Acciones"
                    },
                    {
                        field: "StrName",
                        title: "Nombre"
                    },
                    {
                        field: "StrDoc",
                        title: "Documento"
                    },
                    {
                        field: "StrTel",
                        title: "Celular"
                    },
                    {
                        field: "BlActive",
                        title: "Activo"
                    }
                ]
            });
            
        }).catch( error => {
            location.reload();
            toastr.Error('Contacta tu administrador');
        });
        
        function EditUser(e) {
            var dataItem = this.dataItem($(e.target).closest("tr"));
            sessionStorage.setItem('UserEdit', dataItem.Id);

            LoadRoles(dataItem.RoleFk);
            LoadRoutes(dataItem.RouteFk);
            $('#strDoc').val(dataItem.StrDoc);
            $('#strName').val(dataItem.StrName);
            $('#strTel').val(dataItem.StrTel);
            $('#strUser').val(dataItem.StrUser);
            $('#strPass').val(dataItem.StrPass);
            $('#strConfirm').val(dataItem.StrPass);
            $('#blActive').prop("checked", dataItem.BlActive);
            
            $('.modal').show();
        }
        
        function DeleteUser(e) {
            $('.btnEdit').prop('disabled', true);
            var dataItem = this.dataItem($(e.target).closest("tr"));
            
            ExecSp(`sp_DeleteUser '${dataItem.Id}'`).then( data => {

                if (data[0].rpta == -4) {
                    toastr.Warning('No se puede eliminar, tiene relaciones en otras tablas');
                    return;
                }
                if (data[0].rpta == -2) {                    
                    toastr.Warning('Error al eliminar');
                    return;
                }
                
                toastr.Success('Usuario eliminado con exito');
                LoadGrid();
                    
            }).catch( error => {
                toastr.Error('Contacta tu administrador');
            });
        }

    }

    function LoadRoles(value = '') {        
        ExecSp(`sp_GetRoles`).then( data => {

            if (data[0].rpta == 0) {
                toastr.Info('Aun no hay roles registradas');
                return;
            }
            
            let html = `<option value="">Rol</option>`;

            for (let i = 0; i < data.length; i++) {
                html += `<option value="${data[i].Id}">${data[i].StrName}</option>`;
            }

            $('#roleFk').html(html).val(value);;
                
        }).catch( error => {
            toastr.Error('Contacta tu administrador');
        });
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