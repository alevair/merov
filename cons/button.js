function Button(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, ""),
            image: ioaux.setOrDefault(self.pars.image, null),
            align: ioaux.setOrDefault(self.pars.align, "left"),
            title: ioaux.setOrDefault(self.pars.title, null)
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
            sep: self.dat.image !== null && self.dat.text !== ""
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);

            if (isFunc(self.pars.onclick)) {
                self.eform(self.pars.ide).on("click", { self: self }, function (e) {
                    self.click();
                });
            }
        }

        return res;
    };

    this.click = function () {
        if (self.dat.enable) {
            if (isFunc(self.pars.onclick)) {
                self.pars.onclick(self);
            }
        }
    };

    this.settext = function (text) {
        self.dat.text = text;
        self.eform(self.pars.ide + "_text").html(text);
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}