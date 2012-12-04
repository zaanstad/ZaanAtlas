/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = VanViewerNaarComposer
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: VanViewerNaarComposer(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.VanViewerNaarComposer = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_vanviewernaarcomposer */
    ptype: "gxp_vanviewernaarcomposer",
    
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
    infoActionTip: "Open volledig scherm",
    
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
     
    /** api: method[addActions]
     */
    addActions: function() {
        //this.popupCache = {};
        //popup_aan = false;
		//plugin = this ;
		
        var actions = gxp.plugins.VanViewerNaarComposer.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "icon-expand",
            text: this.popupTitle,
            enableToggle: false,
            handler : this.openComposer,
            scope: this
        }]);
        
        return actions;
    },
	
	openComposer: function () {
		// open een nieuw browser-window met daarin de composer
		var url = window.location;
		//vervang "viewer" door "composer"
		var nieuwe_url = url.href.replace("viewer","composer");
		
		window.open(nieuwe_url);
	} 
});

Ext.preg(gxp.plugins.VanViewerNaarComposer.prototype.ptype, gxp.plugins.VanViewerNaarComposer);
