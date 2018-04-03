function hxlProxyToJSON(input){
    var output = [];
    var keys = [];
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function print_filter(filter) {
    var f = eval(filter);
    if (typeof (f.length) != "undefined") {} else {}
    if (typeof (f.top) != "undefined") {
        f = f.top(Infinity);
    } else {}
    if (typeof (f.dimension) != "undefined") {
        f = f.dimension(function (d) {
            return "";
        }).top(Infinity);
    } else {}
    console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
}

//function generant les graphes
function generateCharts (pinData, geodata) {
    var mapp = dc.leafletChoroplethChart('#map');

    var cf = crossfilter(pinData);

    //print_filter(cf);
    var mapDimension = cf.dimension(function(d){
        return d['#adm2+code'];
    });
    var mapGroup = mapDimension.group();

    mapp.width($('#map').width())
        .dimension(mapDimension)
        .group(mapGroup)
        .zoom(0)
        .center([0, 0]) //nigeria 11.011/9.305
        .geojson(geodata)
        .colors(['#DDDDDD', '#A7C1D3', '#71A5CA', '#3B88C0', '#056CB6'])
        .colorDomain([0, 4])
        .colorAccessor(function (d) {
            var c = 0
            if (d > 250) {
                c = 4;
            } else if (d > 150) {
                c = 3;
            } else if (d > 50) {
                c = 2;
            } else if (d > 0) {
                c = 1;
            };
            return c;
        })
        .featureKeyAccessor(function (feature) {
            return feature.properties['admin2Pcod'];
        }).popup(function (feature) {
            return feature.properties['admin2Name'];
        });
   
   dc.renderAll();

    var map = mapp.map();
    zoomToGeom(geodata);

    function zoomToGeom(geodata) {
        var bounds = d3.geo.bounds(geodata);
        map.fitBounds([
            [bounds[0][1], bounds[0][0]],
            [bounds[1][1], bounds[1][0]]
        ]);
    }
    

} // fin generateCharts

function generateStaticCharts(){
    c3.generate({
        bindto: '#byCategoriesPIN',
        size: {height:200},
        data: {
            type: 'bar',
            columns: [
                ['IDPs',4232],
                ['Refugees',432],
                ['Returnees',1234]
            ]
        },
        axis:{
            rotate : true
        }

    });
}

var geodataCall = $.ajax({
    type: 'GET',
    url: 'data/north.json',
    dataType: 'json',
});

var pinByLGADataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1qMbVT00oTDq0EwaHPF_C3GYpcr8i9M0i106mv2n_Fns%2F%23gid%3D822770285&force=on',
    dataType: 'json',
});

$.when(pinByLGADataCall, geodataCall).then(function(pinByLGADataArgs, geomArgs){
    var pinByLGAData = hxlProxyToJSON(pinByLGADataArgs[0]);
    var sumChildrenF = 0;
    var idpPIN = 0; 
    var returneesPIN = 0;
    var remainingPIN = 0;

    pinByLGAData.forEach( function(e) {
        idpPIN += parseInt(e['#inneed+idps']) ; 
        returneesPIN += parseInt(e['#inneed+returnees']) ;
        remainingPIN += parseInt(e['#inneed+others']) ;

    });

    //console.log(remainingPIN);
    generateStaticCharts();


    var geom = geomArgs[0];

    generateCharts(pinByLGAData, geom);
    //console.log(pinByLGAData)
});