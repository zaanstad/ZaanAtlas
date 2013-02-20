/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Cyclorama
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Cyclorama(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.Cyclorama = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = app_cyclorama */
    ptype: "app_cyclorama",

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Toon Cyclorama",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Cyclorama",
     
    /** api: method[addActions]
     */
    addActions: function() {
		cyclo_plugin = this;
		
        var actions = gxp.plugins.Cyclorama.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "icon-cyclorama",
            text: this.popupTitle,
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = cyclo.controls.length; i < len; i++){
                    if (pressed) {
                        cyclo.controls[i].activate();
                    } else {
                        cyclo.controls[i].deactivate();
                        cyclo_plugin.cyclo_popup.close();
                    }
                }
             }
        }]);
        
        var cycloButton = this.actions[0].items[0];
        cycloButton.setVisible(app.intraEnabled);
        var cyclo = {controls: []};

		var updateCyclo = function() {
			var control;
			for (var i = 0, len = cyclo.controls.length; i < len; i++){
				control = cyclo.controls[i];
				control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
				control.destroy();
			}

        	cyclo.controls = [];
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
						cyclo_plugin.openPopup(this.map.getLonLatFromViewPortPx(event.xy));	
				}
			});
		
			//dragcontrol.draw();
			var clickcontrol = new Clicker()
			this.target.mapPanel.map.addControl(clickcontrol);
			cyclo.controls.push(clickcontrol);
			if(cycloButton.pressed) {
				clickcontrol.activate()
				};
		}
	
        this.target.mapPanel.layers.on("update", updateCyclo, this);
        this.target.mapPanel.layers.on("add", updateCyclo, this);
        this.target.mapPanel.layers.on("remove", updateCyclo, this);
        
        return actions;
    },
	
	openPopup: function (location) {
    
		if (!location) {
			location = this.target.mapPanel.map.getCenter();
		};
		if (this.cyclo_popup && this.cyclo_popup.anc) {
			this.cyclo_popup.close();
		};
		var mapsize = cyclo_plugin.target.mapPanel.map.size;
		var cyclo_url = "https://globespotter.cyclomedia.com/nl/?Showmap=false&posx="+ location.lon + "&posy=" + location.lat;
		if (mapsize.h < 700 || mapsize.w < 1024) {
	        Ext.Msg.show({
				title: "Te weinig ruimte",
				msg: "Er is te weinig ruimte om de cyclorama's te tonen.<br/><br/>" +
					  "Maak het beeld van de ZaanAtlas groter zodat de dialoog " +
					  "van de cyclorama's past, of klik " +
					  "<a href=" + cyclo_url + " target=_blank>hier</a> om de cyclorama's in een nieuw venster te openen.",
				width: 300,
				icon: Ext.MessageBox.INFO
			});
		} else {
			this.cyclo_popup = new GeoExt.Popup({
	        				   border:false,
							   map: this.target.mapPanel.map,
	                           layout: 'fit',
							   location: location,
							   maximizable: true,
							   collapsible: true,
							   anchored: true,
							   frame: true,
							   html: "<iframe src='" + cyclo_url + "' width='100%'  height='100%' seamless allowTransparency='true'/>",
							   listeners: {
									close: function() {
									// closing a popup destroys it, but our reference is truthy
									this.cyclo_popup = null;
									}
									}

							   });
			this.cyclo_popup.setSize(1024, 700);
			this.cyclo_popup.show();
			this.cyclo_popup.panIntoView();
		}
	} 
});

Ext.preg(gxp.plugins.Cyclorama.prototype.ptype, gxp.plugins.Cyclorama);
