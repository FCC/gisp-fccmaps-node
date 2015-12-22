

var data,dataByState;
var currentType = 'all';
var actionDetails = {
  state: '',
  statename: ''
};
var caseTypeName={"NAL":"NAL", "NOUO":"NOUO", "FO":"FORFEITURE ORDER", "OTHER": "OTHER", "M.O.&O.":"M.O.&O.", "CD":"ORDER & CONSENT DECREE", "NOV":"NOV", "ERRATUM":"ERRATUM"};
var map = L.mapbox.map('map', 'fcc.map-toolde8w')
      .setView([39.5, -98.5], 4);

var radius = d3.scale.sqrt().range([12,40])
var format = d3.time.format("%m/%d/%Y");

var dataFileName = "pirateaction.csv";
if (window.location.href.split("#")[1] == "test"){
  dataFileName = "pirateaction_test.csv";
}

queue()
  .defer(d3.csv, "data/" + dataFileName)
  .defer(d3.json, "data/state_centroid.geojson")
  .await(ready);
//d3.tsv("data/school_stat.tsv", function(error, school) {
function ready(error, piratedata,stateCentroid){
  data = piratedata;
  data.forEach(function(d){d.state = d.state.toUpperCase();d.date = format.parse(d.date);d.amount==null || d.amount.length==0? d.amount =0 : d.amount = +(d.amount.replace(",",""))});

  var dateExtent = d3.extent(data,function(d){return d.date});
  d3.select('#title').html("<h1>Summary of <span class='red-title'>Enforcement Actions</span>(" + 
                          format(dateExtent[0]) + "-" + format(dateExtent[1]) + ")</h1>");

 dataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      //.key(function(d){return d.typeaction})
      .rollup(function(values){
         // console.log(values)
        return {
            allAmount: d3.sum(values, function(d){return d.amount}),
            allCount: d3.sum(values, function(d){return 1}),
            NALAmount: d3.sum(values, function(d){return d.typeaction == "NAL"? d.amount:0}),
            NALCount: d3.sum(values, function(d){return d.typeaction == "NAL"? 1:0}),
            NOUOAmount: d3.sum(values, function(d){return d.typeaction == "NOUO"? d.amount:0}),
            NOUOCount: d3.sum(values, function(d){return d.typeaction == "NOUO"? 1:0}),
            FOAmount: d3.sum(values, function(d){return d.typeaction == "FO"? d.amount:0}),
            FOCount: d3.sum(values, function(d){return d.typeaction == "FO"? 1:0}),
            "M.O.&O.Amount": d3.sum(values, function(d){return d.typeaction == "M.O.&O."? d.amount:0}),
            "M.O.&O.Count": d3.sum(values, function(d){return d.typeaction == "M.O.&O."? 1:0}),
            CDAmount: d3.sum(values, function(d){return d.typeaction == "CD"? d.amount:0}),
            CDCount: d3.sum(values, function(d){return d.typeaction == "CD"? 1:0}),
            NOVAmount: d3.sum(values, function(d){return d.typeaction == "NOV"? d.amount:0}),
            NOVCount: d3.sum(values, function(d){return d.typeaction == "NOV"? 1:0}),
            ERRATUMAmount: d3.sum(values, function(d){return d.typeaction == "ERRATUM"? d.amount:0}),
            ERRATUMCount: d3.sum(values, function(d){return d.typeaction == "ERRATUM"? 1:0}),
            OTHERAmount: d3.sum(values, function(d){return d.typeaction != "NAL"&&d.typeaction != "NOUO"&&d.typeaction != "FO" ? d.amount:0}),
            OTHERCount: d3.sum(values, function(d){return d.typeaction != "NAL"&&d.typeaction != "NOUO"&&d.typeaction != "FO"? 1:0})
        }; 
      })
      .map(data);
  
  centroids = d3.nest()
    .key(function(d){return d.properties.abbrname})
    .map(stateCentroid.features)

  radius.domain(d3.extent(d3.entries(dataByState),function(d){return d.value.allCount}));
  drawCircle('all');
}

