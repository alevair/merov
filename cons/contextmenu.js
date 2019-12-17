function ContextMenu(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {

        let ide = ioaux.setOrDefault(self.pars.idelem, self.pars.ide);

        self.dat = {
            idpop: ide + "_popcontext",
            popopen: false,
            mousein: false,
            mousepopin: false,
            idext: null,
            data : null
        };

        self.mousein = false;
        self.mousepopin = false;

        self.pars.ops = ioaux.setOrDefault(self.pars.ops, []);


        self.eform(ide).on("click", function (e) {

            e.cancelBubble = true;
            e.stopPropagation();

            if (self.dat.popopen) {
                self.pop_cerrar("cerrar");
            } else {
                self.pop_abrir();
            }
        });

        self.eform(ide).on("mouseenter", function () {
            self.mousein = true;
        });

        self.eform(ide).on("mouseleave", function () {
            self.mousein = false;

            setTimeout(function () {
                if (!self.mousepopin && !self.mousein) {
                    self.pop_cerrar("cerrar");
                }
            }, 200);
        });
    };

    this.render = function (apply) {

    };

    this.data = function (data) {
        self.dat.data = data;
    };

    this.options = function (options) {
        self.pars.ops = options;
    };

    this.sels = function (sels) {
        self.pars.sels = sels;
    };

    // En el caso de abrir un contextual sobre un elemento dinamico
    // se debe agregar este elemento para que se cierre si se abandona el mismo
    // Luego de cerrar el pop se debe elimitar el evento
    this.pop_abrir = function (idelem) {

        if (idelem !== undefined) {
            self.dat.idext = idelem;
        } else {
            idelem = self.pars.idelem;
            self.dat.idext = null;
        }

        let rect = self.eform(idelem).get(0).getBoundingClientRect();

        let w = 240;
        if (!isUndefinedOrEmpty(self.pars.ancho)) {
            w = self.pars.ancho;
        }
        let x = self.pars.align === "right" ? rect.right - w : rect.left;

        if (isFunc(self.pars.onopen)) {
            self.pars.onopen(self);
        }

        var h = $('#' + self.pars.def.template).html();

        let dat = {
            id: self.dat.idpop,
            style: 'left:' + x + 'px; top:' + rect.bottom + 'px; width:' + w + 'px',
            options: []
        };

        for (let l1 = 0; l1 < self.pars.ops.length; l1++) {
            let op = self.pars.ops[l1];

            let sel = false;
            if (!isUndefinedOrEmpty(self.pars.sels)) {
                for (let l3 = 0; l3 < self.pars.sels.length; l3++) {
                    var idx = self.pars.sels[l3];
                    if (idx === l1) {
                        sel = true;
                        break;
                    }
                }
            }

            dat.options.push({
                ide: "item_" + l1,
                title: self.pars.ops[l1].replace("#",""),
                sel: sel,
                sep: op === "<SEP>",
                titulo: op.charAt(0) === "#"
            });
        }

        var res = Mustache.render(h, dat);

        self.eform(null).append(res);

        for (let l1 = 0; l1 < dat.options.length; l1++) {
            let op = dat.options[l1];

            self.epop(op.ide).on("click", { idx: l1 }, function (e) {
                self.pop_cerrar("sel", e.data.idx);
            });
        }

        self.eform(self.dat.idpop).fadeIn(0, function () {
            self.dat.popopen = true;
        });

        self.eform(self.dat.idpop).on("mouseenter", function () {
            self.mousepopin = true;
        });

        self.eform(self.dat.idpop).on("mouseleave", function () {
            self.mousepopin = false;

            setTimeout(function () {
                if (!self.mousepopin && !self.mousein) {
                    self.pop_cerrar("cerrar");
                }
            }, 200);
        });
        if (self.dat.idext !== null) {
            self.mousein = true;

            self.eform(self.dat.idext).on("mouseleave", function () {
                self.mousein = false;

                setTimeout(function () {
                    if (!self.mousepopin && !self.mousein) {
                        self.pop_cerrar("cerrar");
                    }
                }, 200);
            });
        }
    };

    this.pop_cerrar = function (accion, indice) {
        self.dat.popopen = false;

        self.eform(self.dat.idpop).fadeOut(0, function () {
            if (self.dat.idext !== null) {
                self.eform(self.dat.idext).off("mouseleave");
            }
            self.eform(self.dat.idpop).remove();

            switch (accion) {
                case "sel":
                    self.pars.onselect(self, indice);
                    break;

                case "cerrar":
                    break;
            }
        });
    };

    this.epop = function (id) {
        return self.eform(self.dat.idpop + " #" + id);
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}
