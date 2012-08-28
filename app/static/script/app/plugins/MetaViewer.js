/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = MetaViewer
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: MetaViewer(config)
 *
 *    Plugin providing a styles editing dialog for geoserver layers.
 */
gxp.plugins.MetaViewer = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_metaviewer */
    ptype: "gxp_metaviewer",
    
    /** api: config[menuText]
     *  ``String``
     *  Text for layer properties menu item (i18n).
     */
    menuText: "Metadata bekijken",

    /** api: config[tooltip]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    tooltip: "Vraag de metadata op van deze gegevens",
    
    /** api: config[catalog]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    catalog: "http://geo.zaanstad.nl/geonetwork",    
    
    /** api: config[metaurl]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    metaid: "",
    
    constructor: function(config) {
        gxp.plugins.MetaViewer.superclass.constructor.apply(this, arguments);
        
        if (!this.outputConfig) {
            this.outputConfig = {
            	maximizable: true,
            	layout: "auto",
            	autoScroll: true,
                height: 500,
                width: 650
            };
        }
        Ext.applyIf(this.outputConfig, {
            closeAction: "close"
        });
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
        gxp.plugins.MetaViewer.superclass.init.apply(this, arguments);
    },

    /** private: method[destroy]
     */
    destroy: function() {
        gxp.plugins.MetaViewer.superclass.destroy.apply(this, arguments);
    },
    
    /** private: method[enableOrDisable]
     *  Enable or disable the button when the login status changes.
     */
    enableOrDisable: function() {
        if (this.target && this.target.selectedLayer !== null) {
            this.handleLayerChange(this.target.selectedLayer);
        }
    },
    
    /** api: method[addActions]
     */
    addActions: function() {
        var layerProperties;
        var actions = gxp.plugins.MetaViewer.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            iconCls: "gxp-icon-metadata",
            hidden: true,
            tooltip: this.tooltip,
            handler: function() {
                this.addOutput();
            },
            scope: this
        }]);
        
        this.launchAction = actions[0];
        this.target.on({
            layerselectionchange: this.handleLayerChange,
            scope: this
        });
        
        return actions;
    },
    
    /** private: method[handleLayerChange]
     *  :arg record: ``GeoExt.data.LayerRecord``
     *
     *  Handle changes to the target viewer's selected layer.
     */
    handleLayerChange: function(record) {
        this.launchAction.hide();
        if (record && record.get("metadataURLs")) {
        	this.checkMetaURLs(record.data.metadataURLs);
        }
    },

    /** private: method[checkMetaURLs]
     *  :arg layerRec: ``GeoExt.data.LayerRecord``
     *  :arg describeRec: ``Ext.data.Record`` Record from a 
     *      `GeoExt.data.DescribeLayerStore``.
     *
     *  Given a layer record and the corresponding describe layer record, 
     *  determine if the target layer can be styled.  If so, enable the launch 
     *  action.
     */
    checkMetaURLs: function(metadataURLs) {
        for (var i = 0, len = metadataURLs.length; i < len; i++){
			if (metadataURLs[i].href.toLowerCase().match("uuid") != null) {
				this.metaid = this.getUrlVar(metadataURLs[i].href, "uuid");
				this.launchAction.show();
            };
		};
    },

	getUrlVar: function(url, key){
		var result = new RegExp(key + "=([^&]*)", "i").exec(url);
		return result && unescape(result[1]) || "";
	},

	/** api: function[createGeoServerStylerConfig]
	 *  :arg layerRecord: ``GeoExt.data.LayerRecord`` Layer record to configure the
	 *      dialog for.
	 *  :arg url: ``String`` Optional. Custaom URL for the GeoServer REST endpoint
	 *      for writing styles.
	 *
	 *  Creates a configuration object for a :class:`gxp.WMSStylesDialog` with a
	 *  :class:`gxp.plugins.GeoServerStyleWriter` plugin and listeners for the
	 *  "styleselected", "modified" and "saved" events that take care of saving
	 *  styles and keeping the layer view updated.
	 */
	createMetaConfig: function(oid) {
		
		var OLrequest = OpenLayers.Request.GET({
			url : this.catalog + "/srv/nl/metadata.show.embedded?uuid=" + oid + "&currTab=simple",
			async: true,
			headers: {
			 "Content-Type": "application/html"
			},
			success : function(response) {
				//document.getElementById(oid).innerHTML = response.responseText;
				Ext.getCmp(oid).update(response.responseText);
			},
			failure : function(response) {
				Ext.getCmp(oid).update(" Fout:\n"+ response.status + "<br>" +response.statusText);
			}
		});

		return {
            xtype: "container",
            id: oid,
            //html: "<div id=" + oid + ">Metadata opvragen...</div>"
            html: "Metadata opvragen..."
		};
	},
    
    addOutput: function(config) {
        config = config || {};
        var record = this.target.selectedLayer;

        var origCfg = this.initialConfig.outputConfig || {};
        this.outputConfig.title = origCfg.title ||
            this.menuText + ": " + record.get("title");

        Ext.apply(config, this.createMetaConfig(this.metaid));
        Ext.applyIf(config, {style: "padding: 10px"});
        
        var output = gxp.plugins.MetaViewer.superclass.addOutput.call(this, config);
    }
        
});

Ext.preg(gxp.plugins.MetaViewer.prototype.ptype, gxp.plugins.MetaViewer);