function drawCircle(type){
  d3.selectAll('path').remove();
  d3.selectAll('.label').remove();
  d3.entries(dataByState).forEach(function(d){
    if (typeof centroids[d.key] != "undefined"){
      //if (d.key == "HARTFORD"){console.log(d)};
       var lat = centroids[d.key][0].geometry.coordinates[1];
       var lon = centroids[d.key][0].geometry.coordinates[0];
       var circleSize = d.value[type + "Count"];
       if (circleSize != 0){
        var circle = new L.circleMarker([lat,lon],{color:'lightSteelBlue',weight:1,fillColor:'red',fillOpacity:0.2});
        circle.setRadius(radius(circleSize));
        circle.on('mouseover', function(e){highlight(e,'mouseover', d.key)});
        circle.on('mouseout', function(e){unhighlight(e)});
        circle.on('click', function(e){highlight(e,'click',d.key)})
        circle.addTo(map);
        var label = new L.Marker([lat,lon], {
          icon: new L.DivIcon({
              className: 'label',
              iconSize: [radius(circleSize), radius(circleSize)],
              iconAnchor: new L.Point(radius(circleSize)/3, radius(circleSize)/2),
              html: '<div>'+ circleSize +'</div>'
            })
          })
        label.addTo(map)
       }
     }
  })

}

function highlight(e,action,state){
  e.target.options.fillOpacity=0.5;
  e.target._updateStyle();
 $('#tooltips').html('<div class="inner">' + showTableContent(action,state) + '</div>')
 initTblSort();
}

function unhighlight(e){
    e.target.options.fillOpacity=0.2;
    e.target._updateStyle();

}

function showTableContent(action,state) {
  var content = " ";
  actionDetails.state = state;
  actionDetails.statename = centroids[state][0].properties.name;
  
  if (currentType == "all") {
    var num = dataByState[state]["allCount"];
    var numPercent = (num * 100) / data.length;
    content += "<h2>Pirate action details in " + actionDetails.statename + "</h2>";
    content += "<h4>Total pirate action cases: <span class='red'>" + num + "</span></h4>";
    content += "<h4>Percent of total cases: <span class='red'>" + parseFloat(numPercent).toFixed(1) + "%</span></h4>";
    content += "<table id='tbl-summary'><tr><th>Type</th><th>Cases</th><th>Amount</th></tr>";

    d3.keys(caseTypeName).filter(function(c){return c!="OTHER"}).forEach(function(d){
        if (dataByState[state][d + "Count"] == 0 ){
          content += "<tr><td>" + caseTypeName[d] + "</td>";
        } else {
          content += "<tr><td><a id=" + d + " class='lnk-actionDetails' href='#void'>" + caseTypeName[d] + "</a></td>";
        }

        content += "<td>" + dataByState[state][d + "Count"] + "</td>";
        content += "<td>$" + dataByState[state][d + "Amount"] + "</td></tr>";

    });    
    content += "</table>";
   } 
  else{
    content += "<h2>Pirate " + caseTypeName[currentType] + " type action details in " + actionDetails.statename + ":</h2>";
    content += "<h4>Total pirate " + caseTypeName[currentType] + " type action cases: <span class='red'>" + dataByState[state][currentType + "Count"] + "</span></h4>";
    content += "<h4>Total amount of " + caseTypeName[currentType] + " type: <span class='red'>$" + dataByState[state][currentType + "Amount"] + "</span></h4>"
    content += "<em>Click for a breakdown of all Other type actions.</em>";
    if (action == "click") {
      content += getActionDetails(state, currentType);
    }
  }

  return content;
}


function initTblSort() {
  if (jQuery('#tbl-actionDetails') && jQuery('#tbl-actionDetails tbody tr').length > 1) {
    jQuery('#tbl-actionDetails').dataTable({
      "aoColumns": [
      null, null, null,null,
      {
        "sType": "currency"
      },
      null],
      "aaSorting": [
        [1, "desc"]
      ],
      "bDestroy": true,
      "bFilter": false,
      "bInfo": false,
      "bPaginate": false,
      "bLengthChange": false
    });
  }
}

