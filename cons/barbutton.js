function BarButton(parent, pars) {
    var self = this;
    self.pars = pars;
    self.pars.parent = parent;

    this.init = function () {
        self.dat = {
            enable: isUndefinedOrEmpty(self.pars.enable) ? true : self.pars.enable,
            visible: isUndefinedOrEmpty(self.pars.visible) ? true : self.pars.visible
        };

        self.pars.class = isUndefinedOrEmpty(self.pars.class) ? "button" : self.pars.class;
        self.pars.disclass = isUndefinedOrEmpty(self.pars.disclass) ? "button_dis" : self.pars.disclass;

        self.enable = self.dat.enable;
        self.visible = self.dat.visible;

        self.eform(self.pars.ide).on("click", { self: self }, function (e) {
            self.click();
        });
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

    this.init();
}

Button.prototype = Basecon.prototype;