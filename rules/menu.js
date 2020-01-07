﻿function RuleMenu() {
    var self = this;

    this.document_ready = function () {
        self.forms = [];
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

    this.agregarform = function (idform, nombre, imagen = null) {

        var opcion = {
            menu: "menuop_" + idform,
            idform: idform,
            nombre: nombre,
            imagen: imagen
        };
        self.forms.push(opcion);

        // Lo agregamos al frontend
        if (self.forms.length === 1) {
            $("#menu section").append("<h1 id='menu_opcion_tarea' style='border-bottom: #067b90 solid 1px'></h1>");
        }

        if (imagen === null) {
            var h = '<p id="' + opcion.menu + '" >' + nombre + '</p>';
            $("#menu section").append(h);
        } else {
            var h1 = '<p id="' + opcion.menu + '" ><i class="' + imagen + '"></i>' + nombre + '</p>';
            $("#menu section").append(h1);
        }

        self.eform(opcion.menu).on("click", { idform: idform }, function () {
            self.mclick('form', idform);
        });
    };

    this.borrarform = function (idform) {
        
        for (var l1 = 0; l1 < self.forms.length; l1++) {
            var form = self.forms[l1];
            if (form.idform === idform) {
                self.forms.splice(l1, 1);

                self.eform(form.menu).remove();
                break;
            }
        }

        if (self.forms.length === 0) {
            $("#menu_opcion_tarea").remove();
        }
    };

    this.preparar = function (opciones, padre = null) {

        var ops = [];
        var opcis = isUndefinedOrEmpty(opciones) ? app.dat.menu.opciones : opciones;

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
            self.subclick(ops[l11].id);
        }
    };

    this.preparar_op = function (op, padre) {
        var agregar = false;
        var ide = "menuop_" + op.id;

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

            var h = "";

            switch (op.element) {
                case "h1":
                    h += "<h1>" + op.title + "</h1>";
                    $("#menu section").append(h);
                    break;

                case "p":
                    h += '<p id="' + ide + '" title="' + op.title + '">';
                    h += '<i class="' + op.img + '"></i>';
                    h += op.title + '</p>';
                    $("#menu section").append(h);

                    self.eform(ide).on("click", { id: op.id }, function (event) {
                        self.opclick(event.data.id);
                    });
                    break;

                case "s":
                    h += '<div class="sub" id="' + ide + '" title="' + op.title + '" >';
                    h += '<i class="' + op.img + '" style="float: right; margin: 8px; transition: all 0.4s ease-out 0s;"></i>';
                    h += op.title + '</div>';
                    $("#menu section").append(h);

                    self.eform(ide).on("click", { id: op.id }, function (event) {
                        self.subclick(event.data.id);
                    });
                    op.subopciones = 0;
                    self.preparar(op.opciones, op);

                    if (op.subopciones === 0) {
                        $("#" + ide).hide();
                    }
                    break;
            }
        }
    };

    this.subclick = function (id) {
        var op = self.opcion_por_id(id);
        if (op !== null) {
            op.abierto = !op.abierto;
            self.eform("menuop_" + op.id + " i").css("transform", op.abierto ? "rotate(180deg)" : "rotate(0deg)");

            for (var l2 = 0; l2 < op.opciones.length; l2++) {
                var op1 = op.opciones[l2];
                if (op.abierto) {
                    self.eform("menuop_" + op1.id).show();
                } else {
                    self.eform("menuop_" + op1.id).hide();
                }
            }
        }
    };

    this.opcion_por_id = function (id) {
        for (var l1 = 0; l1 < app.dat.menu.opciones.length; l1++) {
            var op = app.dat.menu.opciones[l1];
            if (op.id === id) {
                return op;
            }
            if (op.opciones !== undefined) {
                for (var l2 = 0; l2 < op.opciones.length; l2++) {
                    if (op.opciones[l2].id === id) {
                        return op.opciones[l2];
                    }
                }
            }
        }
        return null;
    };

    this.opcion_por_idform = function (idform) {
        for (var l1 = 0; l1 < app.dat.menu.opciones.length; l1++) {
            var op = app.dat.menu.opciones[l1];
            if (op.idform === idform) {
                return op;
            }
            if (op.opciones !== undefined) {
                for (var l2 = 0; l2 < op.opciones.length; l2++) {
                    if (op.opciones[l2].idform === idform) {
                        return op.opciones[l2];
                    }
                }
            }
        }
        return null;
    };

    this.opclick = function (id) {
        var op = self.opcion_por_id(id);
        if (op !== null) {
            if (op.action !== undefined) {
                callFunc(op.action, op);
            }
            if (op.showform !== undefined) {
                app.forms.open(op.showform, {});
            }
        }

        if (window.matchMedia("(max-width: 800px)").matches) {
            self.hide_ham();
        }
    };

    this.form_mostrado = function (idform) {

        var form = self.getform(idform);
        if (form !== null) {
            $("section p").removeClass("sel");
            self.eform(form.menu).addClass("sel");
        } else {
            // Buscamos entre las opciones de menu. EVALUAR!!
            $("section p").removeClass("sel");

            for (let l1 = 0; l1 < app.forms.forms.length; l1++) {
                let form = app.forms.forms[l1];
                if (form.id === idform) {
                    for (let l2 = 0; l2 < app.dat.menu.opciones.length; l2++) {
                        var op = app.dat.menu.opciones[l2];

                        if (form.template.nombre === op.id) {
                            self.eform("menuop_" + op.id).addClass("sel");
                        }
                    }
                }
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
        for (var l1 = 0; l1 < self.forms.length; l1++) {
            var form = self.forms[l1];
            if (form.idform === idform) {
                return form;
            }
        }
        return null;
    };

    // Retorna elementos dentro del form con el ID indicado
    this.eform = function (id) {
        return $('section #' + id);
    };
}