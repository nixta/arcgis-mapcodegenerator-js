var app = {
  jsDpi: 96,
  deviceDpi: 163,
  devicePixelWidth: 320,
  devicePixelHeight: 460,
  useLatLon: false,
  decimalPlaces: 4,
  currentScale: 1,
  initialConfig: 0,
  currentConfig: null,
  map: null
};

function mergeCrossBrowserCSS(originalCSS, name, value) {
  var prefixes = ["webkit", "moz", "ms", "o", ""];
  for (var i=0; i<prefixes.length; i++) {
    var prefix = prefixes[i],
        p = prefix!==""?"-"+prefix+"-":prefix;
    originalCSS[p+name] = dojo.replace(value, {prefix:p});
  }
  return originalCSS;
}

function scaleMapView() {
  var cs = dojo.getComputedStyle(dojo.byId("mapOuter")),
      cw = parseInt(cs.width.replace(/px$/,"")),
      ch = parseInt(cs.height.replace(/px$/,"")),
      wRatio = cw/app.currentConfig.width,
      hRatio = ch/app.currentConfig.height,
      minRatio = Math.min(wRatio,hRatio),
      shouldScale = minRatio < 1,
      newScale = shouldScale?minRatio:1;

  if (newScale !== app.currentScale) {
    app.currentScale = newScale;
    var cssValue = "scale(" + newScale + ")";

    console.log(cw + " x " + ch);

    var newCSS = {};
    mergeCrossBrowserCSS(newCSS, "transform", cssValue);
    mergeCrossBrowserCSS(newCSS, "transform-origin-y", "top");

    dojo.style("map", newCSS);

    console.log("Set transform to " + cssValue);
  }
}

function setDevice() 
{
  var mapDiv = dojo.style("map", {
    width:app.currentConfig.width + "px",
    height:app.currentConfig.height + "px"
  });

  var templateConfig = codeSnippets[app.currentConfig.code];
  dojo.destroy("codeTemplates");

  if( Object.prototype.toString.call( templateConfig ) === "[object Array]" ) 
  {
    // Build a pick list.
    require(["dojo/dom-construct"], function(domConstruct) {
      var arrayOfConfigs = templateConfig;
      var codeTemplates = domConstruct.toDom("<select id='codeTemplates'></select>");
      for (i=0;i<arrayOfConfigs.length;i++)
      {
        var c = arrayOfConfigs[i];
        var optionNode = domConstruct.toDom(dojo.replace("<option name='codeTemplate-{code}-{id}'>{name}</option>",
                          {code:app.currentConfig.code, id:i, name:c.name}));
        domConstruct.place(optionNode, codeTemplates, "last");
      }
      
      dojo.connect(codeTemplates, 'onchange', function()
      {
        app.currentConfig.selectedTemplate = this.selectedIndex;
        updateTemplate();
        scaleMapView();
      });
      
      domConstruct.place(codeTemplates, 'output', 'first');
    });
  }

  dojo.byId("manualDPI").value = app.currentConfig.dpi;
  dojo.byId("manualWidth").value = app.currentConfig.width;
  dojo.byId("manualHeight").value = app.currentConfig.height;
  
  dojo.query("input", dojo.byId("manualEntry")).attr("readonly",!app.currentConfig.editable);

  // dojo.byId("topContainer").resize();
  if (app.map)
  {
    app.map.resize();
  }
}

function processTemplateData(data) {
  var def = new dojo.Deferred();

  require(["esri/geometry/webMercatorUtils"], function(webMercatorUtils) {
    if (app.useLatLon) {
      data.pt = esri.geometry.webMercatorToGeographic(data.pt);
      data.e = esri.geometry.webMercatorToGeographic(data.e);
    }
    if (app.decimalPlaces > -1) {
      data.scale = parseFloat(data.scale.toFixed(app.decimalPlaces));
      
      data.pt.x = parseFloat(data.pt.x.toFixed(app.decimalPlaces));
      data.pt.y = parseFloat(data.pt.y.toFixed(app.decimalPlaces));

      data.e.xmin = parseFloat(data.e.xmin.toFixed(app.decimalPlaces));
      data.e.xmax = parseFloat(data.e.xmax.toFixed(app.decimalPlaces));
      data.e.ymin = parseFloat(data.e.ymin.toFixed(app.decimalPlaces));
      data.e.ymax = parseFloat(data.e.ymax.toFixed(app.decimalPlaces));
    }

    def.resolve(data);
  });

  return def;
}

