function Link(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, "")
        };
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.template).html();

        var dat = {
            id: self.pars.ide,
            text: self.dat.text,
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

    this.click = function () {
        if (isFunc(self.pars.onclick)) {
            self.pars.onclick(self);
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