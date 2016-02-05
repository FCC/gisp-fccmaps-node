
$(document).ready(function () {
	$('#map-layerSwitch a').click(function() {
	
		if (this.id=="mapboxTerrain"){
			map.setBaseLayer(mapboxTerrain);
		}
		else if (this.id=="stamenToner"){
			map.setBaseLayer(stamenToner);
		}
		else if (this.id=="mapboxNightvision"){
			map.setBaseLayer(mapboxNightvision);
		}
		else if (this.id=="mapboxLight"){
			map.setBaseLayer(mapboxLight);
		}
		else if (this.id=="mapboxSatellite"){
			map.setBaseLayer(mapboxSatellite);
		}
			$('#map-layerSwitch a').removeClass('active');
			$(this).addClass('active');
	});
	 
	$('#btn-resetMap').click(function(){		
		map.zoomToExtent(mapExtent);
	});

	$('#btn-apply').click(function(){
		drawMap();
	})
	
});

var myJson;
var layers=[];
var coverageLayers=[];
var	boundArray = [];
var mapservice_count = 5;
var mapExtent;
var fullExtent = new OpenLayers.Bounds(
		 -17107255, 2910721, -4740355, 6335100
    );
var geoServerURL = "http://165.135.239.37:8010/geoserver/";
var colorArray=['#D7191C','#FDAE61','#FFFFBF','#ABDDA4','#2B83BA'];
var selectedID=[], selectedLayers=[], selectedObj=[];

 // pink tile avoidance
            OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
            // make OL compute scale according to WMS spec
            OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

//var myJson ={};
var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    displayProjection: "EPSG:4326",
    numZoomLevels:14,
    maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
	units: "meters"
});