function updateTemplate()
{
  var templateConfig = codeSnippets[app.currentConfig.code];
  
  // If we're dealing with an array of configs, get the right one (defaulting to 1st).
  if( Object.prototype.toString.call( templateConfig ) === "[object Array]" ) 
  {
    // Do we have a selected template?
    if (!app.currentConfig.selectedTemplate)
    {
      app.currentConfig.selectedTemplate = 0;
    }
    
    templateConfig = templateConfig[app.currentConfig.selectedTemplate];
  }
  
  var ext = map.extent;

  processTemplateData({
    scale: map.getScale() * (app.currentConfig.dpi / app.jsDpi), 
    pt:ext.getCenter(),
    e:ext
  })
  .then(function (templateData) {
    var template = templateConfig.template.replace(/\\{/g,"&curly_left;").replace(/\\}/g,"&curly_right;"),
        str = dojo.replace(template, templateData);

    str = str.replace(/\&curly_left\;/g,"{").replace(/\&curly_right\;/g,"}");

    var templateHighlighter = templateConfig.highlighter,
        codeTemplate = templateHighlighter?"<pre id='highlightedCode' class='brush: {brush}'>{code}</pre>":"{code}",
        codeStr = dojo.replace(codeTemplate, {brush: templateHighlighter, code: str});

    dojo.byId("outputText").innerHTML = codeStr;

    SyntaxHighlighter.highlight();

    dijit.byId("topContainer").resize();
  });
}

require(["dojo/dom-construct", "esri/map", "esri/geometry/Extent", "esri/layers/ArcGISTiledMapServiceLayer", "esri/dijit/Geocoder", "dojo/domReady!"], 
  function (domConstruct, Map, Extent, ArcGISTiledMapServiceLayer, Geocoder) {
  app.currentConfig = configs[app.initialConfig];
  
  var configPicker = dojo.byId("devicePickList");
  var openGroup = null;
  for (i=0; i < configs.length; i++)
  {
    var c = configs[i], prefix="";
    if (c.newgroup || c.endgroup)
    {
      if (openGroup !== null)
      {
        domConstruct.place(openGroup, configPicker, "last");
        openGroup = null;
      }
    }
    
    if (c.newgroup)
    {
      openGroup = domConstruct.toDom("<optgroup label='" + c.newgroup + "'/>");
    }
    
    var newNode = domConstruct.toDom(dojo.replace("<option name='{id}'{s}>{name}</option>", {id:i, name:c.name, s:c==app.currentConfig?" selected":""}));
    domConstruct.place(newNode, openGroup!==null?openGroup:configPicker, "last");
  }
  
  if (openGroup !== null)
  {
    domConstruct.place(openGroup, configPicker, "last");
  }

  dojo.connect(configPicker, "onchange", function() {
    app.currentConfig = configs[this.selectedIndex];
    setDevice();
    updateTemplate();
  });

  dojo.connect(dojo.byId("srPickList"), "onchange", function(e) {
    app.useLatLon = e.target.selectedOptions[0].value === "4326";
    updateTemplate();
  });

  dojo.connect(dojo.byId("manualDPI"), "onchange", function() {
    app.currentConfig.dpi = this.value;
    setDevice();
    updateTemplate();
  });
    
  dojo.connect(dojo.byId("manualWidth"), "onchange", function() {
    app.currentConfig.width = this.value;
    setDevice();
    updateTemplate();
  });
    
  dojo.connect(dojo.byId("manualHeight"), "onchange", function() {
    app.currentConfig.height = this.value;
    setDevice();
    updateTemplate();
  });
    
  SyntaxHighlighter.all();

  setDevice();

  var initExtent = new Extent({
    xmin: -13647945.96,
    ymin: 4502154.47,
    xmax: -13599026.26,
    ymax: 4572476.54,
    spatialReference: { wkid: 102100 }
  });

  map = new Map("map",{
    extent: initExtent
  });

  //Add the topographic layer to the map. View the ArcGIS Online site for services http://arcgisonline/home/search.html?t=content&f=typekeywords:service    
  var basemap = new ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
  map.addLayer(basemap);

  var geocoder = new Geocoder({ 
    map: map,
    autoComplete: true,
    placeholder: "Search…"
  }, "search");
  geocoder.startup();
    
  dojo.connect(map, "onExtentChange", function(extent, delta, levelChange, lod) {
    updateTemplate();
  });
  dojo.connect(map, "onResize", scaleMapView);

  window.onresize = scaleMapView;
});
