function Tab(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            selected: -1
        };

        for (let l1 = 0; l1 < self.pars.tabs.length; l1++) {
            let tab = self.pars.tabs[l1];
            tab.id = "tab_" + tab.ide;
            tab.panel = tab.panel === undefined ? "pan_" + tab.ide : tab.panel;
            //self.pars.tabs[l1].id = "tab_" + self.pars.tabs[l1].ide;
        }
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.templates.header).html();

        let sel = 0;
        for (let l1 = 0; l1 < self.pars.tabs.length; l1++) {
            let tab = self.pars.tabs[l1];

            if (self.pars.sel === tab.ide) {
                sel = l1;
            }

            let dat = {
                id: tab.id,
                enable: self.dat.enable,
                visible: tab.visible !== undefined ? tab.visible : self.dat.visible,
                image: tab.image,
                text: tab.text
            };

            var res = Mustache.render(h, dat);
            if (apply) {
                self.eform(self.pars.ide).append(res);

                self.eform(dat.id).on("click", { id: dat.id }, function (e) {
                    let idx = self.getindex(e.data.id);
                    self.sel({ index: idx });
                });
            }
        }

        if (!self.pars.visible) {
            self.eform(self.pars.ide).hide();
        }

        self.sel({ index: sel });

        return null;
    };

    this.sel = function (pars) {

        if (!isUndefinedOrEmpty(pars.id)) {
            pars.index = self.getindex(pars.id);
        }

        if (self.dat.selected === pars.index) {
            return;
        }

        let tab = self.pars.tabs[pars.index];

        self.eform(".pan_tab").hide();
        self.eform(".header_tab").removeClass("sel");
        self.eform("tab_" + tab.ide).addClass("sel");

        self.eform(tab.panel).fadeIn(200, function () {
            self.dat.selected = pars.index;

            if (isFunc(self.pars.onselect)) {
                self.pars.onselect(self, tab.ide);
            }
        });
    };

    // COMO AGREGO UN NUEVO PANEL??
    // Hay administrar tambien el contenedor de paneles?
    // Por ahi es un contenedor de paneles dinamicos
    this.add = function (pars) {

        let tab = {
            ide: pars.ide,
            id: "tab_" + pars.ide,
            text: pars.text,
            panel: "pan_" + pars.ide
        };
        self.pars.tabs.push(tab);

        // Agregamos la cabecera
        let dat = {
            id: tab.id,
            enable: self.dat.enable,
            visible: self.dat.visible,
            image: pars.image,
            text: pars.text
        };
        var h = $('#' + self.pars.def.templates.header).html();
        var res = Mustache.render(h, dat);
        self.eform(self.pars.ide).append(res);

        self.eform(dat.id).on("click", { id: dat.id }, function (e) {
            let idx = self.getindex(e.data.id);
            self.sel({ index: idx });
        });

        // Agregamos el panel
        h = $('#' + self.pars.def.templates.dinamic).html();
        res = Mustache.render(h, { id: tab.panel });

        self.eform(self.pars.dinamic).append(res);
    };

    this.remove = function (pars) {

    };

    this.setvisible = function (pars) {
        for (let l1 = 0; l1 < self.pars.tabs.length; l1++) {
            let tab = self.pars.tabs[l1];

            if (pars.ide === tab.ide) {
                if (pars.visible) {
                    self.eform("tab_" + tab.ide).show();
                } else {
                    self.eform("tab_" + tab.ide).hide();
                }
            }
        }
    };

    this.getindex = function (id) {
        for (let l1 = 0; l1 < self.pars.tabs.length; l1++) {
            if (self.pars.tabs[l1].id === id) {
                return l1;
            }
        }
        return -1;
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };

    //this.init();
}