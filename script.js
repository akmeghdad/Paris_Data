var dataGet = [] ;
var dataAll = [] ;
var mymap, marker, timer, count, recordid;

$(function(){
    var htmlOption ='';
    count = 10;
    
    var url = "https://opendata.paris.fr/api/records/1.0/search/?dataset=autolib-disponibilite-temps-reel&rows="+count+"&facet=charging_status&facet=kind&facet=postal_code&facet=slots&facet=status&facet=subscription_status";
    $.get(url, 
        function (data, textStatus, jqXHR) {
            var trHead = '' ; 
            var number = '' ; 
            
            for (var i = 0; i < count; i++) {
                trHead += '<tr class="table_tr-content" data-id="'+ i +'" data-recordid="'+data.records[i].recordid+'" data-lat="' + data.records[i].fields.geo_point[0] +'" data-log="' + data.records[i].fields.geo_point[1] + '">';
                trHead += '<td>' + data.records[i].fields.address + '</td>';
                trHead += '<td>' + data.records[i].fields.cars + '</td>';
                trHead += '<td>' + data.records[i].fields.slots + '</td>';
                trHead += '</>';
            }
            $('.table__body').html(trHead);
            $('.table').toggle(100);
            console.log(data);

            for (var k = 1; k < parseInt(data.nhits/count); k++) {
                if (k == 7) { // show $ page for klick
                    number += '<span>...>></span>';
                    break;
                } else if(k ==1) {
                    number += '<a class="detail-table__page-link selected">'+ k +'</a>';
                } else {
                    number += '<a class="detail-table__page-link">'+ k +'</a>';
                }
            }
            $('.detail-table__number').html(number);
        }
    );
    
    // $("#js_select_addres").on('change', showPoint);
    $(document).on('click', '.table_tr-content', showInMaps);
    $(document).on('input', '#js_detail_input', searchPlace);
    $(document).on('click', '.detail-table__page-link', searchChangePage);

    /* ################### MAP ######################" */
    mymap = L.map('js_map').setView([48.8373119,2.2847182], 13);
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);
    /* ################### MAP ######################" */
    
});

function showInMaps() {
    var lat, log, id, htmlShow, address, car, slots;

    $('.table_tr-content').each(function (indexInArray) { 
         $(this).removeClass('selected');
    });

    $(this).addClass('selected');

    recordid = $(this).data('recordid');
    lat = $(this).data('lat');
    log = $(this).data('log');
    address = $(this).find(":first-child").text();
    car = $(this).find("td:nth-of-type(2)").text();
    slots = $(this).find("td:nth-of-type(3)").text();
    id = $(this).data('id');
    htmlShow ='<ul>';
    

    htmlShow += "<li>Adress: <strong>"+address+"</strong></li> "
    htmlShow += "<li>slot: <strong>"+car+"</strong></li> "
    htmlShow += "<li>cars: <strong>"+slots+"</strong></li> "
    htmlShow += "</ul>"

    if (marker) {
        mymap.removeLayer(marker)
    }
    
    marker = new L.Marker([lat,log], {draggable:false});
    mymap.addLayer(marker).panTo([lat,log]);
    marker.bindPopup("Your location:<br>"+htmlShow).openPopup();

}

