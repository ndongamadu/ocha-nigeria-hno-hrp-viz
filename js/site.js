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

var formatComma = d3.format(',');
var formatDecimalComma = d3.format(",.0f");

var pinBySexM = ['M',23],
    pinBySexF = ['F',345];

function generatePieCharts(val1, val2, bindTo){
    c3.generate({
        bindto: bindTo,
        size: {height: 200},
        data: {
            columns: [
                val1,val2,
            ],
            type: 'pie',
        }
    });

} //end of generatePieCharts

function checkIntData(d){
    return (isNaN(parseInt(d)) || parseInt(d)<0) ? 0 : parseInt(d);
};

function generateViz (hnoData, hrpData, geom, focus) {
    var targedtByByLgaChart = dc.rowChart('#hrptargedByState');
    var targedtByLgaChart = dc.rowChart('#hrptargedByLGA');
    var mapp = dc.leafletChoroplethChart('#map');

    hrpData.forEach( function(element) {
        element['#targeted+total'] = checkIntData(element['#targeted+total']);
        element['#targeted+idps'] = checkIntData(element['#targeted+idps']);
        element['#targeted+others'] = checkIntData(element['#targeted+others']);
        element['#targeted+returnees'] = checkIntData(element['#targeted+returnees']);
    });

    hnoData.forEach( function(element) {
        element['#inneed+total'] = checkIntData(element['#inneed+total']);
        element['#inneed+idps'] = checkIntData(element['#inneed+idps']);
        element['#inneed+others'] = checkIntData(element['#inneed+others']);
        element['#inneed+returnees'] = checkIntData(element['#inneed+returnees']);
        element['#inneed+f+children'] = checkIntData(element['#inneed+f+children']);
    });

    var sortData = function (d1, d2) {
        if (d1.key > d2.key) return 1;
        if (d1.key < d2.key) return -1;
        return 0;
    };

    var cfHrp = crossfilter(hrpData);
    var cfHno = crossfilter(hnoData);

    var dimHRPLGA = cfHrp.dimension(function(d){ return d['#adm2+name']; });
    var hrpDim = cfHrp.dimension(function (d){ return [d['#adm1+name'], d['#sector']]; });

    var dimHRPLGA = cfHrp.dimension(function(d){ return d['#adm2+name']; });
    var dimHRPState = cfHrp.dimension(function(d){ return d['#adm1+name']; });

    var hrpDim = cfHrp.dimension(function (d){ return [d['#adm1+name'], d['#sector']]; });

    var dimHNOLGA = cfHno.dimension(function(d){ return d['#adm2+name'];});


    // var hrpGroup = hrpDim.group().reduce(
    //     function(p,v){
    //         //p.total += +v['#targeted+total'];
    //         p.idp += +v['#targeted+idps'];
    //         p.remaining += +v['#targeted+others'];
    //         p.returnees += +v['#targeted+returnees'];

    //         return p;
    //     },
    //     function(p,v){
    //        // p.total -= +v['#targeted+total'];
    //         p.idp -= +v['#targeted+idps'];
    //         p.remaining -= +v['#targeted+others'];
    //         p.returnees -= +v['#targeted+returnees'];

    //         p.total < 0 ? p.total = 0 : '';

    //         return p;
    //     },
    //     function(){
    //         return {
    //             //total: 0,
    //             idp: 0,
    //             remaining: 0,
    //             returnees: 0
    //         };

    //     }
    //     ).top(Infinity).sort(sortData);

    var hrpGroup = hrpDim.group().reduceSum(function(d){ return d['#total'];}).top(Infinity).sort(sortData);
    var groupHRPLGA = dimHRPLGA.group().reduceSum(function(d){ return d['#total'];});
    var groupHRPState = dimHRPState.group().reduceSum(function(d){ return d['#total'];});

    var groupHNOLGA = dimHNOLGA.group().reduceSum(function(d){ return d['#total'];});

    var adamaouaArr = [],
        bornoArr = [],
        yobeArr = [];



    for (var i = 0; i < hrpGroup.length; i++) {
        hrpGroup[i].key[0] == 'Adamawa' ? adamaouaArr.push([hrpGroup[i].key[1],hrpGroup[i].value]) :
        hrpGroup[i].key[0] == 'Borno' ? bornoArr.push([hrpGroup[i].key[1],hrpGroup[i].value]) :
        hrpGroup[i].key[0] == 'Yobe' ? yobeArr.push([hrpGroup[i].key[1],hrpGroup[i].value]) : '';
    }
    var mapping = {};
    mapping['adamawa'] = {'region' : 'Adamawa', 'data': adamaouaArr};
    mapping['borno'] = {'region' : 'Borno', 'data': bornoArr};
    mapping['yobe'] = {'region' : 'Yobe', 'data': yobeArr};

    $('#charts').html(' ');

        for (k in mapping ){
            $('#charts').append('<div class="col-md-4"><h4>'+mapping[k].region+'</h4><div id="'+k+'"></div></div>');
            c3.generate({
                bindto: '#'+k+'',
                data: {
                    columns: mapping[k].data,
                    type: 'bar'
                },
                axis: {
                    y: {  
    //                    label: 'Number of people assisted',
                        show: true,
                        tick: {
    //                        count:10,
                            format: formatComma,
                        }
                    },
                    x: {
                        show: false
                    }
                },
                size: {
                    height: 600
                },
                color:{
                    pattern:['#003268','#026CB6','#6599D1','#95B5DE','#C7D5EE','#DDDDDD']//['#3F75B0','#D7DCE3','#DFEBF6','#AEB9C8','#A2C2E3','#6FA3EA']//["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#D32F2F"] //["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"]
                },
                bar: {
                    width: {
                        ratio: 0.95
                    }
                }
            });
        }

    var mapDimension = cfHrp.dimension(function(d){return d['#adm2+code'];});
    var mapGroup = mapDimension.group().reduceSum(function(d){ return d['#total']; });

    var hrpColor = '#E4723B';
    var hnoColor = '#096DB4';

    var rowtip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return d.key + ': ' + d3.format('0,000')(d.value);
    });

    targedtByLgaChart
        .width($('#rowChart').width())
        .height(450)
        .dimension(dimHRPLGA)
        .group(groupHRPLGA)
        .colors(hnoColor)
        .data(function(group){
            return group.top(15);
        })
        .elasticX(true)
        .renderTitle(false)
        .xAxis().ticks(3);

    targedtByByLgaChart
        .width($('#rowChart').width())
        .height(450)
        .dimension(dimHRPState)
        .group(groupHRPState)
        .colors(hnoColor)
        .data(function(group){
            return group.top(Infinity)
        })
        .elasticX(true)
        .renderTitle(false)
        .xAxis().ticks(3);

    var mapGroup = mapDimension.group();

    mapp.width($('#map').width())
        .dimension(mapDimension)
        .group(mapGroup)
        .zoom(0)
        .center([0, 0]) //nigeria 11.011/9.305
        .geojson(geom)
            .colors(['#CCCCCC',hnoColor])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){
                return d > 0 ? 1 : 0 ;
        })
        .featureKeyAccessor(function (feature) {
            return feature.properties['admin2Pcod'];
        }).popup(function (feature) {
            return feature.properties['admin2Name'];
        });

    dc.renderAll();

    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);

    var map = mapp.map();
    zoomToGeom(geom);

    function zoomToGeom(geodata) {
    var bounds = d3.geo.bounds(geodata);
    map.fitBounds([
        [bounds[0][1], bounds[0][0]],
        [bounds[1][1], bounds[1][0]]
    ]);
    }
   
}//generateViz

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/north.json',
    dataType: 'json',
});

var hrp = $.ajax({
    type: 'GET',
    //url: 'data/hnpSector.json',
    url:'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F12eq3Trv16pOwkiCvRco3jMd30s3KOigekEWgzcLIowQ%2Fedit%3Fusp%3Dsharing',
    dataType: 'JSON'
});

var hno = $.ajax({
    type: 'GET',
    //url: 'data/hno.json',
    url:'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GV01xwqtNUkAWDs3uQY2735DGEvf1YLBKU0YArbUOwo%2Fedit%23gid%3D239954487',
    dataType: 'JSON'
});

$.when(hrp, hno, geomCall).then(function(hrpArgs, hnoArgs, geomaArgs){
    var hrpData = hxlProxyToJSON(hrpArgs[0]); 
    var hnoData = hxlProxyToJSON(hnoArgs[0]);

    // console.log(hrpData)
    var geom = geomaArgs[0];
    generateViz(hrpData, hnoData, geom)
});