function Chip(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, ""),
            title: ioaux.setOrDefault(self.pars.title, "")
        };
    };

    this.click = function () {
        if (self.dat.enable) {
            if (isFunc(self.pars.onclick)) {
                self.pars.onclick(self);
            }
        }
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.template).html();

        var dat = {
            id: self.pars.ide,
            text: self.dat.text,
            title: self.dat.title,
            enable: self.dat.enable,
            visible: self.dat.visible
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);

            //if (isFunc(self.pars.onclick)) {
                self.eform(self.pars.ide).on("click", { self: self }, function (e) {
                    self.click();
                });
            //}
        }

        return res;
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };


}
