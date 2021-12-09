/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Permalink
 */

/** api: (extends)
 *  gxp/plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

    /** api: constructor
    * .. class:: Permalink(config)
    *
    * Plugin for removing a selected layer from the map.
    */
    gxp.plugins.MessageBox = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = gxp_permalink */
    ptype: "app_messagebox",

    /** api: config[addActionMenuText]
    * ``String``
    * Text for add menu item (i18n).
    */
    addActionMenuText: "MessageBox",

    /** api: config[addActionTip]
    * ``String``
    * Text for add action tooltip (i18n).
    */
    addActionTip: "Wordt niet meer ondersteund",

    /** api: config[titleText]
    * ``String``
    * Text for the layer title (i18n).
    */
    titleText: "Wordt niet meer ondersteund",

    /** api: config[doneText]
    * ``String``
    * Text for Done button (i18n).
    */
    doneText: "Sluiten",

    /** api: config[menuText]
    * ``String``
    * Text for upload button (only renders if ``upload`` is provided).
    */
    menuText: "",

    iconCls:"icon-permalink",

    /** api: config[troubleText]
    * ``String``
    * Text for Done button (i18n).
    */
    headerText: 'Header',
    bodyText: 'Body.........',

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.MessageBox.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.Permalink.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            menuText: this.addActionMenuText,
            text: this.menuText,
            iconCls: this.iconCls,
            handler : this.showDialog,
            scope: this
        }]);

        this.target.on("ready", function() {
            actions[0].enable();
        });
        return actions;
    },

    /** api: method[showDialog]
    * Shows the window with a capabilities grid.
    */
    showDialog: function() {
        target = this.target;
        configObj = {};

        var centre = [{
            xtype: "container",
            layout: "anchor",
            style: {
                padding: "10px"
            },
            items: [
            {
                xtype:  "container",
                region: "center",
                html:   "<b>" + this.headerText + "</b><br>" +
                        "<p>" + this.bodyText + "<br><br></p>"
            }
        ]
        }];

        var bbarItems = [
        "->",
        new Ext.Button({
            text: this.doneText,
            handler: function() {
                this.dialog.close();
            },
            scope: this
        })
        ];

        this.dialog = new Ext.Window({
            title: this.titleText,
            closeAction: "close",
            //height: 430,
            width: 390,
            modal: true,
            resizable: false,
            items: centre,
            bbar: bbarItems
        });

        this.dialog.show();
    }
 });

Ext.preg(gxp.plugins.MessageBox.prototype.ptype, gxp.plugins.MessageBox);
