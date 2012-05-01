/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = ZoekCsw
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: ZoomToAdres(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.ZoomToAdres = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_zoekcsw */
    ptype: "gxp_zoomtoadres",
    
    /** api: config[addActionMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    addActionMenuText: "Zoek adres",

    /** api: config[addActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    addActionTip: "Inzoomen naar een adres",
       
    /** api: config[availableLayersText]
     *  ``String``
     *  Text for the layer title (i18n).
     */
    panelTitleText: "Zoeken op adres",
   
    /** private: property[selectedSource]
     *  :class:`gxp.plugins.LayerSource`
     *  The currently selected layer source.
     */
    selectedSource: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        this.addEvents(
            /** api: event[sourceselected]
             *  Fired when a new source is selected.
             *
             *  Listener arguments:
             *
             *  * tool - :class:`gxp.plugins.ZoekCsw` This tool.
             *  * source - :class:`gxp.plugins.LayerSource` The selected source.
             */
            "sourceselected"
            );
        gxp.plugins.ZoekCsw.superclass.constructor.apply(this, arguments);        
    },
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.ZoekCsw.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            text: this.addActionText,
            menuText: this.addActionMenuText,
            text: this.addActionMenuText,
            iconCls: "gxp-icon-find",
            handler : this.showTool,
            scope: this
        }]);
        
        this.target.on("ready", function() {
            actions[0].enable();
        });
        return actions;
    },
        
    /** api: method[showCapabilitiesGrid]
     * Shows the window with a capabilities grid.
     */
    showTool: function() {
        if(!this.toolWindow) {
            this.initToolWindow();
        }
        this.toolWindow.show();
    },

    /**
     * private: method[initCapGrid]
     * Constructs a window with a capabilities grid.
     */
     initToolWindow: function() { 
        var items = {
            xtype: "container",
            region: "center",
            style: {
                padding: '10px'
            },
            autoScroll: true,
            html: "<div>Empty HTML</div>",
            scope: this
        };
        //TODO use addOutput here instead of just applying outputConfig
        this.toolWindow = new Ext.Window(Ext.apply({
            title: this.panelTitleText,
            closeAction: "close",
            layout: "border",
            resizable: false, 
            height: 400,
            width: 550,
            //modal: true,
            items: items,
            //tbar: topToolbar,
            //bbar: bbarItems,
        }, this.initialConfig.outputConfig));
        
    },
});

Ext.preg(gxp.plugins.ZoomToAdres.prototype.ptype, gxp.plugins.ZoomToAdres);
