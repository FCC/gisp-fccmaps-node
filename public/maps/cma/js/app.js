
$(document).ready(function () {
	$('ul.macro li a').click(function() {
	
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
			$('ul.macro li a').removeClass('active');
			$(this).addClass('active');
	});
	

	
	$('#goUser').click(function(){
	 getcmaInput('user');
	});
	 
	$('#btn-resetMap').click(function(){
		$('#tbl-CMA').find('input[type="checkbox"]').each(function(){
			$(this).removeAttr('checked');	
		}).end().find('tr').each(function(){
			$(this).removeClass('selected');
		})
		
		cmaLayer.removeAllFeatures();
		map.zoomToExtent(fullExtent);
	});
	
	$('#tbl-CMA tbody').delegate('tr', 'click', function(){
		var cmaID = $(this).find('.cmaID');		
		var cmaArr = [];
		
		if (cmaID.attr('checked') == 'checked') {
			cmaID.attr('checked', false);	
			$(this).toggleClass('selected');	
		} else {
			cmaID.attr('checked', true);
			$(this).toggleClass('selected');
		}
		
		$('#tbl-CMA').find('.cmaID:checked').each(function (){
			cmaArr.push($(this).val());		
		}); 
	
		if (cmaArr.length > 0) {
			drawcma(cmaArr);		
		}	else {
			cmaLayer.removeAllFeatures();
			map.zoomToExtent(fullExtent);
		}	
		//console.log(cmaArr);
		document.getElementById('cmaID').value = ""; 
		document.getElementById('cmaID').value = cmaArr.toString(); 
		window.location.hash=cmaArr.toString();
		
});
	 
});

var cmaJson;
var layers=[];
var fullExtent = new OpenLayers.Bounds(
		 -17107255, 2910721, -4740355, 6335100
    );

var myJson ={};
var map = new OpenLayers.Map({
    div: "coveragemap",
    projection: "EPSG:900913",
    displayProjection: "EPSG:4326",
    numZoomLevels:14,
    maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
	units: "meters"
});

var options = {
		'internalProjection': new OpenLayers.Projection("EPSG:900913"),
		'externalProjection': new OpenLayers.Projection("EPSG:4326")};

var mapboxTerrain = new OpenLayers.Layer.XYZ(
	    "Mapbox Nightvision map",
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
	    "Mapbox Nightvision map",
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
var cmaMap = new OpenLayers.Layer.XYZ(
	    "CMA map",
	    [
	     	//"https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-kzt95hy6/${z}/${x}/${y}.png"
			"http://a.tiles.mapbox.com/v3/computech.cma/${z}/${x}/${y}.png",
			"http://b.tiles.mapbox.com/v3/computech.cma/${z}/${x}/${y}.png",
			"http://c.tiles.mapbox.com/v3/computech.cma/${z}/${x}/${y}.png",
			"http://d.tiles.mapbox.com/v3/computech.cma/${z}/${x}/${y}.png"
	    ], {
	        sphericalMercator: true,
	        wrapDateLine: true,
	        isBaseLayer:false,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
layers.push(mapboxTerrain);
layers.push(stamenToner);
layers.push(mapboxNightvision);
layers.push(mapboxLight);
layers.push(cmaMap);


var cmaStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
    	strokeColor: "#FFAEDB",
		strokeOpacity: 1,
    	strokeWidth: 2,
		fillColor: "#FFAEDB",
		fillOpacity: 0.3
    }),
    "temporary": new OpenLayers.Style({
        strokeColor: "#F09100",
		strokeWidth:2
    })
});
var cmaLayer= new OpenLayers.Layer.Vector("cma",{
		styleMap: cmaStyle,					
		displayInLayerSwitcher:false
	});
layers.push(cmaLayer);
map.addLayers(layers);


