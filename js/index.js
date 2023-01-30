'use strict';
sessionStorage.removeItem('AppUser');

$(document).ready( () => {

    $('#btnStart').click( () => {

        goLocation.ChangeView('./views/login/');   
        
    });

});