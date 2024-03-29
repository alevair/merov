﻿function RuleMenu() {
    var self = this;

    this.document_ready = function () {
        self.dat = {
            forms: [],
            target: "menu"
        };
        self.hamb_abierto = true;
    };

    this.title = function (id, titulo, imagen) {
        if (imagen === null) {
            imagen = self.eform('menuop_' + id + " i").attr("class");
        }

        var h = (!isUndefinedOrEmpty(imagen) ?  '<i class="' + imagen + '"></i>' : "") + titulo;
        self.eform('menuop_' + id).html(h);
    };

    this.hide = function (id) {
        self.eform('menuop_' + id).hide();
    };

    this.toggle_ham = function () {
        if (self.hamb_abierto) {
            self.hide_ham();
        } else {
            self.show_ham();
        }
    };

    this.show_ham = function () {
        $("#menu").show();
        self.hamb_abierto = true;
    };

    this.hide_ham = function () {
        $("#menu").hide();
        self.hamb_abierto = false;
    };

    this.agregarform = function (idform, nombre, imagen = null, target = null) {

        var opcion = {
            menu: "menuop_" + idform,
            idform: idform,
            nombre: nombre,
            imagen: imagen,
            target: target
        };
        self.dat.forms.push(opcion);

        var tarname = isUndefinedOrEmpty(target) ? "#menu .menu" : target === "config" ? "#menu .config" : "#menu .menu";

        // Lo agregamos al frontend
        if (self.dat.forms.length === 1) {
            $(tarname).append("<h1 id='menu_opcion_tarea' style='border-bottom: #067b90 solid 1px'></h1>");
        }

        if (imagen === null) {
            var h = '<p id="' + opcion.menu + '" >' + nombre + '</p>';
            $(tarname).append(h);
        } else {
            var h1 = '<p id="' + opcion.menu + '" ><i class="' + imagen + '"></i>' + nombre + '</p>';
            $(tarname).append(h1);
        }

        self.selop(opcion.menu);

        self.eform(opcion.menu).on("click", { idform: idform }, function () {
            self.mclick('form', idform);
        });
    };

    this.borrarform = function (idform) {
        
        for (var l1 = 0; l1 < self.dat.forms.length; l1++) {
            var form = self.dat.forms[l1];
            if (form.idform === idform) {
                self.dat.forms.splice(l1, 1);

                self.eform(form.menu).remove();
                break;
            }
        }

        if (self.dat.forms.length === 0) {
            $("#menu_opcion_tarea").remove();
        }
    };

    this.preparar = function (options, padre = null) {

        var ops = [];
        var opcis = isUndefinedOrEmpty(options) ? app.dat.menu.options : options;

        if (isUndefinedOrEmpty(options)) {
            $("#menu .menu").html("");
            $("#menu .config").html("");
        }

        for (var l1 = 0; l1 < opcis.length; l1++) {
            var op = opcis[l1];

            if (op.enable) {
                self.preparar_op(op, padre);

                if (op.element === "s") {
                    ops.push(op);
                }
            }
        }

        for (var l11 = 0; l11 < ops.length; l11++) {
            ops[l11].abierto = !ops[l11].abierto;
            self.subclick(ops[l11].name);
        }
    };

    this.preparar_op = function (op, padre) {
        var agregar = false;
        var ide = "menuop_" + op.name;

        if (op.access !== undefined) {
            var access = op.access.split(" ");

            for (var l1 = 0; l1 < access.length; l1++) {
                for (var l2 = 0; l2 < app.global.accesos.length; l2++) {
                    if (access[l1] === app.global.accesos[l2] || access[l1] === "ALL") {
                        agregar = true;
                        break;
                    }
                }
            }
        }
        if (op.rolprincipal !== undefined) {

            var excluir = op.rolprincipal.substr(0, 1) === "!";
            var rolp = op.rolprincipal.replace("!", "");

            if (excluir) {
                if (rolp === app.global.usuario.RolPrincipal) {
                    agregar = false;
                }
            } else {
                if (rolp !== app.global.usuario.RolPrincipal) {
                    agregar = false;
                }
            }
        }

        if (agregar) {
            if (padre !== null) {
                padre.subopciones++;
            }

            var target = isUndefinedOrEmpty(op.target) ? "#menu .menu" : op.target === "config" ? "#menu .config" : "#menu .menu";

            var h = "";
            var text = isUndefinedOrEmpty(op.text) ? isUndefinedOrEmpty(op.title) ? "" : op.title : op.text;

            switch (op.element) {
                case "h1":
                    h += "<h1>" + text + "</h1>";
                    $(target).append(h);
                    break;

                case "h2":
                    h += "<h2>" + text + "</h2>";
                    $(target).append(h);
                    break;

                case "div":
                    h += '<h1 style="border-bottom: #067b90 solid 1px;margin-bottom: 10px;"></h1>';
                    $(target).append(h);
                    break;

                case "p":
                    h += '<p id="' + ide + '" title="' + op.title + '">';
                    h += '<i class="' + op.icon + '"></i>';
                    h += text + '</p>';
                    $(target).append(h);

                    self.eform(ide).on("click", { name: op.name }, function (event) {
                        self.opclick(event.data.name);
                    });
                    break;

                case "s":
                    h += '<div class="sub" id="' + ide + '" title="' + op.title + '" >';
                    h += '<i class="' + op.icon + '" style="float: right; margin: 8px; transition: all 0.4s ease-out 0s;"></i>';
                    h += text + '</div>';
                    $(target).append(h);

                    self.eform(ide).on("click", { name: op.name }, function (event) {
                        self.subclick(event.data.name);
                    });
                    op.subopciones = 0;
                    if (op.options !== null && op.options.length > 0) {
                        self.preparar(op.options, op);
                    }

                    if (op.subopciones === 0) {
                        $("#" + ide).hide();
                    }
                    break;
            }
        }
    };

    this.subclick = function (name) {
        var op = self.opcion_por_name(name);
        if (op !== null) {
            op.abierto = !op.abierto;
            self.eform("menuop_" + op.name + " i").css("transform", op.abierto ? "rotate(180deg)" : "rotate(0deg)");

            if(op.options) {
                for (var l2 = 0; l2 < op.options.length; l2++) {
                    var op1 = op.options[l2];
                    if (op.abierto) {
                        self.eform("menuop_" + op1.name).show();
                    } else {
                        self.eform("menuop_" + op1.name).hide();
                    }
                }    
            }
        }
    };

    this.togglemenu = function () {

        if (self.dat.target === "menu") {
            $("#menu .menu").hide();
            $("#menu .config").fadeIn(100);
            self.dat.target = "config";
        } else {
            $("#menu .menu").fadeIn(100);
            $("#menu .config").hide();
            self.dat.target = "menu";
        }
    };

    this.opcion_por_name = function (name) {
        for (var l1 = 0; l1 < app.dat.menu.options.length; l1++) {
            var op = app.dat.menu.options[l1];
            if (op.name === name) {
                return op;
            }
            if (op.options !== undefined) {
                for (var l2 = 0; l2 < op.options.length; l2++) {
                    if (op.options[l2].name === name) {
                        return op.options[l2];
                    }
                }
            }
        }
        return null;
    };

    this.opcion_por_idform = function (idform) {
        for (var l1 = 0; l1 < app.dat.menu.options.length; l1++) {
            var op = app.dat.menu.options[l1];
            if (op.idform === idform) {
                return op;
            }
            if (op.options !== undefined) {
                for (var l2 = 0; l2 < op.options.length; l2++) {
                    if (op.options[l2].idform === idform) {
                        return op.options[l2];
                    }
                }
            }
        }
        return null;
    };

    this.opclick = function (name) {

        var op = self.opcion_por_name(name);
        if (op !== null) {
            if (op.action !== undefined) {
                callFunc(op.action, op);
            }
            if (op.showform !== undefined) {
                app.forms.open(op.showform, { menu: name});
            }
        }

        if (op.select === true) {
            self.selop("menuop_" + name);
        }
        if (window.matchMedia("(max-width: 800px)").matches) {
            self.hide_ham();
        }
    };

    this.selop = function (name) {

        self.deselops();

        if (name !== null) {
            self.eform(name).addClass("sel");
        }
    };

    this.deselops = function () {
        for (let l1 = 0; l1 < app.dat.menu.options.length; l1++) {
            let op = app.dat.menu.options[l1];
            let ide = "menuop_" + op.name;
            self.eform(ide).removeClass("sel");

            if (op.element === 's') {
                if(op.options) {
                    for (let l2 = 0; l2 < op.options.length; l2++) {
                        let sop = op.options[l2];
                        let ide = "menuop_" + sop.name;
                        self.eform(ide).removeClass("sel");
                    }    
                }
            }
        }
        for (let l1 = 0; l1 < self.dat.forms.length; l1++) {
            let form = self.dat.forms[l1];
            self.eform(form.menu).removeClass("sel");
        }
    };

    this.form_mostrado = function (idform) {
        let form = app.forms.get(idform).instance;

        if (form.pars.menu !== undefined) {
            self.selop("menuop_" + form.pars.menu);
        } else {
            let frm = self.getform(idform);

            if (frm !== null) {
                self.selop(frm.menu);
            } else {
                self.deselops();
            }
        }
    };

    this.mclick = function (menu, opcion) {
        switch (menu) {
            case "form":
                app.forms.sh(opcion);
                break;
        }
        if (window.matchMedia("(max-width: 800px)").matches) {
            self.hide_ham();
        }
    };

    this.getform = function (idform) {
        for (var l1 = 0; l1 < self.dat.forms.length; l1++) {
            var form = self.dat.forms[l1];
            if (form.idform === idform) {
                return form;
            }
        }
        return null;
    };

    // Retorna elementos dentro del form con el ID indicado
    this.eform = function (id) {
        //return $('section #' + id);
        return $('#menu #' + id);
    };
}