function getcmaInput(type){
	var cmaids=[];
	if (type=="user"){
		cmaids=$('#cmaID').val().replace(/\s/g, "").split(',');
		window.location.hash=cmaids;
		drawcma(cmaids);
		selectTableRows(cmaids)	
	}
//	else if (type=="file"){
//		$.get('data/' + $('#csvfile').val(),function(d){
//			cmaids=d.split(',');
//			drawcma(cmaids);
//		})
//	}
	
}
function drawcma(cmaids){
	//console.log(cmaids);
	//console.log(cmaids.length);
	//console.log(typeof cmaids);
	myJson.features=[];
	var p = new OpenLayers.Format.GeoJSON(options);
	
	for (i=0;i<cmaJson.features.length;i++){
		for (j=0;j<cmaids.length;j++){
			if (cmaids[j].toString()==cmaJson.features[i].properties.cma.toString()){
				myJson.features.push(cmaJson.features[i]);
			}
		}
	}
//	cmaJson.features.forEach(function(d){
//		//console.log(d.properties.cma.toString());
//		if (cmaids.indexOf(d.properties.cma.toString())>=0){
//			myJson.features.push(d);
//		}
//	})
	//myJson.features.push(cmaJson.features[0]);
	if(myJson.features.length>0){
		var feats = p.read(myJson);	
		cmaLayer.removeAllFeatures();
	  	cmaLayer.addFeatures(feats);
	  	map.zoomToExtent(cmaLayer.getDataExtent());
	}
	var feats = p.read(myJson);	
	cmaLayer.removeAllFeatures();
  	cmaLayer.addFeatures(feats);
  	map.zoomToExtent(cmaLayer.getDataExtent());
}

function selectTableRows(cmaids){
	
	//deal with table
	$('#tbl-CMA').find('.cmaID').each(function (){
		$(this).attr('checked',false);
	    $(this).parents('tr').removeClass('selected');
	})
	
	$('#tbl-CMA').find('.cmaID').each(function (){
        for (i=0;i<cmaids.length;i++){       
        	if ($(this).val()==cmaids[i]){
        		$(this).attr('checked',true);
        		$(this).parents('tr').addClass('selected');
        	}
        }
	});  
}

function getCMAList (d) {
	var feats = d.features,
			featsLen = feats.length
			rows = '',
			cols = '';
	
	// Create CMA ID table
	for (var i=0; i<featsLen; i++) {
		cols = '<td><input id="cma' + feats[i].properties.cma + '" class="cmaID visuallyhidden" type="checkbox" value="'  + feats[i].properties.cma + '">'
		cols += feats[i].properties.cma + '</td>';
		cols += '<td>' + feats[i].properties.name + '</td>';
		rows += '<tr>' + cols + '</tr>';
	}

	$('#tbl-CMA').find('tbody').append(rows);
	
	$('#tbl-CMA').dataTable({
      "aoColumns": [
                { "sType": "string-num" },
                null
            ],			
			"aaSorting": [
        [0, "asc"]
      ],      
      "bFilter": false,
      "bInfo": false,
      "bPaginate": false,
			"sScrollY": "300px",			
			"bScrollCollapse": true      
    });
	
	// When window resizes, calc. width of fixed datatable header
	$(window).resize(function(){
		$('.dataTables_scrollHead, .dataTables_scrollHeadInner').css('width',($('.dataTables_scrollBody').width()-15) + 'px');	
	});	
	
	
	
	
}

$.getJSON("data/cma1000.geojson",function(data){
	cmaJson=data;
	myJson.type=cmaJson.type;
	myJson.features=[];
	map.zoomToExtent(fullExtent);
	map.zoomTo(4);
	
	getCMAList(data);
	//console.log(data);
	var paras=window.location.href.split("#");
	if (paras.length==1){
		//do nothing
	}
	else{
		if(paras[1].length>0){
			var parasArray=decodeURIComponent(paras[1]).replace(/\s/g, "").split(",");
			//console.log(parasArray.toString());
			drawcma(parasArray);
			//console.log("paras: " +parasArray.toString()); 
			selectTableRows(parasArray);
			document.getElementById('cmaID').value = ""; 
			document.getElementById('cmaID').value = parasArray.toString();
		}
	}
});



