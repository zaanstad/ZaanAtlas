/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
 * of the license.
 */

/* 
 * @require plugins/Tool.js
 * @require OpenLayers/Control/Zoom.js
 * @require OpenLayers/Control/TouchNavigation.js
 */

Ext.namespace("gxp");

gxp.plugins.LegendControl = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = app_legendcontrol */
    ptype: "app_legendcontrol",

    /** api: config[menuText]
     *  ``String``
     *  Text for legend menu item (i18n).
     */
    menuText: "Legend",

    /** api: config[tooltip]
     *  ``String``
     *  Text for legend action tooltip (i18n).
     */
    tooltip: "Show Legend",

    /** api: config[actionTarget]
     *  ``Object`` or ``String`` or ``Array`` Where to place the tool's actions
     *  (e.g. buttons or menus)? Use null as the default since our tool has both 
     *  output and action(s).
     */
    actionTarget: null,

    addActions: function () {
        var baseParams;

        var legendItem = new Ext.Panel({
            cls: 'legend-overlay',
            border: false,
            items: {
                xtype: 'gx_legendpanel',
                ascending: false,
                border: false,
                hideMode: "offsets",
                cls: 'legend-item',
                //layerStore: null,
                defaults: {
                    //showTitle: false,
                    //useScaleParameter: false,
                    baseParams: Ext.apply({
                        format: "image/png",
                        legend_options: "fontAntiAliasing:true;fontSize:11;fontName:Arial"
                    }, baseParams)
                }
            }
        });

        this.target.mapPanel.add(legendItem);
    }
});

Ext.preg(gxp.plugins.LegendControl.prototype.ptype, gxp.plugins.LegendControl);