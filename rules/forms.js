﻿function RuleForms() {
    var self = this;

    this.document_ready = function () {
        self.unique = 0;
        self.forms = [];
        self.idform = "forms_contenedor";
        self.idrpan = "rpan_contenedor";
    };

    // Inicia un nuevo formulario, o abre uno existente
    this.open = function (formname, pars, fdone) {

        if (pars === null || pars === undefined) {
            app.dbox.error.sh("No especifico parametros", formname);
            return;
        }

        // Buscamos el template del form
        var template = app.dat.forms.get(formname);
        if (template === null) {
            app.dbox.error.sh("Form no encontrado", formname);
            if (isFunc(fdone)) {
                callFunc(fdone, null);
            }
            return;
        }

        // Chequeamos que tengan permisos para acceder al formulario
        var salir = true;
        if (template.access !== undefined) {
            var access = template.access.split(" ");

            for (var l11 = 0; l11 < access.length; l11++) {
                for (var l2 = 0; l2 < app.global.accesos.length; l2++) {
                    if (access[l11] === app.global.accesos[l2] || access[l11].toUpperCase() === "ALL") {
                        salir = false;
                        break;
                    }
                }
            }
        }

        if (salir) {
            app.dbox.error.sh("Error de acceso", "No tiene permisos para acceder a esta función: " + formname);
            if (isFunc(fdone)) {
                callFunc(fdone, null);
            }
            return;
        }

        // Establecemos el id del formulario
        var idform = "form_" + template.nombre;
        if (template.instancia === "multiple") {
            if (pars.id > 0) {
                idform = "form_" + template.nombre + "_" + pars.id;
            } else {
                pars.id = -1;
                idform = "form_" + template.nombre + "_n" + self.unique++;
            }
        }
        var prev = self.get(idform);
        if (prev !== null) {
            self.sh(idform, function () {
                prev.instance.shown(false);
                if (isFunc(fdone)) {
                    callFunc(fdone, null);
                }
                //self.notify("form.shown", { idform: idform, instance: prev.instance });
            });
            return;
        }

        // Cargamos el id del formulario entre los parametros
        //pars.idform = idform;
        var instance = newFunc(template.clase, pars);
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
                app.forms.close(instance.idform, instance.pars.backform, null);
            };
        }
        if (instance.enable === undefined) {
            instance.enable = function (valor) {
                app.forms.enable(instance.idform, valor);
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
            visible: false,
            target: pars.target === undefined ? "forms" : pars.target
        };
        self.forms.push(form);

        if (template.instancia === "unica") {
            if (template.global !== undefined) {
                app[template.global] = instance;
            }
        }

        self.loading(form.target, function () {

            ioaux.load_html(template.package.base + template.html + "?ver=" + app.settings.ver, function (html) {

                if (template.menu === "mostrar") {
                    app.menu.agregarform(form.id, template.titulo, template.img);
                }

                let clas = template.cssclass !== undefined ? template.cssclass : "form_panel";

                /* style="display:none" */
                var h = '<div class="' + clas + '" id="' + idform + '">' + html + '</div>';
                self.eform(form.target, null).append(h);

                h = '<div id="' + idform + '_mask" class="form_mask"></div>';
                self.eform(form.target, idform).append(h);

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
    };

    this.notify = function (action, pars) {


        for (let l1 = 0; l1 < self.forms.length; l1++) {
            let form = self.forms[l1];

            if (isFunc(form.instance.notify)) {
                form.instance.notify(action, pars);
            }
        }

        for (let l1 = 0; l1 < app.rules.length; l1++) {
            let rule = app.rules[l1];

            if (rule !== self) {
                if (isFunc(rule.notify)) {
                    rule.notify(action, pars);
                }
            }
        }
    };

    this.enable = function (id, val) {
        var frm = self.get(id);

        if (frm !== null) {
            if (val) {
                self.eform(frm.target, frm.id + "_mask").fadeOut(200);
            } else {
                self.eform(frm.target, frm.id + "_mask").fadeIn(200);
            }
        }
    };

    this.destroy = function (id) {

        var frm = self.get(id);

        var element = self.eform(frm.target, "> #" + id);
        if (element.length > 0) {
            element.remove();
        }

        for (var l1 = 0; l1 < self.forms.length; l1++) {
            if (self.forms[l1].id === id) {
                var form = self.forms[l1];

                self.forms.splice(l1, 1);
                if (form.template.menu === "mostrar") {
                    app.menu.borrarform(form.id);
                }

                break;
            }
        }
    };

    this.close = function (id, backform, backformalternative) {

        var form = self.get(id);

        self.destroy(id);

        self.notify("form.closed", { idform: id, instance: form.instance });

        if (self.exists(backform, form.target)) {
            self.sh(backform);
            return backform;
        } else {
            if (self.exists(backformalternative, form.target)) {
                self.sh(backformalternative);
                return backformalternative;
            } else {
                var name = form.target === "forms" ? "form_homeusuario" : "form_preview";
                if (!self.exists(name)) {
                    name = null;
                    for (let l1 = 0; l1 < self.forms.length; l1++) {
                        if (self.forms[l1].target === form.target) {
                            name = self.forms[l1].id;
                            break;
                        }
                    }
                }
                if (name !== null) {
                    self.sh(name);
                }
                return name;
            }
        }
    };

    this.loading = function (target, fdone) {
        for (let l1 = 0; l1 < self.forms.length; l1++) {
            let frm = self.forms[l1];
            self.eform(target, frm.id).hide();
        }

        self.eform(target, "form_cargando").fadeIn(100, function () {
            if (isFunc(fdone)) {
                fdone();
            }
        });
    };

    this.sh = function (id, fdone) {

        var target = "forms";

        for (let l1 = 0; l1 < self.forms.length; l1++) {
            if (self.forms[l1].id === id) {
                target = self.forms[l1].target;
                break;
            }
        }

        for (let l1 = 0; l1 < self.forms.length; l1++) {
            let frm = self.forms[l1];
            if (frm.id !== id) {
                self.eform(target, frm.id).hide();
            }
        }

        self.eform(target, "form_cargando").hide();

        var fr = self.eform(target, id);
        if (fr.length > 0) {
            fr.fadeIn(200, function () {
                if (isFunc(fdone)) {
                    fdone();
                }

                let form = self.get(id);
                self.notify("form.shown", { idform: id, instance: form.instance });
            });
            app.menu.form_mostrado(id);
        }
    };

    this.get = function (id) {
        for (var l1 = 0; l1 < self.forms.length; l1++) {
            if (self.forms[l1].id === id) {
                return self.forms[l1];
            }
        }
        return null;
    };

    this.index = function (id) {
        for (var l1 = 0; l1 < self.forms.length; l1++) {
            if (self.forms[l1].id === id) {
                return l1;
            }
        }
        return -1;
    };

    this.exists = function (id, target) {
        let form = self.get(id);
        if (isUndefinedOrEmpty(target)) {
            return form !== null;
        } else {
            return form === null ? false : form.target === target ? true: false;
        }
    };

    this.eform = function (target, id) {
        var idform = self.idform;

        switch (target) {
            case "rpan":
                idform = self.idrpan;
                break;
        }

        return RuleBase.eform(idform, id);
    };
}