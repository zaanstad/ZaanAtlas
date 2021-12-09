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
    gxp.plugins.Permalink = Ext.extend(gxp.plugins.Tool, {
        
    /** api: ptype = gxp_permalink */
    ptype: "app_permalink",
        
    /** api: config[addActionMenuText]
    * ``String``
    * Text for add menu item (i18n).
    */
    addActionMenuText: "Bladwijzer",

    /** api: config[addActionTip]
    * ``String``
    * Text for add action tooltip (i18n).
    */
    addActionTip: "Bewaar dit kaartbeeld als een bladwijzer",

    /** api: config[availableLayersText]
    * ``String``
    * Text for the available layers (i18n).
    */
    availableLayersText: "Permalink",
        
    /** api: config[titleText]
    * ``String``
    * Text for the layer title (i18n).
    */
    titleText: "Maak een bladwijzer",
        
    /** api: config[doneText]
    * ``String``
    * Text for Done button (i18n).
    */
    doneText: "Sluiten",
        
    /** api: config[menuText]
    * ``String``
    * Text for upload button (only renders if ``upload`` is provided).
    */
    menuText: "Bladwijzer",

    /** api: config[troubleText]
    * ``String``
    * Text for Done button (i18n).
    */
    emailBodyText: null,

    APIS: {
        tinyurl: "https://tinyurl.com/api-create.php?url=",
        bitly: "https://api.bitly.com/v3/shorten?"
        },

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Permalink.superclass.constructor.apply(this, arguments);
    },
        
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.Permalink.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            menuText: this.addActionMenuText,
            text: this.menuText,
            iconCls:"icon-permalink",
            handler : this.showDialog,
            scope: this
        }]);
        
        this.target.on("ready", function() {
            actions[0].enable();
        });
        return actions;
    },

    /** private: method[getShortURL]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    getShortURL: function(callback, scope, longURL) {
        //alert(longURL.toString().length);
        if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
            this.getBitlyURL(callback, scope, longURL);
        } else {
            if (longURL.toString().length > 1536) {
                this.getTinyURL(callback, scope, longURL);
            } else {
                this.getBitlyURL(callback, scope, longURL);
            }
        }
    },

    /** private: method[getTinyURL]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    getTinyURL: function(callback, scope, longURL) {
        //Ext.Ajax.request({
        OpenLayers.Request.GET({
            url: this.APIS.tinyurl + encodeURIComponent(longURL),
            async: true,
            headers: {
             "Content-Type": "application/txt"
            },
            callback: function(response) {
                if (callback) {
                    callback.call(scope || this, response.responseText);
                }
            },
            failure : function(response) {
                this.displayTrouble(response.responseText);
            },
            scope: this
        });
    },

    /** private: method[getBitlyURL]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    getBitlyURL: function(callback, scope, longURL) {
        var api_key = "R_b3889752450cd7113ec5a5c06eca8b07";
        var access_token = "79e7cef1508d3f3689a1a99e0f6ab843164eb8e0";
        var api_login = "teamgeo";
        var request = "longUrl="+encodeURIComponent(longURL)+"&login="+api_login+"&apiKey="+api_key+"&callback=?";

        OLrequest = OpenLayers.Request.POST({
            url: this.APIS.bitly,
            async: true,
            data: request,
            headers: {
             "Content-Type": "text/javascript"
            },
            callback: function(response) {
                if (callback) {
                    var json = eval("(" + response.responseText.slice(2, -2) + ")");
                    callback.call(scope || this, json.data.url);
                }
            },
            failure : function(response) {
                this.displayTrouble(response.responseText);
            },
            scope: this
         });
    },

    displayTrouble: function(msg, status) {
        Ext.Msg.show({
            title: this.troubleText,
            msg: (msg || "Probleem bij het aanmaken van de link"),
            icon: Ext.MessageBox.WARNING
        });
        
    },

    /** private: method[showUrl]
     */
    showUrl: function(shortUrl) {
        var win = new Ext.Window({
            title: this.menuText,
            layout: 'form',
            labelAlign: 'top',
            modal: true,
            bodyStyle: "padding: 2px",
            width: 250,
            items: [{
                xtype: 'textfield',
                fieldLabel: "Link",
                readOnly: true,
                anchor: "100%",
                selectOnFocus: true,
                value: shortUrl
            }]
        });
        win.show();
    },

    /** private: method[showMail]
     */
    showMail: function(shortUrl) {
        var emailtxt = "%0AEr is een link aangemaakt naar een kaartbeeld uit de ZaanAtlas.%0A";
        window.location = "mailto:?SUBJECT=ZaanAtlas%20link&BODY="+emailtxt
                        +"%0AVerkorte link:%20"+shortUrl
                        + this.emailBodyText;
    },
            
    /** api: method[showDialog]
    * Shows the window with a capabilities grid.
    */
    showDialog: function() {        
        target = this.target;
        configObj = {};
        configObj.map = target.getState().map;
        var configString = createUrlString();
        this.emailBodyText = generateMailBody();

        function createUrlString() {
            delete configObj.map.maxExtent;
            delete configObj.map.projection;
            delete configObj.map.resolutions;
            delete configObj.map.restrictedExtent;
            delete configObj.map.sources;
            delete configObj.map.units;
            delete configObj.map.wrapDateLine;
            
            for (var i = 0, len = configObj.map.layers.length; i < len; i++){
            
            // remove unnecessary information
                delete configObj.map.layers[i].capability;
                delete configObj.map.layers[i].selected;
                delete configObj.map.layers[i].format;
                delete configObj.map.layers[i].fixed;
                delete configObj.map.layers[i].minscale;
                delete configObj.map.layers[i].maxscale;
                if (configObj.map.layers[i].styles == "") {
                    delete configObj.map.layers[i].styles;
                }
                if (configObj.map.layers[i].cql_filter == "") {
                    delete configObj.map.layers[i].cql_filter;
                }
                if (configObj.map.layers[i].group == "") {
                    delete configObj.map.layers[i].group;
                }
                if (configObj.map.layers[i].tiled == true) {
                    delete configObj.map.layers[i].tiled;
                }
                if (configObj.map.layers[i].cached == false) {
                    delete configObj.map.layers[i].cached;
                }
            }
            return Ext.util.JSON.encode(configObj);
        };

        function generateMailBody() {
            lyrs = "";
            bglyrs= "";
            
            for (var i = 0, len = configObj.map.layers.length; i < len; i++){
            // generate list of layernames
                if (configObj.map.layers[i].group == "background") {
                    bglyrs = configObj.map.layers[i].title + "%0A" + bglyrs;
                } else {
                    lyrs = configObj.map.layers[i].title + "%0A" + lyrs;
                }
            }
            return "%0A%0ADe volgende kaartlagen zijn actief:%0A"+lyrs
                    +"%0AOndergronden:%0A"+bglyrs;
        };

        function hideLinkButton(config) {
            /** This cookie's size increases, and oversize Jetty's memory for cookies (4k by default) 
             * Increasing this dedicated memory to 16k resolves the pb (adding a tag 
             * <headerBufferSize>16384</headerBufferSize> in web/pom.xml) 
             */
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                if (getWindowLocation(config).toString().length > 1536) {
                    return true;
                }
                return false;
            } else {
                if (getWindowLocation(config).toString().length > 2356) {
                    return true;
                }
                return false;
            }
        };

        function hideLongLinkMsg(config) {
            if (getWindowLocation(config).toString().length > 2048) {
                return false;
            }
            return true;
        };

        function getWindowLocation(config) {
            pageAddress = window.location.href.split("#")[0];
            return pageAddress + '#q=' + config;
        };

        function setWindowLocation(config) {
            window.location.hash = 'q=' + config;
        };
    
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
                html:   "<font color='red'>Let op: de bladwijzer die je probeert aan te maken bevat erg veel informatie en kan mogelijk problemen gegeven in sommige oudere browsers.<br><br>",
                hidden: hideLongLinkMsg(configString),
                scope: this
            }, {
                xtype:  "container",
                region: "center",
                html:   "<b>Bladwijzer of Favoriet</b><br>" +
                        "<p>Met behulp van een bladwijzer is het mogelijk om een kaartbeeld " + 
                        "te bewaren om deze de volgende keer eenvoudig en snel terug te kunnen vinden. " + 
                        "Gebruik hiervoor de bladwijzer of bookmark functie van de webbrowser terwijl dit venster zichtbaar is.<br><br></p>"
            }, {
                xtype:  "button",
                iconCls:"icon-world-link",
                text:   "Open de bladwijzerlink",
                handler: function() {
                    this.showUrl(getWindowLocation(configString));
                },
                scope: this
            }, {
                xtype:  "container",
                region: "center",
                hidden: !hideLinkButton(configString),
                html:   "<br><br><font color='blue'>De bladwijzer die je probeert aan te maken bevat erg veel informatie, de verkorte link en " +
                        "de verkorte link emailen zijn daarom niet beschikbaar.<br><br></font>"
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

        this.dialog.on('show', function() {
             setWindowLocation(configString);
        });
        
        this.dialog.on('close', function() {
             window.location.hash = "";
        });

        this.dialog.show();
    }
 });		 

Ext.preg(gxp.plugins.Permalink.prototype.ptype, gxp.plugins.Permalink);
