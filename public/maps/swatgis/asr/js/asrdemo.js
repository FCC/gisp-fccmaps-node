var data=[{"id":1,"FileNumber": "A0541616","OwnerName":"Dupert Communications", "OverallAGLHeight":107.5,"structureType":"GTOWER",
		"city":"CALERA","county":"SHELBY", "state":"AL","EAAttached":"No","proposedLighting":9,"commentDueDate":"05/31/2012","lat":33.102897,"lon":-86.753597},
		{"id":2,"FileNumber": "A0541617","OwnerName":"Dupert Crporation", "OverallAGLHeight":120.1,"structureType":"GTOWER",
			"city":"BILLING","county":"YELLOWSTONE", "state":"MT","EAAttached":"No","proposedLighting":9,"commentDueDate":"05/31/2012","lat":45.783285599999999,"lon":-108.50069040000001}]

$(document).ready(function () {
  // Contextual layer switching
  $('ul.macro li a').click(function() {

	  if (this.id=="stamenTerrain"){
		  map.setBaseLayer(stamenTerrain);
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
  
  $("input[name='reloadPg']").click(function(){
	  reloadPage(this.id);
  })
});

var lastfeature;
var layers=[];

OpenLayers.Util.onImageLoadError = function(){
    this.src = "images/blank.gif";
    console.log("error");
};


var fullExtent = new OpenLayers.Bounds(
        -17107255, 2910721, -4740355, 6335100
    );
//OpenLayers.DOTS_PER_INCH = 90.71428571428572;
var map = new OpenLayers.Map({
    div: "map",
    projection: "EPSG:900913",
    displayProjection: "EPSG:4326",
    numZoomLevels:17,
    maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
	units: "meters"
});


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
	        //isBaseLayer:true,
	        buffer: 1
	    }
	);
var stamenTerrain = new OpenLayers.Layer.XYZ(
	    "Stamen Terrain map",
	    [
	        "http://a.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://b.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://c.tile.stamen.com/terrain/${z}/${x}/${y}.png",
	        "http://d.tile.stamen.com/terrain/${z}/${x}/${y}.png"
	    ], {
	    	attribution: "Map tiles by <a target='_top' href='http://stamen.com'>Stamen Design</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by " +
	        "<a target='_top' href='http://openstreetmap.org'>OpenStreetMap</a>, under " +
	        "<a target='_top' href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        transitionEffect: "resize",
	        numZoomLevels:17,
	        isBaseLayer:true,
	        buffer: 1
	    }
	);
var mapboxNightvision = new OpenLayers.Layer.XYZ(
	    "Mapbox Nightvision map",
	    [
	        "http://a.tiles.mapbox.com/v3/mapbox.mapbox-nightvision/${z}/${x}/${y}.png",
	        "http://b.tiles.mapbox.com/v3/mapbox.mapbox-nightvision/${z}/${x}/${y}.png",
	        "http://c.tiles.mapbox.com/v3/mapbox.mapbox-nightvision/${z}/${x}/${y}.png",
	        "http://d.tiles.mapbox.com/v3/mapbox.mapbox-nightvision/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a> | " + 
            "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:17,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
var mapboxLight = new OpenLayers.Layer.XYZ(
	    "Mapbox Nightvision map",
	    [
	        "http://a.tiles.mapbox.com/v3/mapbox.mapbox-light/${z}/${x}/${y}.png",
	        "http://b.tiles.mapbox.com/v3/mapbox.mapbox-light/${z}/${x}/${y}.png",
	        "http://c.tiles.mapbox.com/v3/mapbox.mapbox-light/${z}/${x}/${y}.png",
	        "http://d.tiles.mapbox.com/v3/mapbox.mapbox-light/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a> | " + 
            "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:17,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
http://a.tiles.mapbox.com/v3/mapbox.mapbox-nightvision/3/4/3.png?updated=1333052422101
layers.push(stamenToner);
layers.push(stamenTerrain);
layers.push(mapboxNightvision);
layers.push(mapboxLight);

var stationStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
         // Set the external graphic and background graphic images.
        externalGraphic: "img/transmission_tower.png",
        //backgroundGraphic:"theme_cls-admin/images/icon-map-shadow.png",
        
        // Makes sure the background graphic is placed correctly relative
        // to the external graphic.
        backgroundXOffset: 0,
        backgroundYOffset: -7,
        
        // Set the z-indexes of both graphics to make sure the background
        // graphics stay in the background (shadows on top of markers looks
        // odd; let's not do that).
        graphicZIndex: 11,
        backgroundGraphicZIndex: 10,
		pointRadius: 40
    }),
	"temporary": new OpenLayers.Style({
		pointRadius: 60
	
	})
});
var stationLayer = new OpenLayers.Layer.Vector("Stations", {
    styleMap: stationStyle,
    rendererOptions: {zIndexing: true}
});
layers.push(stationLayer);
map.addLayers(layers);

map.addControl(new OpenLayers.Control.MousePosition());
map.addControl(new OpenLayers.Control.Attribution());
//add the  select for tooltips:
var highlightCtrl = new OpenLayers.Control.SelectFeature([stationLayer], { 
					hover: true, highlightOnly: true, renderIntent: "temporary",
                	eventListeners: { featurehighlighted: tooltipSelect, 
					featureunhighlighted: tooltipUnselect } });	
highlightCtrl.handlers.feature.stopDown=false;
map.addControl(highlightCtrl);
highlightCtrl.activate();

map.zoomToExtent(fullExtent);
map.zoomTo(4);

function reloadPage(id){
	var content="";
	for (i=0;i<data.length;i++){
		if (data[i].id==id){
			content+="filenumber="+data[i].FileNumber+"&"+"eaattached="+data[i].EAAttached +
			"&overallaglheight="+data[i].OverallAGLHeight + "&ownername="+data[i].OwnerName+
			"&city="+data[i].city+"&commentduedate="+data[i].commentDueDate+
			"&county="+data[i].county+"&lat="+data[i].lat+"&lon="+data[i].lon+
			"&proposedLighting="+data[i].proposedLighting+"&state="+data[i].state+
			"&structuretype="+data[i].structureType;
		}
	}
	
	var url = window.location.href.split("?")[0] + "?"+ content;
	window.open(url,'_self',false);

}

function showStation(pars){
		 	var feature = new OpenLayers.Feature.Vector(
            	new OpenLayers.Geometry.Point(
            			parseFloat(pars[8].split("=")[1]),
        		 		parseFloat(pars[7].split("=")[1])

            	).transform(map.displayProjection, map.projection), {
		 			fileNumber:pars[0].split("=")[1],
		 			eaAttached:pars[1].split("=")[1],
		 			overallAGLHeight:pars[2].split("=")[1],
		 			ownerName:pars[3].split("=")[1],
		 			city:pars[4].split("=")[1],
		 		 commentDueDate:pars[5].split("=")[1],
		 		 county:pars[6].split("=")[1],
		 		 proposedLighting:pars[9].split("=")[1],
		 		 state:pars[10].split("=")[1],
		 		 structureType:pars[11].split("=")[1]			
            	}
        	);
	stationLayer.addFeatures([feature]);
	fullExtent = stationLayer.getDataExtent();
	map.zoomToExtent(fullExtent);
	if (stationLayer.features.length==1){
		map.zoomTo(14);
	}
		
}

//contour and station layer mouse over
function tooltipSelect(event){
        var feature = event.feature;
        var selectedFeature = feature;
		var content="&nbsp;</br>&nbsp;";
		if (feature.layer.name=="Stations" ){

					content += "File Number: " + feature.attributes.fileNumber + "</br>&nbsp;" +
					"Overlall AGL Height: " + feature.attributes.overallAGLHeight + "</br>&nbsp;"+
					"Structure Type: " + feature.attributes.structureType + "</br>&nbsp;" +
					"Proposed Lighting: " + feature.attributes.proposedLighting + "</br>&nbsp;" +
						"Owner Name: " + feature.attributes.ownerName + "</br>&nbsp;" +
						"EA Attached: " + feature.attributes.eaAttached + "</br>&nbsp;" +
						"City: " + feature.attributes.city + "</br>&nbsp;" +
						"County: " + feature.attributes.county + "</br>&nbsp;" +
						"State: " + feature.attributes.state + "</br>&nbsp;" +
						"Comment Due Date: " + feature.attributes.commentDueDate + "</br>&nbsp;";
					//content += "<br/>Ground Elev: " + feature.attributes.GroundElev;

		}
		//if there is already an opened details window, don\'t draw the tooltip
		if (feature.popup != null) {
			return;
		}
		//if there are other tooltips active, destroy them
		if (tooltipPopup != null) {
			map.removePopup(tooltipPopup);
			tooltipPopup.destroy();
			if (lastFeature != null) {
				delete lastFeature.popup;
				tooltipPopup = null;
			}
		}
		lastFeature = feature;	
		var tooltipPopup = new OpenLayers.Popup("activetooltip", 
						feature.geometry.getBounds().getCenterLonLat(), 
						new OpenLayers.Size(60, 10), 
						content,false);
		setPopupStyle(tooltipPopup);
		feature.popup = tooltipPopup;
		map.addPopup(tooltipPopup);
    }
function tooltipUnselect(event){
        var feature = event.feature;
        if(feature != null && feature.popup != null){
            map.removePopup(feature.popup);
            feature.popup.destroy();
            delete feature.popup;
            tooltipPopup = null;
            lastFeature = null;
        }
}

function setPopupStyle(tooltipPopup){
	tooltipPopup.contentDiv.style.backgroundColor = "rgba(0, 60, 136, 0.5)";//'#6B6A6A';
	tooltipPopup.contentDiv.style.color="white";
	tooltipPopup.contentDiv.style.fontsize="xx-small";
	tooltipPopup.contentDiv.style.overflow = 'auto';
	tooltipPopup.contentDiv.style.padding = '1px';
	tooltipPopup.contentDiv.style.margin = '0px';
	tooltipPopup.closeOnMove = false;
	tooltipPopup.autoSize = true;
	//tooltipPopup.panMapIfOutOfView=true;
}

var paras=window.location.href.split("?");
if (paras.length==1){
	//alert("No State or Tribe being selected");
}
else{
	var decodeParas=decodeURI(paras[1]);
	var selects = decodeParas.split("&");
	showStation(selects);
}
