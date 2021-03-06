﻿function FormPanels(parent) {
    var self = this;
    self.parent = parent;

    this.init = function () {
        self.pans = [];
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
        if (tem === null) {
            return null;
        }

        data.def = tem;
        data.parent = self.parent;
        data.enable = ioaux.setOrDefault(data.enable, true);
        data.visible = ioaux.setOrDefault(data.visible, true);

        var instance = newFunc(tem.clase, data);
        instance.init();
        instance.dat.enable = data.enable;
        instance.dat.visible = data.visible;

        if (isFunc(instance.render)) {
            instance.render(true);
        }

        self.pans.push({
            ide: data.ide,
            template: tem,
            instance: instance
        });
    };

    // Setea o recupera el valor de una propiedad de un control
    this.prop = function (ide, prop, value) {
        var con = self.get(ide);

        if (con === null) {
            for (var l1 = 0; l1 < self.pans.length; l1++) {
                var appbar = self.pans[l1];
                if (appbar.template.name === "appbar" || appbar.template.name === "dropbar") {
                    for (var l2 = 0; l2 < appbar.instance.pans.length; l2++) {
                        if (appbar.instance.pans[l2].ide === ide) {
                            con = appbar.instance.pans[l2];
                            break;
                        }
                    }
                    if (con !== null) break;
                }
            }
        }

        if (con !== null) {
            if (!isUndefinedOrEmpty(value)) {
                con.instance.dat[prop] = value;
                con.instance.render(true);
            }
        }
        return con !== null ? con.instance.dat[prop] : null;
    };

    // Ejecuta una funcion de un control
    // ide = id del control, func = nombre de la funcion, pars = parametros
    this.func = function (ide, func, pars) {
        var con = self.get(ide);

        if (con === null) {
            for (var l1 = 0; l1 < self.pans.length; l1++) {
                var appbar = self.pans[l1];
                if (appbar.template.name === "appbar") {
                    for (var l2 = 0; l2 < appbar.instance.pans.length; l2++) {
                        if (appbar.instance.pans[l2].ide === ide) {
                            con = appbar.instance.pans[l2];
                            break;
                        }
                    }
                    if (con !== null) break;
                }
            }
        }

        if (con !== null) {
            return con.instance[func](pars);
        }
        return null;
    };

    this.get = function (ide) {
        for (var l1 = 0; l1 < self.pans.length; l1++) {
            if (self.pans[l1].ide === ide) {
                return self.pans[l1];
            }
        }
        return null;
    };

    this.eform = function (id) {
        return RuleBase.eform(self.parent.idform, id);
    };

    this.init();
}