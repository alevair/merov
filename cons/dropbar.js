function Dropbar(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.cons = [];
        self.dat = {
            text: ioaux.setOrDefault(self.pars.text, "")
        };

        self.prepare();
    };

    this.render = function (apply) {

    };

    this.prepare = function () {
        self.add(self.pars.controls);
    };

    // Agregamos controles al formulario
    this.add = function (data) {

        var datas = data;
        if (!Array.isArray(data)) {
            datas = [];
            datas.push(data);
        }

        for (var l1 = 0; l1 < datas.length; l1++) {
            self.addControl(datas[l1]);
        }
    };

    // Agregamos un control al formulario
    this.addControl = function (data) {

        if (data.type === undefined) {
            return null;
        }
        var tem = app.dat.controls.get(data.type);

        var h = "";

        switch (data.type) {
            case "space":
                h = '<div style="width:10px"></div>';
                break;

            case "dropfile":
                h = '<div id="' + data.ide + '"></div>';
                break;
        }
        self.eform(self.pars.ide).append(h);

        if (tem === null) {
            return null;
        }

        data.def = tem;
        data.parent = self.pars.parent;
        data.idcont = self.pars.ide;
        data.enable = ioaux.setOrDefault(data.enable, true);
        data.visible = ioaux.setOrDefault(data.visible, true);
        data.appbar = true;

        var instance = newFunc(tem.clase, data);
        instance.init();
        instance.dat.enable = data.enable;
        instance.dat.visible = data.visible;

        instance.render(true);


        self.cons.push({
            ide: data.ide,
            template: tem,
            instance: instance
        });
    };

    this.click = function () {
        if (self.dat.enable) {
            if (isFunc(self.pars.onclick)) {
                self.pars.onclick(self);
            }
        }
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}