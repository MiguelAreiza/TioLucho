'use strict';

$(document).ready( () => {

    function onScanSuccess(qrCodeMessage) {
        document.getElementById('result').innerHTML = '<span class="result">'+qrCodeMessage+'</span>';
    }

    function onScanError(errorMessage) {
      //handle scan error
    }

    var html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { 
            fps: 10, 
            qrbox: 250 
        }
    );

    html5QrcodeScanner.render(onScanSuccess, onScanError);

    $("#reader > div:nth-child(1)").hide();
    $("#reader__dashboard_section_csr > div > button").click();

})