function showSubCatTableContent(type){
 $('#tooltips').html('');
  var num = 0;
  var amount=0;
  var content = "";
  if (type == "all"){
      return content;
    }
  var features = data;
  for (i = 0; i < features.length; i++) {
      if (type == "OTHER"){
        if (features[i].typeaction == "M.O.&O." || 
                features[i].typeaction == "CD" ||
                features[i].typeaction == "NOV" ||
                features[i].typeaction == "ERRATUM") {
            num++;
            amount += features[i].amount;
        }
      }
      else{
           if (features[i].typeaction == type) {
             num++;
             amount += features[i].amount;
           }
      }
  }
  content += "<h2>Pirate " + caseTypeName[type] +" action details in United States</h2>";
  content += "<h4>Total pirate " + caseTypeName[type] + " action cases: <span class='red'>" + num + "</span></h4>";
  content += "<h4>Total amount of " + caseTypeName[type] + ": <span class='red'>$" + amount + "</span></h4>";

  return content;
}

function getActionDetails(state, type) {
 // console.log(state + " " + type)
  var content = "";
  var features = data;
  if (type == "all"){
    return content;
  }

  //console.log(state,dataType);
  if (state != "allstates"){
    content += "<table id='tbl-actionDetails' class='tablesorter'><thead><tr><th><div class='sort-wrapper'>File &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Date &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Name &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>City &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Amt. &nbsp;<span class='sort'></span></div></th><th>URL</th></tr></thead>";
     if (type != "OTHER"){
       for (i = 0; i < features.length; i++) {
            if (features[i].state == state && features[i].typeaction == type) {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].city + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
     }
     else{
       for (i = 0; i < features.length; i++) {
            if (features[i].state == state && features[i].typeaction != "NAL" && features[i].typeaction != "NOUO" && features[i].typeaction != "FO") {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].city + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
      }
  }
  else{
      content += "<table id='tbl-actionDetails' class='tablesorter'><thead><tr><th><div class='sort-wrapper'>File &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Date &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Name &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>State &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Amt. &nbsp;<span class='sort'></span></div></th><th>URL</th></tr></thead>";
     if (type != "OTHER"){
       for (i = 0; i < features.length; i++) {
            if (features[i].typeaction == type) {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].state + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
     }
     else{
       for (i = 0; i < features.length; i++) {
            if (features[i].typeaction != "NAL" && features[i].typeaction != "NOUO" && features[i].typeaction != "FO") {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].state + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
      }
  }
  
 content += "</table>";
 return content;
}


$(document).ready(function () {
  $('.description').hide();
  $('#description-all').show();

  // Layer Selection
  jQuery('a.candidate-tab').click(function (e) {
    currentType = jQuery(this).attr('id');
    e.preventDefault();

    jQuery('a.candidate-tab').removeClass('active');
    jQuery(this).addClass('active');

    jQuery('.description').hide();
    jQuery('#description-' + currentType).show();

    drawCircle(currentType);
   
    $('#tooltips').html('<div class="inner">' + showSubCatTableContent(currentType)+ '</div>');
     var actionD = getActionDetails("allstates", currentType);
      jQuery('#tooltips .inner').append('<div id="sect-actionDetails">'+ actionD + '</div>');
    initTblSort();    
  });

  jQuery('#tooltips').on('click', '.lnk-actionDetails', function (e) {
    var actionD = getActionDetails(actionDetails.state, jQuery(this).attr('id'));    
    e.preventDefault();
    jQuery('#sect-actionDetails').remove();
    jQuery('#tooltips .inner').append('<div id="sect-actionDetails"><h2>' +  jQuery(this).text() + ' Cases in ' + actionDetails.statename + '</h2>' + actionD + '</div>');
    initTblSort();
  });
});



