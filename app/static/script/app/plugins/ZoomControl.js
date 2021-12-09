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

gxp.plugins.ZoomControl = Ext.extend(gxp.plugins.Tool, {
    ptype: "app_zoomcontrol",

    addActions: function () {
        var map = this.target.mapPanel.map;

        map.addControl(new OpenLayers.Control.Zoom()),
        map.addControl(new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                enableKinetic: true
            }
        }))
    }
});

Ext.preg(gxp.plugins.ZoomControl.prototype.ptype, gxp.plugins.ZoomControl);