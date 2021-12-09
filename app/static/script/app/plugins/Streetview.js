/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
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
                        streetview_popup.close();
                    }
                }
             }
        }]);

		var openPopup = function(evt, map) {

			var location = map.getLonLatFromViewPortPx(evt.xy);	    
			if (!location) {
				location = map.getCenter();
			};
			if (streetview_popup && streetview_popup.anc) {
				streetview_popup.close();
			};
				
			streetview_popup = new GeoExt.Popup({
				title: "Street View",
				location: location,
				zoom: 2,
				width: 400,
				height: 500,
				collapsible: true,
				map: map,
				items: [{  
							xtype: 'gxp_googlestreetviewpanel'
						}]	
			});	
			streetview_popup.show();
			streetview_popup.panIntoView();
		};
        
        var streetview_popup;
        var streetviewButton = this.actions[0].items[0];
        streetviewButton.setVisible(!app.intraEnabled);
        var streetview = {controls: []};

		var Clicker = OpenLayers.Class(OpenLayers.Control, {                
		    defaults: {
		        pixelTolerance: 2,
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
		        openPopup(event, this.map);	
		    },
		    scope: this

		});
		var clickcontrol = new Clicker()
		this.target.mapPanel.map.addControl(clickcontrol);
		streetview.controls.push(clickcontrol);
		if(streetviewButton.pressed) {
			clickcontrol.activate()
		};
        
        return actions;
    }
});

Ext.preg(gxp.plugins.Streetview.prototype.ptype, gxp.plugins.Streetview);
