/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

//TODO remove the WMSStylesDialog and GeoServerStyleWriter includes
/**
 * @include widgets/WMSStylesDialog.js
 * @include plugins/GeoServerStyleWriter.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 * @require OpenLayers/Format/CQL.js
 * @require widgets/FilterBuilder.js
 */

/** api: (define)
 *  module = gxp
 *  class = WMSLayerPanel
 *  base_link = `Ext.TabPanel <http://extjs.com/deploy/dev/docs/?class=Ext.TabPanel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: WMSLayerPanel(config)
 *   
 *      Create a dialog for setting WMS layer properties like title, abstract,
 *      opacity, transparency and image format.
 */
gxp.WMSLayerPanelZaanAtlas = Ext.extend(gxp.WMSLayerPanel, {
    
    /** api: config[border]
     *  ``Boolean``
     *  Display a border around the panel.  Defaults to ``false``.
     */
    
    /** i18n */
    aboutText: "About",
    titleText: "Title",
    nameText: "Name",
    descriptionText: "Description",
    displayText: "Display",
    opacityText: "Opacity",
    formatText: "Tile format",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    transparentText: "Transparent",
    cacheText: "Caching",
    cacheFieldText: "Use cached tiles",
    stylesText: "Available Styles",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",

    /** private: method[createDisplayPanel]
     *  Creates the display panel.
     */
    createDisplayPanel: function() {
        var record = this.layerRecord;
        var layer = record.getLayer();
        var opacity = layer.opacity;
        if(opacity == null) {
            opacity = 1;
        }
        var formats = [];
        var currentFormat = layer.params["FORMAT"].toLowerCase();
        Ext.each(record.get("formats"), function(format) {
            if(this.imageFormats.test(format)) {
                formats.push(format.toLowerCase());
            }
        }, this);
        if(formats.indexOf(currentFormat) === -1) {
            formats.push(currentFormat);
        }
        var transparent = layer.params["TRANSPARENT"];
        transparent = (transparent === "true" || transparent === true);

        return {
            title: this.displayText,
            layout: 'form',
            bodyStyle: {"padding": "10px"},
            defaults: {
                labelWidth: 70
            },
            items: [{
                xtype: "fieldset",
                title: this.displayOptionsText,
                items: [{
                    xtype: "gx_opacityslider",
                    name: "opacity",
                    anchor: "99%",
                    isFormField: true,
                    fieldLabel: this.opacityText,
                    listeners: {
                        change: function() {
                            this.fireEvent("change");
                        },
                        scope: this
                    },
                    layer: this.layerRecord
                }, {
                    xtype: "compositefield",
                    fieldLabel: this.formatText,
                    anchor: "99%",
                    items: [{
                        xtype: "combo",
                        width: 90,
                        listWidth: 150,
                        store: formats,
                        value: currentFormat,
                        mode: "local",
                        triggerAction: "all",
                        editable: false,
                        listeners: {
                            select: this.onFormatChange,
                            scope: this
                        }
                    }, {
                        xtype: "checkbox",
                        ref: '../../../transparentCb',
                        checked: transparent,
                        listeners: {
                            check: function(checkbox, checked) {
                                layer.mergeNewParams({
                                    transparent: checked ? "true" : "false"
                                });
                                 this.fireEvent("change");
                            },
                            scope: this
                        }
                    }, {
                        xtype: "label",
                        cls: "gxp-layerproperties-label",
                        text: this.transparentText
                    }]
                }, {
                    xtype: "compositefield",
                    anchor: "99%",
                    hidden: this.layerRecord.get("layer").params.TILED == null,
                    fieldLabel: this.cacheText,
                    items: [{
                        xtype: "checkbox",
                        checked: (this.layerRecord.get("layer").params.TILED === true),
                        listeners: {
                            check: function(checkbox, checked) {
                                var layer = this.layerRecord.get("layer");
                                layer.mergeNewParams({
                                    TILED: checked
                                });
                                this.fireEvent("change");
                            },
                            scope: this
                        }
                    }, {
                        xtype: "label",
                        cls: "gxp-layerproperties-label",
                        text: this.cacheFieldText
                    }]
                }, {
                    xtype: "combo",
                    fieldLabel: this.infoFormatText,
                    emptyText: this.infoFormatEmptyText,
                    store: record.get("infoFormats"),
                    value: record.get("infoFormat"),
                    hidden: (record.get("infoFormats") === undefined),
                    mode: 'local',
                    listWidth: 150,
                    triggerAction: "all",
                    editable: false,
                    anchor: "99%", 
                    listeners: {
                        select: function(combo) {
                            var infoFormat = combo.getValue();
                            record.set("infoFormat", infoFormat);
                            this.fireEvent("change");
                        }
                    }, 
                    scope: this
                }]
            }, {
                xtype: "fieldset",
                title: this.queryText,
                hideLabels: true,
                ref: "../filterFieldset",
                listeners: {
                    expand: function() {
                        this.layerRecord.getLayer().mergeNewParams({CQL_FILTER: this.cqlFilter});
                        this.cqlApply.show();
                    },
                    collapse: function() {
                        this.cqlFilter = this.layerRecord.getLayer().params.CQL_FILTER;
                        this.layerRecord.getLayer().mergeNewParams({CQL_FILTER: null});
                        this.cqlApply.hide();
                    },
                    scope: this
                },
                hidden: this.source === null,
                checkboxToggle: true,
                collapsed: !this.layerRecord.getLayer().params.CQL_FILTER,
                items: [{
                    xtype: "textarea",
                    value: this.layerRecord.getLayer().params.CQL_FILTER,
                    grow: true,
                    anchor: '99%',
                    width: '100%',
                    growMax: 150,
                    ref: "../../cqlField",
                    hidden: true
                }],
                buttons: [{
                    ref: "../../../cqlToolbar",
                    hidden: true,
                    text: this.switchToFilterBuilderText,
                    handler: this.switchToFilterBuilder,
                    scope: this
                    }, {
                    ref: "../../../cqlApply",
                    text: "Toepassen",
                    hidden: true,
                    handler: function() {
                        // Zoom in will be able if the geoserver supports WPS
                        if (!this.cqlField.hidden) {
                            var cql = this.cqlFormat.read(this.cqlField.getValue());
                            this.layerRecord.getLayer().mergeNewParams({
                                CQL_FILTER: cql
                            });
                        }
                        else {
                            this.fireEvent("change");
                        }
                    },
                    scope: this
                    }]
            }, {
                xtype: "fieldset",
                title: this.scaleText,
                listeners: {
                    expand: function() {
                        var layer = this.layerRecord.getLayer();
                        if (this.minScale !== undefined || this.maxScale !== undefined) {
                            this.addScaleOptions(layer, {minScale: this.maxScale, maxScale: this.minScale});
                        }
                    },
                    collapse: function() {
                        var layer = this.layerRecord.getLayer();
                        this.minScale = layer.options.maxScale;
                        this.maxScale = layer.options.minScale;
                        this.addScaleOptions(layer, {minScale: null, maxScale: null});
                    },
                    scope: this
                },
                checkboxToggle: true,
                collapsed: this.layerRecord.getLayer().options.maxScale == null &&
                    this.layerRecord.getLayer().options.minScale == null,
                items: [{
                    xtype: "compositefield",
                    fieldLabel: this.minScaleText,
                    items: [{
                        xtype: "label",
                        text: "1:",
                        cls: "gxp-layerproperties-label"
                    }, {
                        xtype: "numberfield",
                        anchor: '99%',
                        width: '85%',
                        listeners: {
                            'change': function(field) {
                                var options = {
                                    maxScale: parseInt(field.getValue())
                                };
                                var layer = this.layerRecord.getLayer();
                                this.addScaleOptions(layer, options);
                            },
                            scope: this
                        },
                        value: this.layerRecord.getLayer().options.maxScale
                    }]
                }, {
                    xtype: "compositefield",
                    fieldLabel: this.maxScaleText,
                    items: [{
                        xtype: "label",
                        text: "1:",
                        cls: "gxp-layerproperties-label"
                    }, {
                        xtype: "numberfield",
                        anchor: '99%',
                        width: '85%',
                        listeners: {
                            'change': function(field) {
                                var options = {
                                    minScale: parseInt(field.getValue())
                                };
                                var layer = this.layerRecord.getLayer();
                                this.addScaleOptions(layer, options);
                            },
                            scope: this
                        },
                        value: this.layerRecord.getLayer().options.minScale
                    }]
                }]
            }]
        };
    }  

});

Ext.reg('gxp_wmslayerpanel', gxp.WMSLayerPanelZaanAtlas); 
