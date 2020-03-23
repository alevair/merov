function RuleFulls() {
    var self = this;

    this.document_ready = function() {
        self.dat = {
            fulls: []

        };
        self.unique = 0;
        self.idform = "fulls";
    };

    this.open = function (formname, pars, fdone) {

        if (pars === undefined || pars === null) {
            pars = {
                id: -1
            };
        }

        // Buscamos el template del form
        var template = app.dat.fulls.get({ name: formname });
        if (template === null) {
            app.dbox.error.sh("Full no encontrado", formname);
            if (isFunc(fdone)) {
                callFunc(fdone, null);
            }
            return;
        }

        // Establecemos el id del full
        var idform = "full_" + template.name;
        if (template.instance === "multiple") {
            if (pars.id > 0) {
                idform = "form_" + template.name + "_" + pars.id;
            } else {
                pars.id = -1;
                idform = "form_" + template.name + "_n" + self.unique++;
            }
        }
        var prev = self.get(idform);
        if (prev !== null) {
            self.sh(idform, function () {
                prev.instance.shown(true);
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
        instance.init();

        // Agregamos algunos metodos basicos, si es que no estan agregados en la clase
        if (instance.prepare === undefined) {
            instance.prepare = function () { };
        }
        if (instance.shown === undefined) {
            instance.shown = function () { };
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
                app.fulls.close(instance.idform, instance.pars.backform, null);
            };
        }
        if (instance.enable === undefined) {
            instance.enable = function (valor) {
                app.fulls.enable(instance.idform, valor);
            };
        }
        if (instance.cons === undefined) {
            instance.cons = {};
        }
        if (instance.dat === undefined) {
            instance.dat = {};
        }

        var form = {
            id: idform,
            template: template,
            instance: instance,
            visible: false
        };
        self.dat.fulls.push(form);

        if (template.instance === "unica") {
            if (template.global !== undefined) {
                app[template.global] = instance;
            }
        }

        self.loading(function () {

            ioaux.load_html(template.package.base + template.html + "?ver=" + app.settings.ver, function (html) {

                /* style="display:none" */
                var h = '<div class="full_panel" id="' + idform + '">' + html + '</div>';
                self.eform(null).append(h);

                h = '<div id="' + idform + '_mask" class="form_mask"></div>';
                self.eform(idform).append(h);

                instance.prepare();
                self.sh(idform, function () {
                    instance.shown(true);

                    instance.enable(pars.enable === undefined ? true : pars.enable);
                    if (isFunc(fdone)) {
                        callFunc(fdone, null);
                    }
                    //self.notify("form.shown", { idform: idform, instance: instance });
                });
            });


        });


        return;


        self.sh(-1, function () {

            //return;
            ioaux.load_html(template.package.base + template.html, function (html) {

                if (template.menu === "mostrar") {
                    app.menu.agregarform(form.id, template.titulo, template.img);
                }

                var h = '<div class="full_panel" id="' + idform + '" style="display:none">' + html + '</div>';
                self.eform().append(h);

                instance.prepare();
                self.sh(idform, function () {
                    instance.shown(true);
                    if (isFunc(fdone)) {
                        callFunc(fdone, null);
                    }
                });
            });
        });
    };

    this.loading = function (fdone) {
        for (let l1 = 0; l1 < self.dat.fulls.length; l1++) {
            let frm = self.dat.fulls[l1];
            self.eform(frm.id).hide();
        }

        //self.eform("full_loading").fadeIn(100, function () {
            if (isFunc(fdone)) {
                fdone();
            }
        //});
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

        for (var l1 = 0; l1 < self.dat.fulls.length; l1++) {
            if (self.dat.fulls[l1].id === id) {
                var form = self.dat.fulls[l1];

                self.dat.fulls.splice(l1, 1);
                if (form.template.menu === "mostrar") {
                    app.menu.borrarform(form.id);
                }

                break;
            }
        }
    };

    this.clear = function () {
        self.dat.fulls = [];
        self.eform().html("");
    };

    this.close = function (id, backform, backformalternative) {

        self.destroy(id);

        if (self.exists(backform)) {
            self.sh(backform);
            return backform;
        } else {
            if (self.exists(backformalternative)) {
                self.sh(backformalternative);
                return backformalternative;
            } else {
                self.sh("homeusuario");
                return "homeusuario";
            }
        }
    };


    this.sh = function (id, fdone) {

        for (var l1 = 0; l1 < self.dat.fulls.length; l1++) {
            if (self.dat.fulls[l1].id !== id) {
                self.eform(self.dat.fulls[l1].id).hide();
            }
        }

        //self.eform("full_loading").hide();

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
                });
                //app.menu.form_mostrado(id);
            }
        }
    };

    this.notify = function(action, pars) {
        for (let l1 = 0; l1 < self.dat.fulls.length; l1++) {
            let full = self.dat.fulls[l1];

            if (isFunc(full.instance.notify)) {
                full.instance.notify(action, pars);
            }
        }
    };

    /*
    this.show = function (id) {

        for (var l1 = 0; l1 < self.fulls.length; l1++) {
            var full = self.fulls[l1];

            if (id !== full.id) {
                self.eform(full.id).hide();
            }
        }

        self.eform(id).fadeIn(300);

        app.menu.form_mostrado(id);
    };
    */

    this.get = function (id) {
        for (var l1 = 0; l1 < self.dat.fulls.length; l1++) {
            if (self.dat.fulls[l1].id === id) {
                return self.dat.fulls[l1];
            }
        }
        return null;
    };

    this.index = function (id) {
        for (var l1 = 0; l1 < self.dat.fulls.length; l1++) {
            if (self.dat.fulls[l1].id === id) {
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