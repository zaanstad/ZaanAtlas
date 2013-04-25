/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
* module = gxp.plugins
* class = GeocoderMetPointer
*/

/** api: (extends)
* plugins/Tool.js
*/
Ext.namespace("gxp.plugins");

/** api: constructor
* .. class:: GeocoderMetPointer(config)
*
* Plugin for removing a selected layer from the map.
* TODO Make this plural - selected layers
*/
gxp.plugins.GeocoderMetPointer = Ext.extend(gxp.plugins.Tool, {
    
/** api: ptype = gxp_geocodermetpointer */
    ptype: "gxp_geocodermetpointer",
    
/** api: config[addActionMenuText]
* ``String``
* Text for add menu item (i18n).
*/
    addActionMenuText: "Zoek adres",

/** api: config[addActionTip]
* ``String``
* Text for add action tooltip (i18n).
*/
    addActionTip: "Inzoomen naar een adres",

/** api: config[addLayerSourceErrorText]
* ``String``
* Text for an error message when WMS GetCapabilities retrieval fails (i18n).
*/
    addLayerSourceErrorText: "Error getting WMS capabilities ({msg}).\nPlease check the url and try again.",

/** api: config[availableLayersText]
* ``String``
* Text for the available layers (i18n).
*/
    availableLayersText: "Zoeken op adres of postcode",

/** api: config[availableLayersText]
* ``String``
* Text for the grid expander (i18n).
*/
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
    
/** api: config[availableLayersText]
* ``String``
* Text for the layer title (i18n).
*/
    panelTitleText: "Title",
    
/** api: config[instructionsText]
* ``String``
* Text for additional instructions at the bottom of the grid (i18n).
* None by default.
*/
    
/** api: config[doneText]
* ``String``
* Text for Done button (i18n).
*/
    doneText: "Done",

/** api: config[upload]
* ``Object | Boolean``
* If provided, a :class:`gxp.LayerUploadPanel` will be made accessible
* from a button on the Available Layers dialog. This panel will be
* constructed using the provided config. By default, no upload
* functionality is provided.
*/
    
/** api: config[uploadText]
* ``String``
* Text for upload button (only renders if ``upload`` is provided).
*/
    menuText: "Zoek adres",
    
    outputConfig: {
		url: "/geoserver/wfs",
		//url: "http://geo.zaanstad.nl/geoserver/wfs",
		featureType: "vw_adres",
		featurePrefix: "geo",
		srsName: "EPSG:28992",
        maxFeatures: 70,
        outputFormat: "JSON",
		fieldName: "adres",
		geometryName: "geom",
		emptyText: "Type een adres ...",
		listEmptyText: "- niets gevonden -"
	},
	
	zoom: 8,
    
	/** private: method[constructor]
	 */
    constructor: function(config) {
        gxp.plugins.GeocoderMetPointer.superclass.constructor.apply(this, arguments);
    },
	
    /** api: method[addActions]
    */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.GeocoderMetPointer.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            menuText: this.addActionMenuText,
            text: this.menuText,
            iconCls: "gxp-icon-find",
            cls: 'adres-button',
            enableToggle: true,
            allowDepress: true,
            //handler: this.showCapabilitiesGrid,
            toggleHandler: function(button, pressed) {
                if (pressed) {
                    this.showCapabilitiesGrid();
                } else {
                    this.capGrid.close();
                    var aantal = this.target.mapPanel.map.layers.length;
                    for(var p = 0; p < aantal; p++) {
                        if (this.target.mapPanel.map.layers[p].name == "Adres") { 
                            //map.layers[p].destroy();
                            this.target.mapPanel.map.removeLayer(this.target.mapPanel.map.layers[p]);
                        };
                    };
                }
             },
            scope: this
        }]);
        
        return actions;
    },

    /** api: method[addOutput]
     */
    addOutput: function(config) {
        return gxp.plugins.GeocoderMetPointer.superclass.addOutput.call(this, combo);
    },
    
    /** private: method[onComboSelect]
     *  Listener for combo's select event.
     */
    onComboSelect: function(combo, record) {
        var map = this.target.mapPanel.map;
        var location = record.get("feature").geometry;
        if (location instanceof OpenLayers.Geometry.Point) {
            map.setCenter(new OpenLayers.LonLat(location.x, location.y), this.zoom);
						
            var feature = new OpenLayers.Feature.Vector();
            feature.fid = 1;
            feature.geometry = location;
						
            symboollayer.removeAllFeatures();
            symboollayer.addFeatures([feature]);
            symboollayer.redraw();
            
        }
    },

    /**
     * private: method[initCapGrid]
     * Constructs a window with a capabilities grid.
     */
    showCapabilitiesGrid: function() {

        var hereStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                graphicName: "circle",
                pointRadius: 18, // sized according to type attribute
                fillColor: "#BB0C4F",
                fillOpacity: 0.3,
                strokeColor: "#BB0C4F",
                strokeWidth: 4,
                graphicZIndex: 1
            })
        });
		
        symboollayer = new OpenLayers.Layer.Vector("Adres", {styleMap: hereStyle, displayInLayerSwitcher: false});	
        this.target.mapPanel.map.addLayers([symboollayer]);
		var kaartposition = this.target.mapPanel.getPosition();
		var kaartsize = this.target.mapPanel.getSize();
		
		var combo = new gxp.form.AutoCompleteComboBox(Ext.apply({
        	width: 250,
            id: "GeocoderMetPointer",
        	selectOnFocus: true,
            listeners: {
                select: this.onComboSelect,
                beforeQuery: function(q) {
                  q.query = q.query.trim().replace(/\ /g,'*');
                },
                scope: this
            }
        }, this.outputConfig));
        
        var bounds = target.mapPanel.map.restrictedExtent;
        //var bounds = this.target.mapPanel.map.maxExtent;
        if (bounds && !combo.bounds) {
            this.target.on({
                ready: function() {
                    combo.bounds = bounds.clone().transform(
                        this.target.mapPanel.map.getProjectionObject(),
                        new OpenLayers.Projection("EPSG:4326"));
                }
            })
        };
		
        this.capGrid = new Ext.Window({
            title: "Zoeken op adres",
            shadow: false,
            closable: false,
            layout: "fit",
            width: 370,
            x: kaartposition[0] + kaartsize.width - 370,
            y: kaartposition[1],
            resizable: false, 
            items: [combo],
            listeners: {
                afterrender: function(cmp){
                    Ext.getCmp("GeocoderMetPointer").focus(true, 100);
                },
                scope: this
            }
        });

        this.capGrid.show();
    }
});
Ext.preg(gxp.plugins.GeocoderMetPointer.prototype.ptype, gxp.plugins.GeocoderMetPointer);


