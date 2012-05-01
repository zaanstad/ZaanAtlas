/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Streetview
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Streetview(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.Streetview = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_streetview */
    ptype: "gxp_streetview",
    
    /** api: config[outputTarget]
     *  ``String`` Popups created by this tool are added to the map by default.
     */
    outputTarget: "map",

    /** private: property[popupCache]
     *  ``Object``
     */
    popupCache: null,

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Toon Streetview",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Streetview",
    
    /** api: config[format]
     *  ``String`` Either "html" or "grid". If set to "grid", GML will be
     *  requested from the server and displayed in an Ext.PropertyGrid.
     *  Otherwise, the html output from the server will be displayed as-is.
     *  Default is "html".
     */
    format: "html",
    
    /** api: config[vendorParams]
     *  ``Object``
     *  Optional object with properties to be serialized as vendor specific
     *  parameters in the requests (e.g. {buffer: 10}).
     */
    
    /** api: config[paramsFromLayer]
     *  ``Array`` List of param names that should be taken from the layer and
     *  added to the GetFeatureInfo request (e.g. ["CQL_FILTER"]).
     */
     
    /** api: method[addActions]
     */
    addActions: function() {
        this.popupCache = {};
		plugin = this;
		
        var actions = gxp.plugins.Streetview.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            icon: "../theme/app/img/logo_streetview.png",
            text: this.popupTitle,
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
             }
        }]);
        
        var infoButton = this.actions[0].items[0];
        var info = {controls: []};
		var updateInfo = function() {
		var control;
		for (var i = 0, len = info.controls.length; i < len; i++){
			control = info.controls[i];
			control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
			control.destroy();
		}

            info.controls = [];
			var Clicker = OpenLayers.Class(OpenLayers.Control, {                
				defaults: {
					pixelTolerance: 1,
					stopSingle: true
				},

				initialize: function(options) {
					this.handlerOptions = OpenLayers.Util.extend(
						{}, this.defaults
					);
					OpenLayers.Control.prototype.initialize.apply(this, arguments); 
					this.handler = new OpenLayers.Handler.Click(
						this, {click: this.trigger}, this.handlerOptions
					);
				}, 

				trigger: function(event) {
						plugin.openPopup(this.map.getLonLatFromViewPortPx(event.xy));	
				}

			});
			
			//dragcontrol.draw();
			var clickcontrol = new Clicker()
			this.target.mapPanel.map.addControl(clickcontrol);
			info.controls.push(clickcontrol);
			if(infoButton.pressed) {
				clickcontrol.activate()
			};
		}
		
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    },
	
	openPopup: function (location) {
    
		if (!location) {
			location = this.target.mapPanel.map.getCenter();
		};
		if (this.popup && this.popup.anc) {
			this.popup.close();
		};
		
		//var proj1 = new OpenLayers.Projection("EPSG:4326");
		//var proj2 = new OpenLayers.Projection(this.target.mapPanel.map.projection);
		//var point = new OpenLayers.LonLat(location.lon, location.lat);
		//point.transform(proj, map.getProjectionObject());
		
		//position = location.clone();
		//alert(position);
		//location.transform(new OpenLayers.Projection("EPSG:28992"), new OpenLayers.Projection("EPSG:900913"));
		//var position = new google.maps.LatLng(location.lat, location.lon);
		//alert(position);
			
		this.popup = new GeoExt.Popup({
			title: "Street View",
			location: location,
			zoom: 2,
			width: 400,
			height: 500,
			collapsible: true,
			map: this.target.mapPanel.map,
			items: [{  
						xtype: 'gxp_googlestreetviewpanel'
					}]	
		});	
		this.popup.show();	
	} 
});

Ext.preg(gxp.plugins.Streetview.prototype.ptype, gxp.plugins.Streetview);
