function Butrot(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, ""),
            image: ioaux.setOrDefault(self.pars.image, null),
            align: ioaux.setOrDefault(self.pars.align, "left"),
            title: ioaux.setOrDefault(self.pars.title, null),
            index: ioaux.setOrDefault(self.pars.index, 0)
        };
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.template).html();

        let op = self.pars.ops[self.dat.index];
        var dat = {
            id: self.pars.ide,
            text: op.text !== undefined ? op.text : self.dat.text,
            right: self.dat.align === "right",
            enable: self.dat.enable,
            visible: self.dat.visible,
            title: op.title !== undefined ? op.title : self.dat.title,
            appbar: self.pars.appbar,
            image: op.image,
            sep: op.image !== null && self.dat.text !== ""
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);

            if (isFunc(self.pars.onclick)) {
                self.eform(self.pars.ide).on("click", { self: self }, function (e) {
                    self.dat.index = self.dat.index + 1 > self.pars.ops.length - 1 ? 0 : self.dat.index + 1;
                    self.render(true);
                    self.click();
                });
            }
        }

        return res;
    };

    this.click = function () {
        if (self.dat.enable) {
            if (isFunc(self.pars.onclick)) {
                self.pars.onclick(self, self.dat.index);
            }
        }
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}