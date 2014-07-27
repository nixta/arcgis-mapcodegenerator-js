var configs = [
  {
    name: "JavaScript",
    dpi: 96,
    width: 320,
    height: 460,
    code: "JavaScript",
    editable: true,
    newgroup: "JavaScript"
  },
  { 
    name: "iPhone 3G/3GS",
    dpi: 163,
    width: 320,
    height: 460,
    code: "Objective-C",
    newgroup: "iOS (Objective-C)"
  },
  {
    name: "iPhone 4/4S",
    dpi: 163,
    width: 640,
    height: 920,
    code: "Objective-C"
  },
  {
    name: "iPhone 5",
    dpi: 163,
    width: 640,
    height: 1096,
    code: "Objective-C"
  },
  { 
    name: "iPhone 3G/3GS",
    dpi: 163,
    width: 320,
    height: 460,
    code: "Swift",
    newgroup: "iOS (Swift)"
  },
  {
    name: "iPhone 4/4S",
    dpi: 163,
    width: 640,
    height: 920,
    code: "Swift"
  },
  {
    name: "iPhone 5",
    dpi: 163,
    width: 640,
    height: 1096,
    code: "Swift"
  },
  {
    name: "Custom",
    dpi: 96,
    width: 400,
    height: 400,
    editable: true,
    code: "English",
    newgroup: "Other"
  }
];
  
var codeSnippets = {
  "JavaScript": {
    name: "Zoom to extent",
    template: "var initExtent = new esri.geometry.Extent(\\{\"xmin\":{e.xmin},\"ymin\":{e.ymin},\n" +
              "                                           \"xmax\":{e.xmax},\"ymax\":{e.ymax},\n" +
              "                                           \"spatialReference\":\\{\"wkid\":{e.spatialReference.wkid}\\}\\});\n" +
        "map = new esri.Map(\"map\",\\{extent:initExtent\\});",
    highlighter: "javascript"
  },
  "Objective-C": [{ 
       name: "Zoom to Scale and Point",
      template: "[self.mapView zoomToScale:{scale}\n" + 
                "          withCenterPoint:[AGSPoint pointWithX:{pt.x}\n" +
                "                                             y:{pt.y}\n" +
                "                              spatialReference:[AGSSpatialReference spatialReferenceWithWKID:{pt.spatialReference.wkid}]]\n" +
                "                 animated:YES];",
       highlighter: "objc"
    },
    {
       name: "Zoom to extent",
       template: "[self.mapView zoomToEnvelope:[AGSEnvelope envelopeWithXmin:{e.xmin}\n"+
             "                                                      ymin:{e.ymin}\n"+
             "                                                      xmax:{e.xmax}\n"+
             "                                                      ymax:{e.ymax}\n"+
             "                                          spatialReference:[AGSSpatialReference spatialReferenceWithWKID:{e.spatialReference.wkid}]]\n"+
             "                    animated:YES];",
      highlighter: "objc"
  }],
  "Swift": [{ 
       name: "Zoom to Scale and Point",
      template: "let center = AGSPoint.pointWithX({pt.x}, y:{pt.y}, spatialReference:AGSSpatialReference(WKID: {pt.spatialReference.wkid}))\n" +
                "mapView.zoomToScale({scale}, withCenterPoint:center, animated:true)",
       highlighter: "swift"
    },
    {
       name: "Zoom to extent",
       template: "let envelope = AGSEnvelope(xmin: {e.xmin}, ymin: {e.ymin}, xmax: {e.xmax}, ymax: {e.ymax}, spatialReference: AGSSpatialReference(WKID: {e.spatialReference.wkid}))\n" + 
                 "mapView.zoomToEnvelope(envelope, animated: true)",
      highlighter: "swift"
  }],
  "English": { 
    name: "Zoom to Scale and Point",
    template: "Zoom To Scale {scale} around {pt.x},{pt.y} using spatial reference {pt.spatialReference.wkid}"
  }
};