function searchPlace() {
    var searchText, url;
    
    searchText = $("#js_detail_input").val();
    if (searchText == '') {
        url = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=autolib-disponibilite-temps-reel&rows='+count+'&facet=charging_status&facet=kind&facet=postal_code&facet=slots&facet=status&facet=subscription_status';
    } else {
        url = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=autolib-disponibilite-temps-reel&rows='+count+'&q='+searchText+'&facet=charging_status&facet=kind&facet=postal_code&facet=slots&facet=status&facet=subscription_status';
    }

    $.get(url, 
        function (data, textStatus, jqXHR) {
            var trHead = '' ; 
            var number = '' ; 
            // console.log(data);
            for (var i = 0; i < data.nhits; i++) {
                if (i == count) {
                    break;
                } else {
                    if (recordid == data.records[i].recordid) {
                        trHead += '<tr class="table_tr-content selected" data-id="'+ i +'" data-recordid="'+data.records[i].recordid+'" data-lat="' + data.records[i].fields.geo_point[0] +'" data-log="' + data.records[i].fields.geo_point[1] + '">';
                    }else{
                        trHead += '<tr class="table_tr-content" data-id="'+ i +'" data-recordid="'+data.records[i].recordid+'" data-lat="' + data.records[i].fields.geo_point[0] +'" data-log="' + data.records[i].fields.geo_point[1] + '">';
                    }

                    trHead += '<td>' + data.records[i].fields.address + '</td>';
                    trHead += '<td>' + data.records[i].fields.cars + '</td>';
                    trHead += '<td>' + data.records[i].fields.slots + '</td>';
                    trHead += '</tr>';
                }
            }
            $('.table__body').html(trHead);
            // $('.table').toggle(100);
            // console.log(data.nhits);

            for (var k = 1; k < parseInt(data.nhits/count); k++) {
                if (k == 7) { // show $ page for klick
                    number += '<a href="">...</a>';
                    break;
                } else if(k ==1){
                    number += '<a class="detail-table__page-link selected">'+ k +'</a>';
                }else {
                    number += '<a class="detail-table__page-link">'+ k +'</a>';
                }
            }
            $('.detail-table__number').html(number);
        }
    );
}

function searchChangePage() {

    var searchPage, searchText, url, thisNumber;
    
    searchText = $("#js_detail_input").val();
    thisNumber = $(this).text();
    searchPage = (thisNumber * 10)-10;

    if (searchText == '') {
        url = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=autolib-disponibilite-temps-reel&rows='+count+'&facet=charging_status&facet=kind&facet=postal_code&facet=slots&facet=status&facet=subscription_status&start='+searchPage;
    } else {
        url = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=autolib-disponibilite-temps-reel&rows='+count+'&q='+searchText+'&facet=charging_status&facet=kind&facet=postal_code&facet=slots&facet=status&facet=subscription_status&start='+searchPage;
    }
    

    $('.detail-table__page-link').each(function(){
        $(this).removeClass('selected');
    });

    $(this).addClass('selected');

    $.get(url, 
        function (data, textStatus, jqXHR) {
            var trHead = '' ; 
            var number = '' ; 
            // console.log(data);
            for (var i = 0; i < data.nhits; i++) {
                if (i == count) {
                    break;
                } else {
                    if (recordid == data.records[i].recordid) {
                        trHead += '<tr class="table_tr-content selected" data-id="'+ i +'" data-recordid="'+data.records[i].recordid+'" data-lat="' + data.records[i].fields.geo_point[0] +'" data-log="' + data.records[i].fields.geo_point[1] + '">';
                    }else{
                        trHead += '<tr class="table_tr-content" data-id="'+ i +'" data-recordid="'+data.records[i].recordid+'" data-lat="' + data.records[i].fields.geo_point[0] +'" data-log="' + data.records[i].fields.geo_point[1] + '">';
                    }
                    trHead += '<td>' + data.records[i].fields.address + '</td>';
                    trHead += '<td>' + data.records[i].fields.cars + '</td>';
                    trHead += '<td>' + data.records[i].fields.slots + '</td>';
                    trHead += '</tr>';
                }
            }
            $('.table__body').html(trHead);
            // $('.table').toggle(100);
            // console.log(data.nhits);

            for (var k = 1; k < parseInt(data.nhits/count); k++) {
                if (k == 7) { // show $ page for click
                    break;
                } else {
                    if (k == thisNumber) {
                        number += '<a class="detail-table__page-link selected">'+ k +'</a>';
                    }else{
                        number += '<a class="detail-table__page-link">'+ k +'</a>';
                    }
                }
            }
            $('.detail-table__number').html(number);
                console.log(thisNumber+'--'+k);
            
        }
    );
}
