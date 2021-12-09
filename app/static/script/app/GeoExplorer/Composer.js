/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = GeoExplorer.Composer(config)
 *  extends = GeoExplorer
 */

/** api: constructor
 *  .. class:: GeoExplorer.Composer(config)
 *
 *      Create a GeoExplorer application intended for full-screen display.
 */
GeoExplorer.Composer = Ext.extend(GeoExplorer, {

    /** api: config[cookieParamName]
     *  ``String`` The name of the cookie parameter to use for storing the
     *  logged in user.
     */
    cookieParamName: 'geoexplorer-user',

    // Begin i18n.
    saveMapText: "Save Map",
    exportMapText: "Publish Map",
    toolsTitle: "Choose tools to include in the toolbar:",
    previewText: "Preview",
    backText: "Back",
    nextText: "Next",
    loginText: "Login",
    logoutText: "Logout, {user}",
    loginErrorText: "Invalid username or password.",
    userFieldText: "User",
    passwordFieldText: "Password", 
    saveErrorText: "Trouble saving: ",
    // End i18n.

    constructor: function(config) {
        this.mapItems = [
            {
                xtype: "gxp_adminoverlay"
            }, {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100,
                plugins: new GeoExt.ZoomSliderTip({
                    template: this.zoomSliderText
                })
            }
        ];

        this.authorizedRoles = [];
        if (config.authStatus === 401 || this.getCookieValue(this.cookieParamName) === null) {
            // user has not authenticated or is not authorized
            this.authorizedRoles = [];
        } else if (config.authStatus !== 404) {
            // user has authenticated or auth back-end is not available
            this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
        }
        // should not be persisted or accessed again
        delete config.authStatus;

        config.tools = [
            {
                ptype: "gxp_layermanager",
                outputConfig: {
                    id: "layers",
                    autoScroll: true,
                    tbar: []
                },
                outputTarget: "tree"
            }, {
                ptype: "app_zoekcsw",
                actionTarget: "layers.tbar",
                search: {selectedSource: "https://geo.zaanstad.nl/geonetwork/srv/dut/csw"}
            }, {
                ptype: "gxp_addlayers",
                //showButtonText: true,
                addActionText: 'Externe laag',
                upload: true,
                border: false,	
                actionTarget: "adminbuttons"
            }, {
                ptype: "gxp_removelayer",
                actionTarget: ["layers.tbar", "layers.contextMenu"]
            },  {
                ptype: "gxp_layerproperties",
                outputConfig: {autoHeight: true, width: 400},
                actionTarget: ["layers.tbar", "layers.contextMenu"]
        	}, {
                ptype: "gxp_metaviewer",
                actionTarget: ["layers.tbar", "layers.contextMenu"]
            }, {
                ptype: "gxp_zoomtolayerextent",
                actionTarget: {target: "layers.contextMenu", index: 0}
            }, {
                ptype: "gxp_navigation", toggleGroup: "navigation",
                actionTarget: {target: "paneltbar", index: 1}
            }, {
                ptype: "gxp_wmsgetfeatureinfozaanatlas", toggleGroup: this.toggleGroup,
                layerParams: ["CQL_FILTER"],
                vendorParams: {buffer: 10},
                defaultAction: 0,
                actionTarget: {target: "paneltbar", index: 3}
            }, {
                ptype: "gxp_measure", toggleGroup: this.toggleGroup,
                controlOptions: {immediate: true},
                actionTarget: {target: "paneltbar", index: 4}
            }, {
                ptype: "gxp_zoom", toggleGroup: "navigation",
                showZoomBoxAction: true,
                controlOptions: {zoomOnClick: false},
                actionTarget: {target: "paneltbar", index: 2}
            }, {
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 5}
            }, {
                ptype: "gxp_geocodermetpointer" ,
                actionTarget: {target: "paneltbar", index: 20}
            }, {
                ptype: "app_permalink",
                actionTarget: {target: "paneltbar", index: 0}
            }
        ];
        
        GeoExplorer.Composer.superclass.constructor.apply(this, arguments);
    },

    loadConfig: function(config) {
        GeoExplorer.Composer.superclass.loadConfig.apply(this, arguments);

        var mapUrl = window.location.hash.substr(1);
        
        var query = Ext.urlDecode(document.location.search.substr(1));
        if (query && query.styler) {
            for (var i=config.map.layers.length-1; i>=0; --i) {
                delete config.map.layers[i].selected;
            }
            config.map.layers.push({
                source: "local",
                name: query.styler,
                selected: true,
                bbox: query.lazy && query.bbox ? query.bbox.split(",") : undefined
            });
            this.on('layerselectionchange', function(rec) {
                var styler = this.tools.styler,
                    layer = rec.getLayer(),
                    extent = layer.maxExtent;
                if (extent && !query.bbox) {
                    this.mapPanel.map.zoomToExtent(extent);
                }
                this.doAuthorized(styler.roles, styler.addOutput, styler);
            }, this, {single: true});            
        } else if (mapUrl == "") {
            gxp.plugins.ZoekCsw.prototype.autoLoad = true;
        }
        window.location.hash = "";
    },

    /** private: method[setCookieValue]
    * Set the value for a cookie parameter
    */
    setCookieValue: function(param, value) {
        document.cookie = param + '=' + escape(value);
    },

    /** private: method[clearCookieValue]
    * Clear a certain cookie parameter.
    */
    clearCookieValue: function(param) {
        document.cookie = param + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    },

    /** private: method[getCookieValue]
    * Get the value of a certain cookie parameter. Returns null if not found.
    */
    getCookieValue: function(param) {
        var i, x, y, cookies = document.cookie.split(";");
        for (i=0; i < cookies.length; i++) {
            x = cookies[i].substr(0, cookies[i].indexOf("="));
            y = cookies[i].substr(cookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==param) {
                return unescape(y);
            }
        }
        return null;
    },

    /** private: method[logout]
    * Log out the current user from the application.
    */
    logout: function() {
        var callback = function() {
            this.clearCookieValue("JSESSIONID");
            this.clearCookieValue(this.cookieParamName);
            this.setAuthorizedRoles([]);
            window.location.reload();
        };
        Ext.Msg.show({
            title: this.logoutConfirmTitle,
            msg: this.logoutConfirmMessage,
            buttons: Ext.Msg.YESNOCANCEL,
            icon: Ext.MessageBox.WARNING,
            fn: function(btn) {
                if (btn === 'yes') {
                    this.save(callback, this);
                } else if (btn === 'no') {
                    callback.call(this);
                }
            },
            scope: this
        });
    },

    /** private: method[authenticate]
    * Show the login dialog for the user to login.
    */
    authenticate: function() {
        var panel = new Ext.FormPanel({
            url: "../login/",
            frame: true,
            labelWidth: 70,
            defaultType: "textfield",
            errorReader: {
                read: function(response) {
                    var success = false;
                    var records = [];
                    if (response.status === 200) {
                        success = true;
                    } else {
                        records = [
                            {data: {id: "username", msg: this.loginErrorText}},
                            {data: {id: "password", msg: this.loginErrorText}}
                        ];
                    }
                    return {
                        success: success,
                        records: records
                    };
                }
            },
            items: [{
                fieldLabel: this.userFieldText,
                name: "username",
                width: 137,
                allowBlank: false,
                listeners: {
                    render: function() {
                        this.focus(true, 100);
                    }
                }
            }, {
                fieldLabel: this.passwordFieldText,
                name: "password",
                width: 137,
                inputType: "password",
                allowBlank: false
            }],
            buttons: [{
                text: this.loginText,
                formBind: true,
                handler: submitLogin,
                scope: this
            }],
            keys: [{
                key: [Ext.EventObject.ENTER],
                handler: submitLogin,
                scope: this
            }]
        });

        function submitLogin() {
            panel.buttons[0].disable();
            panel.getForm().submit({
                success: function(form, action) {
                    Ext.getCmp('paneltbar').items.each(function(tool) {
                        if (tool.needsAuthorization === true) {
                            tool.enable();
                        }
                    });
                    var user = form.findField('username').getValue();
                    this.setCookieValue(this.cookieParamName, user);
                    this.setAuthorizedRoles(["ROLE_ADMINISTRATOR"]);
                    this.showLogout(user);
                    win.un("beforedestroy", this.cancelAuthentication, this);
                    win.close();
                },
                failure: function(form, action) {
                    this.authorizedRoles = [];
                    panel.buttons[0].enable();
                    form.markInvalid({
                        "username": this.loginErrorText,
                        "password": this.loginErrorText
                    });
                },
                scope: this
            });
        }
                
        var win = new Ext.Window({
            title: this.loginText,
            layout: "fit",
            width: 250,
            height: 130,
            plain: true,
            border: false,
            modal: true,
            items: [panel],
            listeners: {
                beforedestroy: this.cancelAuthentication,
                scope: this
            }
        });
        win.show();
    },

    /**
     * private: method[applyLoginState]
     * Attach a handler to the login button and set its text.
     */
    applyLoginState: function(iconCls, text, handler, scope) {
        //this.loginButton.setIconClass(iconCls);
        //this.loginButton.setText(text);
        //this.loginButton.setHandler(handler, scope);
        console.log(this.authorizedRoles);
    },

    /** private: method[showLogin]
     *  Show the login button.
     */
    showLogin: function() {
        Ext.getCmp('adminbar').hide();
        //var text = this.loginText;
        //var handler = this.showLoginDialog;
        //this.applyLoginState('login', text, handler, this);
    },

    /** private: method[showLogout]
     *  Show the logout button.
     */
    showLogout: function(user) {
        Ext.getCmp('adminbar').show();
        //var text = new Ext.Template(this.logoutText).applyTemplate({user: user});
        //var handler = this.logout;
        //this.applyLoginState('logout', text, handler, this);
    },

    /**
     * api: method[createTools]
     * Create the toolbar configuration for the main view.
     */
    createTools: function() {
        //var tools = GeoExplorer.Composer.superclass.createTools.apply(this, arguments);
        var tools = [];

        // unauthorized, show login button
        if (this.authorizedRoles.length === 0) {
            this.showLogin();
        } else {
            var user = this.getCookieValue(this.cookieParamName);
            if (user === null) {
                user = "unknown";
            }
            this.showLogout(user);
        }

        tools.unshift("-");
        tools.unshift("-");
        tools.unshift("-");
        tools.push("->");
        return tools;
    },

    /** private: method[openPreview]
     */
    openPreview: function(embedMap) {
        var preview = new Ext.Window({
            title: this.previewText,
            layout: "fit",
            resizable: false,
            items: [{border: false, html: embedMap.getIframeHTML()}]
        });
        preview.show();
        var body = preview.items.get(0).body;
        var iframe = body.dom.firstChild;
        var loading = new Ext.LoadMask(body);
        loading.show();
        Ext.get(iframe).on('load', function() { loading.hide(); });
    },

    /** private: method[save]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    save: function(callback, scope) {
        var configStr = Ext.util.JSON.encode(this.getState());
        var method, url;
        if (this.id) {
            method = "PUT";
            url = "../maps/" + this.id;
        } else {
            method = "POST";
            url = "../maps/";
        }
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSave(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
    },
        
    /** private: method[handleSave]
     *  :arg: ``XMLHttpRequest``
     */
    handleSave: function(request) {
        if (request.status == 200) {
            var config = Ext.util.JSON.decode(request.responseText);
            var mapId = config.id;
            if (mapId) {
                this.id = mapId;
                window.location.hash = "#maps/" + mapId;
            }
        } else {
            throw this.saveErrorText + request.responseText;
        }
    },

    /** private: method[showEmbedWindow]
     */
    showEmbedWindow: function() {
       var toolsArea = new Ext.tree.TreePanel({title: this.toolsTitle, 
           autoScroll: true,
           root: {
               nodeType: 'async', 
               expanded: true, 
               children: this.viewerTools
           }, 
           rootVisible: false,
           id: 'geobuilder-1'
       });

       var previousNext = function(incr){
           var l = Ext.getCmp('geobuilder-wizard-panel').getLayout();
           var i = l.activeItem.id.split('geobuilder-')[1];
           var next = parseInt(i, 10) + incr;
           l.setActiveItem(next);
           Ext.getCmp('wizard-prev').setDisabled(next==0);
           Ext.getCmp('wizard-next').setDisabled(next==2);
           Ext.getCmp('resettools').setDisabled(next!=1);
           if (incr == 1) {
           		this.about.title = Ext.getDom('titleText').value;
				this.about['abstract'] = Ext.getDom('descriptionText').value;
               	this.save();
           }
       };

       var embedMap = new gxp.EmbedMapDialog({
           id: 'geobuilder-2',
           url: "../viewer/#maps/" + this.id
       });
       
       var textPanel = new Ext.Panel({
       	layout: 'form',
       	bodyStyle: "padding: 5px",
		items: [{
				xtype: 'textfield',
				fieldLabel: this.titleText,
				id: 'titleText',
				anchor: "100%",
				selectOnFocus: true,
				allowBlank: false,
				value: app.about.title
			}, {
				xtype: 'textarea',
				fieldLabel: this.descriptionText,
				id: 'descriptionText',
				anchor: "100%",
				selectOnFocus: true,
				value: app.about['abstract']
			}, {
				xtype: 'textfield',
				fieldLabel: this.permakinkText,
				readOnly: true,
				anchor: "100%",
				selectOnFocus: true,
				value: window.location.href
			}],
		id: 'geobuilder-0'
       });

       var wizard = {
           id: 'geobuilder-wizard-panel',
           border: false,
           layout: 'card',
           activeItem: 0,
           defaults: {border: false, hideMode: 'offsets'},
           bbar: [{
               id: 'preview',
               text: this.previewText,
               handler: function() {
					this.about.title = Ext.getDom('titleText').value;
					this.about['abstract'] = Ext.getDom('descriptionText').value;
                   	this.save(this.openPreview.createDelegate(this, [embedMap]));
               },
               scope: this
           },{
               id: 'resettools',
               text: "Reset tools",
               handler: function() {
                    this.viewerTools.length = 0;
                    Ext.apply(this.viewerTools, this.getViewerTools());
                    var area = Ext.getCmp('geobuilder-1');
                    area.root.reload();
                    //this.save(this.openPreview.createDelegate(this, [embedMap]));
               },
               scope: this,
               disabled: true
           }, '->', {
               id: 'wizard-prev',
               text: this.backText,
               handler: previousNext.createDelegate(this, [-1]),
               scope: this,
               disabled: true
           },{
               id: 'wizard-next',
               text: this.nextText,
               handler: previousNext.createDelegate(this, [1]),
               scope: this
           }],
           items: [textPanel, toolsArea, embedMap]
       };

       new Ext.Window({
            layout: 'fit',
            width: 500, height: 300,
            modal: true,
            title: this.exportMapText,
            items: [wizard]
       }).show();
    }
});
