/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires plugins/FeatureEditorGrid.js
 * @requires GeoExt/widgets/Popup.js
 * @requires OpenLayers/Control/WMSGetFeatureInfo.js
 * @requires OpenLayers/Format/WMSGetFeatureInfo.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = WMSGetFeatureInfoZaanAtlas
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: WMSGetFeatureInfoZaanAtlas(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.WMSGetFeatureInfoZaanAtlas = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_wmsgetfeatureinfo */
    ptype: "gxp_wmsgetfeatureinfozaanatlas",
    
    /** api: config[outputTarget]
     *  ``String`` Popups created by this tool are added to the map by default.
     */
    outputTarget: "map",

    popup: null,

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Informatie opvragen van een locatie",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Info van locatie",
    
    /** api: config[text]
     *  ``String`` Text for the GetFeatureInfo button (i18n).
     */
    buttonText: "Info van locatie",
    
    /** api: config[format]
     *  ``String`` Either "html" or "grid". If set to "grid", GML will be
     *  requested from the server and displayed in an Ext.PropertyGrid.
     *  Otherwise, the html output from the server will be displayed as-is.
     *  Default is "html".
     */
    format: "html",

    symboollayer: null,

    xy: new OpenLayers.Pixel(0,0),
    
    /** api: config[vendorParams]
     *  ``Object``
     *  Optional object with properties to be serialized as vendor specific
     *  parameters in the requests (e.g. {buffer: 10}).
     */
    
    /** api: config[layerParams]
     *  ``Array`` List of param names that should be taken from the layer and
     *  added to the GetFeatureInfo request (e.g. ["CQL_FILTER"]).
     */
     
    /** api: config[itemConfig]
     *  ``Object`` A configuration object overriding options for the items that
     *  get added to the popup for each server response or feature. By default,
     *  each item will be configured with the following options:
     *
     *  .. code-block:: javascript
     *
     *      xtype: "propertygrid", // only for "grid" format
     *      title: feature.fid ? feature.fid : title, // just title for "html" format
     *      source: feature.attributes, // only for "grid" format
     *      html: text, // responseText from server - only for "html" format
     */

    /** api: method[addActions]
     */
    addActions: function() {
        //this.popupCache = {};
        
        var actions = gxp.plugins.WMSGetFeatureInfoZaanAtlas.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "gxp-icon-getfeatureinfo",
            buttonText: this.buttonText,
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = info.controls.length; i < len; i++){
                    if (pressed) {
                        info.controls[i].activate();
                    } else {
                        info.controls[i].deactivate();
                    }
                }
                if (pressed) {
                  infolaagToevoegen();
                } else {
                  infolaagverwijderen();
                  popupverwijderen();
                }
             }
        }]);
        var infoButton = this.actions[0].items[0];

        var info = {controls: []};
        var updateInfo = function() {
            var queryableLayers = this.target.mapPanel.layers.queryBy(function(x){
                return x.get("queryable");
            });

            var map = this.target.mapPanel.map;
            var control;
            for (var i = 0, len = info.controls.length; i < len; i++){
                control = info.controls[i];
                control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
                control.destroy();
            }

            info.controls = [];
            queryableLayers.each(function(x){
                var layer = x.getLayer();
                var vendorParams = Ext.apply({}, this.vendorParams), param;
                if (this.layerParams) {
                    for (var i=this.layerParams.length-1; i>=0; --i) {
                        param = this.layerParams[i].toUpperCase();
                        vendorParams[param] = layer.params[param];
                    }
                }
                var infoFormat = x.get("infoFormat");
                if (infoFormat === undefined) {
                    // TODO: check if chosen format exists in infoFormats array
                    // TODO: this will not work for WMS 1.3 (text/xml instead for GML)
                    infoFormat = this.format == "html" ? "text/html" : "application/vnd.ogc.gml";
                }
                var control = new OpenLayers.Control.WMSGetFeatureInfo(Ext.applyIf({
                    url: layer.url,
                    queryVisible: true,
                    layers: [layer],
                    drillDown: true,
                    infoFormat: infoFormat,
                    vendorParams: vendorParams,
                    eventListeners: {
                        getfeatureinfo: function(evt) {
                            var title = x.get("title") || x.get("name");
                            if (infoFormat == "text/html") {
                                var match = evt.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
                                if (match && !match[1].match(/^\s*$/)) {
                                    this.displayPopup(evt, title, match[1]);
                                }
                            } else if (infoFormat == "text/plain") {
                                this.displayPopup(evt, title, '<pre>' + evt.text + '</pre>');
                            } else if (evt.features && evt.features.length > 0) {
                                this.displayPopup(evt, title, null,  x.get("getFeatureInfo"));
                            }
                        },
                        beforegetfeatureinfo: this.beforeGetFeatureInfo,
                        scope: this
                    }
                }, this.controlOptions));
                map.addControl(control);
                info.controls.push(control);
                if(infoButton.pressed) {
                    control.activate();
                }
            }, this);

        };

      var infolaagToevoegen = function(){

        var style = new OpenLayers.StyleMap({
            "pointer": new OpenLayers.Style({
              // Set the external graphic and background graphic images.
              externalGraphic: "../theme/app/img/marker.png",
              backgroundGraphic: "../theme/app/img/marker-shadow.png",

              // Makes sure the background graphic is placed correctly relative
              // to the external graphic.
              backgroundXOffset:  -2, backgroundYOffset: -26,
              graphicXOffset: -10, graphicYOffset: -32,

              // Set the z-indexes of both graphics to make sure the background
              // graphics stay in the background (shadows on top of markers looks odd; let's not do that).
              graphicZIndex: 10,
              backgroundGraphicZIndex: 11,
              pointRadius: 15
              }),
            "default": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            pointRadius: 8,
                            graphicName: "circle",
                            fillColor: "#FFFF00",
                            fillOpacity: 0.9,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#4D4DFF"
                        },
                        "Line": {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: "#4D4DFF"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#4D4DFF",
                            fillColor: "#FFFF00",
                            fillOpacity: 0.4
                        }
                    }
                })]
            })
        });

        var symboollayer = new OpenLayers.Layer.Vector("Info", {styleMap: style, displayInLayerSwitcher: false});   
        this.app.mapPanel.layers.map.addLayers([symboollayer]);
        gxp.plugins.WMSGetFeatureInfoZaanAtlas.prototype.symboollayer = symboollayer;    
      };

      var infolaagverwijderen = function() {
        //this.symboollayer.destroy();
        for(var p = 1; p < this.app.mapPanel.layers.map.layers.length; p++) {
          if (this.app.mapPanel.layers.map.layers[p].name == "Info"){
            this.app.mapPanel.layers.map.layers[p].destroy();
          }
        } 
      };

      var popupverwijderen = function() {
        var popup = Ext.getCmp('WMSGetFeatureInfoZaanAtlas');
        if (popup) {
          popup.hide();
        }
      };
        
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    },

    beforeGetFeatureInfo: function(evt) {
      if (!(evt.xy === this.xy)) {
        this.xy = evt.xy;
        this.symboollayer.removeAllFeatures();
        this.tekenPrikker(evt.xy);
        if (this.popup) {
            this.popup.removeAll();
          }
      }
    },

    printDiv: function(div_id) {

      var DocumentContainer = document.getElementById(div_id);
      var html = '<html><head>'+
            '<title>ZaanAtlas</title>' +
            '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
            '<!-- GeoExplorer resources -->' +
            '<link rel="stylesheet" type="text/css" href="../externals/ext/resources/css/ext-all.css">' +
            '<link rel="stylesheet" type="text/css" href="../externals/ext/resources/css/xtheme-zaanstad.css">' +
            '<link rel="stylesheet" type="text/css" href="../externals/GeoExt/resources/css/popup.css">' +
            '<link rel="stylesheet" type="text/css" href="../externals/GeoExt/resources/css/gxtheme-gray.css">' +
            '<link rel="stylesheet" type="text/css" href="../externals/gxp/src/theme/all.css">' +
            '<link rel="stylesheet" type="text/css" href="../theme/app/geoexplorer.css" />' +
            '<!-- Zaanstad resources -->' +
            '<link rel="stylesheet" type="text/css" href="../theme/app/zaanstad-composer.css" />' +
            '<link rel="stylesheet" type="text/css" href="../theme/app/zaanstad-getfeatureinfo.css" />' +
            '<link rel="shortcut icon" href="../theme/app/img/favicon.ico">' +
            '</head><body style="background:#ffffff;" onload="window.print();window.close();";>' +
            DocumentContainer.innerHTML+
            '</body></html>';

          var windowObject = window.open(); //window.open("", "", "width=595,height=842,toolbars=no,scrollbars=yes,status=no,resizable=no");
          windowObject.document.writeln(html);
          windowObject.document.close();
          windowObject.focus();
    },

    tekenPrikker: function(xy) {

        var location = this.target.mapPanel.map.getLonLatFromViewPortPx(xy);
        var punt = new OpenLayers.Geometry.Point();
        punt.x = location.lon;
        punt.y = location.lat;
              
        var feature = new OpenLayers.Feature.Vector();
        feature.fid = 1;
        feature.geometry = punt;
        feature.renderIntent = "pointer";

        this.symboollayer.addFeatures([feature]);
        this.symboollayer.redraw();
    },

    tekenFeatures: function(features) {
      var feature;
      for (var i=0,ii=features.length; i<ii; ++i) {
          feature = features[i];
          
          this.symboollayer.addFeatures([feature]);
        }

      this.symboollayer.redraw();
    },

    /** private: method[displayPopup]
     * :arg evt: the event object from a 
     *     :class:`OpenLayers.Control.GetFeatureInfo` control
     * :arg title: a String to use for the title of the results section 
     *     reporting the info to the user
     * :arg text: ``String`` Body text.
     */
    displayPopup: function(evt, title, text, featureinfo) {

        featureinfo = featureinfo || {};
        if (!this.popup) {
            this.popup = this.addOutput({
                id: "WMSGetFeatureInfoZaanAtlas",
                xtype: "window",
                title: this.popupTitle,
                layout: "accordion",
                fill: false,
                autoScroll: true,
                closeAction: "hide",
                x: this.target.mapPanel.getPosition()[0] + this.target.mapPanel.getSize().width - 400,
                y: this.target.mapPanel.getPosition()[1],
                map: this.target.mapPanel,
                width: 400,
                height: 600,
                listeners: {
                    close: (function(key) {
                    this.symboollayer.removeAllFeatures();
                    }),
                    scope: this
                  },
                defaults: {
                    layout: "fit",
                    autoScroll: true,
                    //autoHeight: true,
                    autoWidth: true,
                    collapsible: true
                }
            });
        } 

        this.itemConfig = {
            title: title,
            layout: "fit",
            tools: [{
                id:'print',
                tooltip: 'Print de inhoud van dit venster',
                handler: function(event){ 
                    this.printDiv(this.popup.layout.activeItem.body.id); 
                },
                scope: this
                }],
            autoScroll: true,
            autoWidth: true,
            collapsible: true
        };

        var features = evt.features, config = [];
        if (!text && features) {
            this.tekenFeatures(features);
            var feature;
            for (var i=0,ii=features.length; i<ii; ++i) {
                feature = features[i];
                config.push(Ext.apply({
                    xtype: "gxp_editorgrid",
                    readOnly: true,
                    listeners: {
                        'beforeedit': function (e) {
                            return false;
                        }
                    },
                    title: feature.fid ? feature.fid : title,
                    feature: feature,
                    fields: featureinfo.fields,
                    propertyNames: featureinfo.propertyNames
                }, this.itemConfig));
            }
        } else if (text) {
            config.push(Ext.apply({
                title: title,
                html: text
            }, this.itemConfig));
        }
        this.popup.add(config);
        this.popup.doLayout();
        this.popup.show();
    }
    
});

Ext.preg(gxp.plugins.WMSGetFeatureInfoZaanAtlas.prototype.ptype, gxp.plugins.WMSGetFeatureInfoZaanAtlas);