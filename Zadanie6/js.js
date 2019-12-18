const Map =ol.Map; 
const View = ol.View; 
const ImageLayer= ol.layer.Image; 
const TileLayer=ol.layer.Tile 
const ImageWMS=ol.source.ImageWMS
const OSM =ol.source.OSM 
const olLayers = [];
const wmsSource = [];


  layers = [
    new TileLayer({
      source: new OSM()
    }),
  ];

  var view = new View({
    projection: 'EPSG:4326',
    center: [17.888738, 48.746600],
    zoom: 14
  });

  var map = new Map({
    layers: layers,
      target: 'map',
      view: view
    });

const WMSCapabilities =ol.format.WMSCapabilities;

var parser = new WMSCapabilities();

function functionURL() {
  const x = document.getElementById("myURL").value;
  alert("URL úspešne vložená");
  if (!x) {
    alert('No url')
    return;
}
  Fun();
}

function Fun() {  
  const url = document.getElementById("myURL").value;
    if (!url) {
        return;
    }
    console.log(url)
    fetch(url,{mode:'cors'})
  // fetch('http://localhost:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities',{mode:'cors'})
  .then(function(response) {
    return response.text();
  })
  .then(function(text) {
    appendData(text); 

  });
}

function appendData(text){
    var result = parser.read(text);
    console.log(result);
    var main =document.getElementById("vrstvy");
  


    console.log(result.Capability.Layer.Layer);

    // nacitanie vrstiev z geoservera

    for (var r = 0; r <= result.Capability.Layer.Layer.length - 1; r++) {
      const geoserverLayer = result.Capability.Layer.Layer[r];
      var Source = new ImageWMS({  
        url: 'http://localhost:8080/geoserver/ows?',   
        params: { LAYERS: [geoserverLayer.Name] },  
        ratio: 1, 
        serverType: 'geoserver'
      })
      const layer = new ImageLayer({
        extent: [17.84506885869866, 48.731926770588124, 17.93695929993104, 48.764736748435276],
        source: Source
      })
      olLayers.push(layer) 
      wmsSource.push(Source)  
    }
    console.log(wmsSource)
      var col = [];
      for (var i = 0; i < result.Capability.Layer.Layer.length; i++) {
          for (var key in result.Capability.Layer.Layer[i]) {
              if (col.indexOf(key) === -1) {
                if(key=="Name" || key=="Title" || key=="queryable" || key=="ID")
                  col.push(key);
              }
          }
      }

      var table;
      var thead;
      var tr;
      var th;

      var data=[]; //Added because it was missing... no idea what the original should have been

      tablearea = document.getElementById('vrstvy');
      table = document.createElement('table');
      thead = document.createElement('thead');
      tr = document.createElement('tr');
      table.id='tabVrstvy';

      //naplnenie hlavicky tabukly
      for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      
            data[i]= col[i];
          }
          data.push("check");

        
      for (var i = 0; i < data.length; i++) {
          var headerTxt = document.createTextNode(data[i]);
          th = document.createElement('th');
          th.appendChild(headerTxt);
          tr.appendChild(th);
          thead.appendChild(tr);
      }

      table.appendChild(thead);

      for (var i = 0; i < result.Capability.Layer.Layer.length; i++) {
        tr = document.createElement('tr');

        // vytvorenie stplcov
        for (var j = 0; j <= col.length; j++) {
          tr.appendChild(document.createElement('td'));
        }
       
        //create checkbox and default value "false"
        var checkbox = document.createElement("INPUT"); //Added for checkbox
        checkbox.type = "checkbox"; //Added for checkbox
        checkbox.id = i;
        
        //naplnenie hodnotami z geoserveru
        for (var j = 0; j < col.length; j++) {
          var item = result.Capability.Layer.Layer[i][col[j]];
          tr.cells[j].appendChild(document.createTextNode(item));
          tr.cells[3].appendChild(checkbox); //Add checkbox to table
       }
        table.appendChild(tr);
    }
    tablearea.appendChild(table);
    console.log(tablearea);

    // infromacie o vrstvach Get feature info
    map.on('singleclick', function (evt) {
      const sources = [];
      map.getLayers().forEach(layer => sources.push(layer.getSource()));
      document.getElementById('info').innerHTML = '';
      var viewResolution = view.getResolution();
      sources.forEach((wmsSource) => {
          var url = wmsSource.getFeatureInfoUrl && wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:4326',
          { 'INFO_FORMAT': 'text/html' });
          if (url) {
              fetch(url)
              .then(function (response) { return response.text(); })
              .then(function (html) {
                      document.getElementById('info').insertAdjacentHTML( 'beforeend', html );
                  });
          }
  
      }) 
    }) 
  }

// Zobrazenie tabulky
function showTable() {
  tableWrapper = document.getElementById("tableWrapper").style.visibility;
  if(tableWrapper == "visible") {
    document.getElementById("tableWrapper").style.visibility = "hidden";
  }
  else {
    document.getElementById("tableWrapper").style.visibility = "visible";
  }
}

// Pridavanie vrstiev do mapy
function showLayer() {
  const checkboxes = tablearea.getElementsByTagName("INPUT");
  const checboxArray = Array.from(checkboxes);
  checboxArray.forEach(function (checkbox) {
      const index = checkbox.id;
      console.log(index);
      const layer = olLayers[index];
      if (checkbox.checked) {
          
          try {map.addLayer(layer)
              
          } catch (error) {
              console.log(error)
          }
      } else {
          map.removeLayer(layer)
      }
  })
}

  function setColor(btn,color){
    
    var property=document.getElementById(btn);
   if (window.getComputedStyle(property).backgroundColor == 'rgb(244, 0, 0)') {
      property.style.backgroundColor=color;
   }
    else {
      property.style.backgroundColor = "#F40000";
    }
  }

  
  map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.forEachLayerAtPixel(pixel, function() {
      return true;
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });