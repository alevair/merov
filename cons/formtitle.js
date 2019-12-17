function FormTitle(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, ""),
            amount: ioaux.setOrDefault(self.pars.amount, null),
            message: ioaux.setOrDefault(self.pars.message, "")
        };
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.template).html();

        var dat = {
            id: self.pars.ide,
            title: self.dat.text,
            showpill: self.dat.amount !== null ? true : false,
            pill: self.dat.amount,
            enable: self.dat.enable,
            appbar: self.pars.appbar,
            visible: self.dat.visible,
            message: self.dat.message
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);
        }

        return res;
    };

    this.setmessage = function (message) {
        self.eform(self.pars.ide + "_men").html(message);
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}