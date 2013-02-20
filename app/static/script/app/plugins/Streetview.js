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
    ptype: "app_streetview",

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
     
    /** api: method[addActions]
     */
    addActions: function() {
		streetview_plugin = this;
		
        var actions = gxp.plugins.Streetview.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            icon: "../theme/app/img/logo_streetview.png",
            text: this.popupTitle,
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            visible: false, //!app.intraEnabled,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = streetview.controls.length; i < len; i++){
                    if (pressed) {
                        streetview.controls[i].activate();
                    } else {
                        streetview.controls[i].deactivate();
                        streetview_plugin.streetview_popup.close();
                    }
                }
             }
        }]);
        
        var streetviewButton = this.actions[0].items[0];
        streetviewButton.setVisible(!app.intraEnabled);
        var streetview = {controls: []};

		var updateStreetView = function() {
			var control;
			for (var i = 0, len = streetview.controls.length; i < len; i++){
				control = streetview.controls[i];
				control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
				control.destroy();
			}

	        streetview.controls = [];
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
						streetview_plugin.openPopup(this.map.getLonLatFromViewPortPx(event.xy));	
				}
			});
				
			//dragcontrol.draw();
			var clickcontrol = new Clicker()
			this.target.mapPanel.map.addControl(clickcontrol);
			streetview.controls.push(clickcontrol);
			if(streetviewButton.pressed) {
				clickcontrol.activate()
			};
		}
		
        this.target.mapPanel.layers.on("update", updateStreetView, this);
        this.target.mapPanel.layers.on("add", updateStreetView, this);
        this.target.mapPanel.layers.on("remove", updateStreetView, this);
        
        return actions;
    },
	
	openPopup: function (location) {
    
		if (!location) {
			location = this.target.mapPanel.map.getCenter();
		};
		if (this.streetview_popup && this.streetview_popup.anc) {
			this.streetview_popup.close();
		};
			
		this.streetview_popup = new GeoExt.Popup({
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
		this.streetview_popup.show();
		this.streetview_popup.panIntoView();
	} 
});

Ext.preg(gxp.plugins.Streetview.prototype.ptype, gxp.plugins.Streetview);
