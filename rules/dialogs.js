function RuleDialogs() {
    var self = this;

    this.document_ready = function () {
        self.dat = {
            dialogs: []
        };
        self.unique = 0;
        self.idform = "dialogs";
    };

    this.open = function (formname, pars, fdone) {

        if (pars === undefined || pars === null) {
            pars = {
                id: -1
            };
        }

        // Buscamos el template del dialog
        var template = app.dat.dialogs.get(formname);
        if (template === null) {
            app.dbox.error.sh("Dialog no encontrado", formname);
            if (isFunc(fdone)) {
                callFunc(fdone, null);
            }
            return;
        }

        // Establecemos el id del dialog
        var idform = "dialog_" + template.name;
        if (template.instance === "multiple") {
            if (pars.id > 0) {
                idform = "dialog_" + template.name + "_" + pars.id;
            } else {
                pars.id = -1;
                idform = "dialog_" + template.name + "_n" + self.unique++;
            }
        }
        var prev = self.get(idform);
        if (prev !== null) {
            self.sh(idform, function () {
                prev.instance.shown(false, pars);
                if (isFunc(fdone)) {
                    callFunc(fdone, null);
                }
            });
            return;
        }

        var instance = newFunc(template.class, pars);
        instance.idform = idform;
        instance.pars.tem = template;

        // Agregamos el manejador de controles del formulario
        instance.controls = new FormControls(instance);

        // Llamamos al constructor
        if (instance.init !== undefined) {
            instance.init();
        }

        // Agregamos algunos metodos basicos, si es que no estan agregados en la clase
        if (instance.prepare === undefined) {
            instance.prepare = function () { };
        }
        if (instance.shown === undefined) {
            instance.shown = function () { };
        }
        if (instance.notify === undefined) {
            instance.notify = function (action, pars) { };
        }
        if (instance.eform === undefined) {
            instance.eform = function (id) {
                return RuleBase.eform(instance.idform, id);
            };
        }
        if (instance.setvars === undefined) {
            instance.setvars = function (vars, prep, post) {
                RuleBase.setvars(instance.idform, vars, prep, post);
            };
        }
        if (instance.getvars === undefined) {
            instance.getvars = function (vars, prep, post) {
                return RuleBase.getvars(instance.idform, vars, prep, post);
            };
        }
        if (instance.close === undefined) {
            instance.close = function () {
                app.dialogs.close(instance.idform, instance.pars.backform, null);
            };
        }
        if (instance.enable === undefined) {
            instance.enable = function (valor) {
                app.dialogs.enable(instance.idform, valor);
            };
        }
        if (instance.cons === undefined) {
            instance.cons = {};
        }
        if (instance.dat === undefined) {
            instance.dat = {};
        }

        if (self.dat.dialogs.length === 0) {
            $('#dialog_mask').fadeIn(0);
            $('#dialog_mask').fadeTo(0, 0.3);
            $('#dialogs').show();
        }

        var form = {
            id: idform,
            template: template,
            instance: instance,
            visible: false
        };
        self.dat.dialogs.push(form);

        if (template.instance === "unica") {
            if (template.global !== undefined) {
                app[template.global] = instance;
            }
        }


        self.loading(function () {

            ioaux.load_html(template.package.base + template.html + "?ver=" + app.settings.ver, function (html) {

                /* style="display:none" */
                var h = '<div class="dialog_panel" id="' + idform + '">' + html + '</div>';
                self.eform(null).append(h);

                h = '<div id="' + idform + '_mask" class="form_mask"></div>';
                self.eform(idform).append(h);

                instance.prepare();
                self.sh(idform, function () {
                    instance.shown(true, null);

                    instance.enable(pars.enable === undefined ? true : pars.enable);
                    if (isFunc(fdone)) {
                        callFunc(fdone, null);
                    }

                });
            });
        });
    };

    this.loading = function (fdone) {
        for (let l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            let frm = self.dat.dialogs[l1];
            self.eform(frm.id).hide();
        }

        if (isFunc(fdone)) {
            fdone();
        }
    };

    this.enable = function (id, val) {
        var frm = self.get(id);

        if (frm !== null) {
            if (val) {
                self.eform(frm.id + "_mask").fadeOut(200);
            } else {
                self.eform(frm.id + "_mask").fadeIn(200);
            }
        }
    };

    this.destroy = function (id) {
        var element = self.eform("> #" + id);
        if (element.length > 0) {
            element.remove();
        }

        for (var l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            if (self.dat.dialogs[l1].id === id) {
                var form = self.dat.dialogs[l1];

                self.dat.dialogs.splice(l1, 1);
                break;
            }
        }
    };

    this.clear = function () {
        self.dat.dialogs = [];
        self.eform().html("");
    };

    this.close = function (id, backform, backformalternative) {

        let dialog = self.dat.dialogs[self.dat.dialogs.length - 1];

        self.destroy(dialog.id);

        if (self.dat.dialogs.length > 0) {
            let next = self.dat.dialogs[self.dat.dialogs.length - 1];
            self.sh(next.id, null, true);
        } else {
            $('#dialogs').hide();
            $('#dialog_mask').hide();
        }
    };

    this.sh = function (id, fdone, callshown = false) {

        for (var l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            if (self.dat.dialogs[l1].id !== id) {
                self.eform(self.dat.dialogs[l1].id).hide();
            }
        }

        if (id === -1) {
            if (isFunc(fdone)) {
                fdone();
            }
        }
        else {
            var fr = self.eform(id);
            if (fr.length > 0) {
                fr.fadeIn(200, function () {
                    if (isFunc(fdone)) {
                        fdone();
                    }

                    if (callshown) {
                        let dialog = self.get(id);
                        dialog.instance.shown(false);
                    }
                });
            }
        }
    };

    this.notify = function (action, pars) {
        for (let l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            let dialog = self.dat.dialogs[l1];

            dialog.instance.notify(action, pars);
        }
    };

    this.get = function (id) {
        for (var l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            if (self.dat.dialogs[l1].id === id) {
                return self.dat.dialogs[l1];
            }
        }
        return null;
    };

    this.index = function (id) {
        for (var l1 = 0; l1 < self.dat.dialogs.length; l1++) {
            if (self.dat.dialogs[l1].id === id) {
                return l1;
            }
        }
        return -1;
    };

    this.exists = function (id) {
        return self.get(id) === null ? false : true;
    };

    this.eform = function (id) {
        return RuleBase.eform(self.idform, id);
    };
}