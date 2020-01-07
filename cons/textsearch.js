function TextSearch(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {

        self.dat = {
            filter: ioaux.setOrDefault(self.pars.filter, ""),
            text: ioaux.setOrDefault(self.pars.text, ""),
            image: ioaux.setOrDefault(self.pars.image, ""),
            align: ioaux.setOrDefault(self.pars.text, "left"),
            button: ioaux.setOrDefault(self.pars.button, false),
            placeholder: ioaux.setOrDefault(self.pars.placeholder, ""),
            chip: ioaux.setOrDefault(self.pars.chip, false),
            prevfilter: "",
            chipborrado: false
        };
    };

    this.render = function (apply) {
        var h = $('#' + self.pars.def.template).html();

        var dat = {
            id: self.pars.ide,
            text: self.dat.text,
            right: self.dat.align === "right",
            enable: self.dat.enable,
            visible: self.dat.visible,
            title: self.dat.title,
            appbar: self.pars.appbar,
            image: self.dat.image,
            withbutton: self.dat.button,
            placeholder: self.dat.placeholder
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);

            if (!isUndefinedOrEmpty(self.pars.button)) {
                self.eform(self.pars.ide + "_but").on("click", function (e) {
                    self.select();
                });
            }

            self.eform(self.pars.ide + "_chip").on("click", function (e) {
                self.chip({ text: "", filter: "" });
                self.dat.prevfilter = "";
            });

            self.eform(self.pars.ide + "_input").on("keydown", function (event) {
                if (self.pars.chip) {
                    if (event.keyCode === 8) {
                        if (self.dat.filter.length === 0) {
                            if (self.dat.prevfilter.length > 0) {
                                self.dat.chipborrado = true;
                            }
                        }
                    }
                }
            });

            self.eform(self.pars.ide + "_input").on("keyup", function (event) {
                self.dat.filter = self.eform(self.pars.ide + "_input").val();

                if (self.dat.chipborrado) {
                    self.chip({ text: "", filter: self.dat.prevfilter });
                    self.dat.prevfilter = "";
                    self.dat.chipborrado = false;
                    return;
                }

                if (event.keyCode === 27) {
                    self.dat.filter = "";
                    self.eform(self.pars.ide + "_input").val("");
                }

                if (isFunc(self.pars.onchange)) {
                    self.pars.onchange(self, self.dat.filter);
                }

                if (event.keyCode === 13) {
                    self.select();
                }
            });
        }

        return res;
    };

    this.select = function () {
        if (self.pars.chip) {
            self.chip({ text: self.dat.filter, filter: "" });
        } else {
            self.dat.prevfilter = self.dat.filter;
        }

        if (isFunc(self.pars.onselect)) {
            self.pars.onselect(self, self.dat.prevfilter);
        }
    };

    this.waiting = function (enable) {
        self.dat.enable = enable;
        self.eform(self.pars.ide + "_input").prop("disabled", enable);
        if (enable) {
            self.eform(self.pars.ide).addClass("spinloading");
        } else {
            self.eform(self.pars.ide).removeClass("spinloading");
        }
    };

    // Mostrar: text ="xx", ocultar: text = "", presentar, text = "", filter = "xx"
    this.chip = function (pars) {

        self.dat.prevfilter = pars.text;

        let ide = self.pars.ide + "_chip";
        if (pars.text === "") {
            self.eform(ide).hide();
        } else {
            self.eform(ide).show();
        }
        self.eform(ide).html(pars.text);

        if (pars.filter !== undefined) {
            self.dat.filter = pars.filter;
            self.eform(self.pars.ide + "_input").val(pars.filter);
            self.eform(self.pars.ide + "_input").select();
        }
    };

    this.focus = function () {
        self.eform(self.pars.ide + "_input").focus();
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}