var mapboxTerrain = new OpenLayers.Layer.XYZ(
	    "Mapbox Terrain map",
	    [
	   //  "https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"
	     "http://a.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	     "http://b.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	     "http://c.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	     "http://d.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:14,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
var stamenToner = new OpenLayers.Layer.XYZ(
	    "Stamen Toner map",
	    [
	        "http://a.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://b.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://c.tile.stamen.com/toner/${z}/${x}/${y}.png",
	        "http://d.tile.stamen.com/toner/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Map tiles by <a target='_top' href='http://stamen.com'>Stamen Design</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by " +
	        "<a target='_top' href='http://openstreetmap.org'>OpenStreetMap</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>",
	    	sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:17,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
var mapboxNightvision = new OpenLayers.Layer.XYZ(
	    "Mapbox Nightvision map",
	    [
	     	//"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-qly54czi/${z}/${x}/${y}.png"
			"http://a.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
			"http://b.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
			"http://c.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png",
			"http://d.tiles.mapbox.com/v3/fcc.map-qly54czi/${z}/${x}/${y}.png"

	    ], {
	        attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:14,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
var mapboxLight = new OpenLayers.Layer.XYZ(
	    "Mapbox Light map",
	    [
	     	//"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
			"http://a.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
			"http://b.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
			"http://c.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png",
			"http://d.tiles.mapbox.com/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:14,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
var mapboxSatellite = new OpenLayers.Layer.XYZ(
	    "Mapbox Satellite map",
	    [
	     	//"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
			"http://a.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
			"http://b.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
			"http://c.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png",
			"http://d.tiles.mapbox.com/v3/fcc.map-gu5ow1sh/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:14,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);

layers.push(mapboxTerrain);
layers.push(stamenToner);
layers.push(mapboxNightvision);
layers.push(mapboxLight);
layers.push(mapboxSatellite);
map.addLayers(layers);
// var mLayers=[];
// for (var i=0;i<mapservice_count;i++){
// 	var obj=new Object();
// 	obj["mLayer_" + i] = new OpenLayers.Layer.WMS( 
// 			"mLayer_"+i, geoServerURL + "coverageright201010/wms",
// 			{layers: '', //Bluegrass_Cellular_1X', 
// 			 format: 'image/png',
// 			// sldBody: getSLDBody(cLayers[i],i),
// 			 isBaseLayer:false,
// 			visibility:false,
// 			 transparent:true
// 			 },
// 			{
// 				//singletile:true, 
// 				//ratio:1,
// 				tiled:true,
// 				tileOptions: {maxGetUrlLength: 2048} 
// 				//transitionEffect: 'resize'
// 			});
// 	mLayers.push(obj);
// }
// for (var j=0;j<mapservice_count;j++){
// 	coverageLayers.push(mLayers[j]["mLayer_" + j]);
// }
// map.addLayers(coverageLayers);


function updateCoverageLayers(cLayers){
	//map.zoomToExtent(fullExtent);
	//map.zoomTo(4);
	boundArray = [];
	getLayersBound(cLayers);
	if (coverageLayers.length>0){
		for (var x=0; x <coverageLayers.length;x++){
			map.removeLayer(coverageLayers[x]);
		}
	}
	var mLayers=[];
	coverageLayers=[];
	for (var i=0;i<cLayers.length;i++){
		var obj=new Object();
		obj["mLayer_" + i] = new OpenLayers.Layer.WMS( 
				"mLayer_"+i, geoServerURL + "geoswat/wms",
				{layers: 'geoswat:' + cLayers[i].serviceName, //Bluegrass_Cellular_1X', 
				 format: 'image/png',
				 sldBody: getSLDBody(cLayers[i].serviceName,i),
				 isBaseLayer:false,
				 transparent:true
				 },
				{
					//singletile:true, 
					//ratio:1,
					tiled:true,
					tileOptions: {maxGetUrlLength: 2048}, 
					transitionEffect: 'resize'});
		mLayers.push(obj);
	}
	for (var j=0;j<cLayers.length;j++){
		coverageLayers.push(mLayers[j]["mLayer_" + j]);
	}
	map.addLayers(coverageLayers);
	for (var x=0; x <coverageLayers.length;x++){
			coverageLayers[x].redraw();
	}
	createServiceList(cLayers);
	// for (var j=0;j<mapservice_count;j++){
	// 	coverageLayers[j].mergeNewParams({
 //                    layers: '',
 //                    sldBody: ''
 //                });
	// 	coverageLayers[j].setVisibility(false);
	// }

	// for (var i = 0; i < cLayers.length; i++){
	// 	coverageLayers[i].mergeNewParams({
 //                    layers: 'coverageright201010:' + cLayers[i].serviceName,
 //                    sldBody: getSLDBody(cLayers[i].serviceName,i)
 //                });
	// 	coverageLayers[i].setVisibility(true);
	// }
}


function createServiceList(cLayers){
	$('#selectedService').show();
	$("#tbl-service").find('tbody').empty();
	var content = "";
	 for (var i = 0; i < cLayers.length; i++) {
	 	//console.log(content);

	        content += '<tr><td><input id=' + cLayers[i].id + ' type="checkbox" checked onclick="handleVisibility(' + cLayers[i].id + ');">' + "</td>";
	        content += '<td><div style="width:40px;height:20px;background-color:' + colorArray[i] + ';"></div></td>';
	        content += "<td>" + cLayers[i].companyName + "</td>";
	        content += "<td>" + cLayers[i].techType + "</td>";
	        content += '<td><a class="lnk-toggle" style="float:left" href="#" onclick="zoomToBound(' + cLayers[i].extent + ')">Zoom</a></td></tr>';
	 } 
 
 //content += "</table>";
 $("#tbl-service").find('tbody').append(content);
}

function handleVisibility(id){
	var serviceName=null;
	for (var j=0;j<selectedObj.length;j++){
		if (selectedObj[j].id == id){
			serviceName = selectedObj[j].serviceName;
		}
	}
	console.log(id + " " + serviceName);
	for (var i =0;i<coverageLayers.length; i++){
		if (coverageLayers[i].params.LAYERS.split(":")[1] == serviceName){
			coverageLayers[i].setVisibility($('#' + id).is(":checked"));
		}
	}
}

function getLayersBound(cLayers){
	// for (var j=0; j<myJson.length;j++){
	// 	for (var k=0;k<myJson[j].property.length;k++){
	// 		for (var l=0;l<cLayers.length;l++){
	// 			if (myJson[j].property[k].serviceName == cLayers[l]){
	// 				boundArray.push(myJson[j].property[k].extent);
	// 			}
	// 		}

	// 	}
	// }
	for (var l=0;l<cLayers.length;l++){
			boundArray.push(cLayers[l].extent);
	}
	mapExtent=null;
	mapExtent = new OpenLayers.Bounds(
            boundArray[0][0], boundArray[0][1], boundArray[0][2], boundArray[0][3]);
	if (boundArray.length > 1){
		for (var x=1; x<boundArray.length;x++){
			 var bounds = new OpenLayers.Bounds(
            		boundArray[x][0], boundArray[x][1], boundArray[x][2], boundArray[x][3]);
			 mapExtent.extend(bounds);
		}
	}
	mapExtent = mapExtent.transform(map.displayProjection, map.projection);

	map.zoomToExtent(mapExtent);
	
}

function zoomToBound(b1,b2,b3,b4){
  var bounds = new OpenLayers.Bounds(
            b1,b2,b3,b4
        ).transform(map.displayProjection, map.projection);
  map.zoomToExtent(bounds);
}

function getSLDBody(layerName,index){
	 var sld = '<StyledLayerDescriptor version="1.0.0">';
		sld+= '<NamedLayer>';
        sld+= '<Name>geoswat:' + layerName + '</Name>';
        sld+= '<UserStyle>';
        sld+= '<IsDefault>1</IsDefault>';
        sld+= '<FeatureTypeStyle>';
        sld+= '<Rule>';
        sld+= '<PolygonSymbolizer>';
        sld+= '<Fill>';
        sld+= '<CssParameter name="fill">';
        sld+= '<Literal>' + colorArray[index] + '</Literal>';
        sld+= '</CssParameter>';
        sld+= '<CssParameter name="fill-opacity">';
        sld+= '<Literal>0.5</Literal>';
        sld+= '</CssParameter>';
        sld+= '</Fill>';
        // sld+= '<Stroke>';
        // sld+= '<CssParameter name="stroke">';
        // sld+= '<Literal>#333333</Literal>';
        // sld+= '</CssParameter>';
        // sld+= '<CssParameter name="stroke-width">';
        // sld+= '<Literal>0</Literal>';
        // sld+= '</CssParameter>';
        // sld+= '</Stroke>';
        sld+= '</PolygonSymbolizer>';
        sld+= '</Rule>';
        sld+= '</FeatureTypeStyle>';
        sld+= '</UserStyle>';
        sld+= '</NamedLayer>';
        sld+= '</StyledLayerDescriptor>';
        return sld;
}

function drawMap(){
	selectedObj=[];
	for (var i=0;i<myJson.length;i++){
		for (var j=0;j<myJson[i].property.length;j++){
			for (var x=0;x<selectedID.length;x++){
				if (parseInt(selectedID[x]) == myJson[i].property[j].id){
					var myObj = new Object();
					myObj = myJson[i].property[j];
					myObj["techType"]=myJson[i].techType;
					selectedObj.push(myObj);
				}
			}
		}
	}
	updateCoverageLayers(selectedObj);

	//update url hash
	window.location.hash = selectedID.toString();

}

function randomLayer(num){

	var randomnumber=[];
	var layerArray=[];
	for (i=0;i<num;i++){
		randomnumber.push(Math.floor(Math.random()*350));
	}
	for (j=0; j<myJson.length;j++){
		for (k=0;k<myJson[j].property.length;k++){
			for (l=0;l<randomnumber.length;l++){
				if (myJson[j].property[k].id == randomnumber[l]){
					layerArray.push(myJson[j].property[k].serviceName);
				}
			}
		}
	}
	//console.log(layerArray);
	updateCoverageLayers(layerArray);
}

$.getJSON("data/coverageright_201507.json",function(data){
	myJson=data;
	map.zoomToExtent(fullExtent);
	map.zoomTo(4);

	for (var i=0;i<myJson.length;i++){
		var optgroup = $('<optgroup>');
		optgroup.attr('label',myJson[i].techType);
		for (var j=0;j<myJson[i].property.length;j++){
			var option = $("<option></option>");
			option.val(myJson[i].property[j].id);
			option.text(myJson[i].property[j].companyName);
			optgroup.append(option);
		}
		$("#boundarySelect").append(optgroup);
	}

//process hash
	if (window.location.hash.length>1){
		selectedID = window.location.hash.replace("#","").split(",");
		$('#boundarySelect').val(selectedID);
		drawMap();
	}

	$("#boundarySelect").chosen({max_selected_options:5});

	$("#boundarySelect").chosen().change(function () {
    	selectedID = [];
    	selectedID = $("#boundarySelect").val();
	  });

	

	
});



