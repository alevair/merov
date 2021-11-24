function RuleForms() {
    var self = this;

    this.document_ready = function () {
        self.idform = "forms_contenedor";
        self.idrpan = "rpan_contenedor";

        self.dat = {
            order: [],
            forms: [],
            unique: 0,
            targets: [
                {
                    name: "forms",
                    cont: "forms_contenedor",
                    backform: "form_homeusuario"
                },
                {
                    name: "rpan",
                    cont: "rpan_contenedor",
                    backform: "form_preview"
                },
                {
                    name: "lpan",
                    cont: "menu",
                    backform: "form_menu"
                }
            ]
        };
    };

    this.setorder = (idform) => {
        let form = self.get(idform);
        if(form) {
            if(form.target === "forms") {
                self.delorder(idform);
                self.dat.order.push(idform);    
            }    
        }
    }

    this.delorder = (idform) => {
        const index = self.dat.order.findIndex(elem => elem === idform);
        if(index > -1) {
            self.dat.order.splice(index, 1);
        }
    }

    this.getorder = () => {

        do {
            let id = self.dat.order[self.dat.order.length - 1];
            let form = self.get(id);
            if(form) {
                return id;
            } 
            self.dat.order.splice(self.dat.order.length - 1, 1);

        } while(self.dat.order.length > 0);

        return self.dat.forms[self.dat.forms.length - 1].id;
    }

    // Inicia un nuevo formulario, o abre uno existente
    this.open = function (formname, pars, fdone) {

        if (pars === null || pars === undefined) {
            app.dbox.error.dialog({ title: "No especifico parametros", text: formname });
            return;
        }

        // Buscamos el template del form
        var template = app.dat.forms.get({ name: formname });
        if (template === null) {
            app.dbox.error.dialog({ title: "Form no encontrado", text: formname })
            .then(() => {
                if (isFunc(fdone)) {
                    callFunc(fdone, null);
                }
                return;    
            }).catch();
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
            app.dbox.error.dialog({ title: "Form no encontrado", text: formname })
            .then(() => {
                app.dbox.error.sh("Error de acceso", "No tiene permisos para acceder a esta función: " + formname);
                if (isFunc(fdone)) {
                    callFunc(fdone, null);
                }
                return;    
            }).catch();
        }

        // Establecemos el id del formulario
        var idform = "form_" + template.name;
        if (template.instance === "multiple") {
            if (pars.id > 0) {
                idform = "form_" + template.name + "_" + pars.id;
            } else {
                pars.id = -1;
                idform = "form_" + template.name + "_n" + self.dat.unique++;
            }
        }
        var prev = self.get(idform);
        if (prev !== null) {
            self.sh(idform, function () {
                prev.instance.shown(false, pars);
                if (isFunc(fdone)) {
                    callFunc(fdone, null);
                }
                //self.notify("form.shown", { idform: idform, instance: prev.instance });
            });
            return;
        }

        // Cargamos el id del formulario entre los parametros
        //pars.idform = idform;
        var instance = newFunc(template.class, pars);
        instance.pars = pars;
        instance.idform = idform;
        instance.pars.tem = template;

        // Agregamos el manejador de controles del formulario
        instance.controls = new FormControls(instance);

        // Agregamos el manejador de paneles del formulario
        instance.panels = new FormPanels(instance);

        // Llamamos al constructor
        if (instance.init !== undefined) {
            instance.init();
        }

        // Agregamos algunos metodos basicos, si es que no estan agregados en la clase
        if (instance.prepare === undefined) {
            instance.prepare = () => { };
        }
        if (instance.shown === undefined) {
            instance.shown =  () => { };
        }
        if (instance.notify === undefined) {
            instance.notify = (action, pars) => { };
        }
        if (instance.eform === undefined) {
            instance.eform = (id) => {
                return RuleBase.eform(instance.idform, id);
            };
        }
        if (instance.setvars === undefined) {
            instance.setvars = (vars, prep, post) => {
                RuleBase.setvars(instance.idform, vars, prep, post);
            };
        }
        if (instance.getvars === undefined) {
            instance.getvars = (vars, prep, post) => {
                return RuleBase.getvars(instance.idform, vars, prep, post);
            };
        }
        if (instance.close === undefined) {
            instance.close = () => {
                app.forms.close(instance.idform, instance.pars.backform, null);
            };
        }
        if (instance.enable === undefined) {
            instance.enable = (valor, message) => {
                app.forms.enable(instance.idform, valor, message);
            };
        }

        if (instance.cons === undefined) {
            instance.cons = {};
        }

        if (instance.dat === undefined) {
            instance.dat = {};
        }

        if(instance.send === undefined) {
            instance.send = (action, pars) => {
                self.notify(action, pars);
            };
        }

        if(instance.ld === undefined) {
            instance.ld = () => {
                return new Promise((resolve, rejected) => {
                    resolve();
                });    
            }
        }

        var form = {
            id: idform,
            template: template,
            instance: instance,
            visible: false,
            target: pars.target === undefined ? "forms" : pars.target
        };
        self.dat.forms.push(form);

        var container = self.get(pars.container);
        if (container !== null) {
            container.dialog = idform;
            form.container = container.id;
        }

        if (template.instance === "unica") {
            if (template.global !== undefined) {
                app[template.global] = instance;
            }
        }

        self.loading(form.target, function () {

            let base = template.package !== undefined ? template.package.base : "";

            ioaux.load_html(base + template.html + "?ver=" + app.settings.ver, function (html) {

                if (template.menu === "mostrar" && container === null) {
                    app.menu.agregarform(form.id, template.title, template.img, isUndefinedOrEmpty(template.menu_target) ? null : template.menu_target );
                }

                let clas = template.cssclass !== undefined ? template.cssclass : "form_panel";

                var h = '<div class="' + clas + '" id="' + idform + '">' + html + '</div>';
                self.eform(form.target, null).append(h);

                let th = $('#control-formmask').html();
                h = Mustache.render(th, { idform: idform });
                self.eform(form.target, idform).append(h);


                //h = '<div id="' + idform + '_mask" class="form_mask"></div>';

                /*
  <div>
  <div style="text-align: center;margin: 40px;">Guardando documento...</div>
  <div class="sbl-circ-ripple"></div>
  </div>
                 */
                //self.eform(form.target, idform).append(h);


                // var h = $('#' + self.pars.def.template).html();

                // Si la definicion tiene controles, los agregamos
                if (template.controls !== undefined) {
                    if (Array.isArray(template.controls)) {
                        instance.controls.add(template.controls);
                    }
                }

                instance.prepare();
                self.sh(idform, function () {

                    instance.ld()
                    .then(() => {

                        instance.enable(pars.enable === undefined ? true : pars.enable);

                        instance.shown(true, null);
    
                        if (isFunc(fdone)) {
                            callFunc(fdone, null);
                        }    

                    })
                    .catch((err) => {
                        app.dbox.error.dialog({ title: "Error al iniciar formulario", text: err })
                        .then(() => {
                            instance.close();
                        }).catch();
                    });

                    //self.notify("form.shown", { idform: idform, instance: instance });
                });
            });
        });
    };

    this.notify = function (action, pars) {

        for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
            let form = self.dat.forms[l1];
            form.instance.notify(action, pars);
        }
    };

    this.enable = function (id, val, message) {
        var frm = self.get(id);

        if (frm !== null) {
            if (val) {
                self.eform(frm.target, frm.id + "_mask").fadeOut(100);
            } else {
                self.eform(frm.target, frm.id + "_mask").show(); // .fadeIn(100);
                if (message !== undefined) {
                    self.eform(frm.target, frm.id + "_masktext").html(message);
                    self.eform(frm.target, frm.id + "_maskinfo").show();
                } else {
                    self.eform(frm.target, frm.id + "_maskinfo").hide();
                }
            }
        }
    };

    this.destroy = function (id) {

        var frm = self.get(id);

        var element = self.eform(frm.target, "> #" + id);
        if (element.length > 0) {
            element.remove();
        }

        for (var l1 = 0; l1 < self.dat.forms.length; l1++) {
            if (self.dat.forms[l1].id === id) {
                var form = self.dat.forms[l1];

                self.dat.forms.splice(l1, 1);
                if (form.template.menu === "mostrar") {
                    app.menu.borrarform(form.id);
                }

                break;
            }
        }
    };

    this.close = function (id, backform, backformalternative) {

        var form = self.get(id);

        if (!isUndefinedOrEmpty(form.container)) {
            backform = form.container;
            var cont = self.get(form.container);
            delete cont.dialog;
        }

        self.destroy(id);

        app.notify.send("form.closed", { idform: id, instance: form.instance });

        self.delorder(id);

        let next = self.getorder();
        if(backform) {
            let back = self.get(backform);
            if(back) {
                next = backform;
            }
        }

        self.sh(next, null, true);

        return;

        if (self.exists(backform, form.target)) {
            self.sh(backform, null, true);
            return backform;
        } else {
            if (self.exists(backformalternative, form.target)) {
                self.sh(backformalternative, null, true);
                return backformalternative;
            } else {
                var name = self.gettarget(form.target).backform; // === "forms" ? "form_homeusuario" : "form_preview";
                if (!self.exists(name)) {
                    name = null;
                    for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
                        if (self.dat.forms[l1].target === form.target) {
                            name = self.dat.forms[l1].id;
                            break;
                        }
                    }
                }
                if (name !== null) {
                    self.sh(name, null, true);
                }
                return name;
            }
        }
    };

    this.loading = function (target, fdone) {
        for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
            let frm = self.dat.forms[l1];
            self.eform(target, frm.id).hide();
        }

        self.eform(target, "form_cargando").fadeIn(100, function () {
            if (isFunc(fdone)) {
                fdone();
            }
        });
    };

    this.sh = function (id, fdone, callshown = false) {

        var target = "forms";

        for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
            if (self.dat.forms[l1].id === id) {
                target = self.dat.forms[l1].target;
                break;
            }
        }

        for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
            let frm = self.dat.forms[l1];
            if (frm.id !== id) {
                self.eform(target, frm.id).hide();
            }
        }

        self.eform(target, "form_cargando").hide();


        let form = self.get(id);
        if(form){
            if (!isUndefinedOrEmpty(form.dialog)) {
                id = form.dialog;
                form = self.get(id);
    
                if (!isUndefinedOrEmpty(form.dialog)) {
                    id = form.dialog;
                }
            }    
        }

        var fr = self.eform(target, id);
        if (fr.length > 0) {
            fr.fadeIn(100, function () {
                if (isFunc(fdone)) {
                    fdone();
                }

                let form = self.get(id);
                app.notify.send("form.shown", { idform: id, instance: form.instance });

                if (callshown) {
                    form.instance.shown(false);
                }
            });
            app.menu.form_mostrado(id);
        }

        self.setorder(id);
    };

    this.get = function (id) {
        for (var l1 = 0; l1 < self.dat.forms.length; l1++) {
            if (self.dat.forms[l1].id === id) {
                return self.dat.forms[l1];
            }
        }
        return null;
    };

    this.index = function (id) {
        for (var l1 = 0; l1 < self.dat.forms.length; l1++) {
            if (self.dat.forms[l1].id === id) {
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

    this.gettarget = function (name) {
        for (let l1 = 0; l1 < self.dat.targets.length; l1++) {
            let tar = self.dat.targets[l1];

            if (tar.name === name) {
                return tar;
            }
        }
        return null;
    };

    this.eform = function (target, id) {
        /*
        var idform = self.idform;

        switch (target) {
            case "rpan":
                idform = self.idrpan;
                break;
        }
        */
        let idform = self.gettarget(isUndefinedOrEmpty(target) ? "forms" : target).cont;

        return RuleBase.eform(idform, id);
    };
}