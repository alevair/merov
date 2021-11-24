function FormControls(parent) {
    var self = this;
    self.parent = parent;

    this.init = function () {
        self.cons = [];
    };

    // Agregamos controles al formulario
    this.add = (pars) => {

        var datas = pars;
        if (!Array.isArray(pars)) {
            datas = [];
            datas.push(pars);
        }

        for (var l1 = 0; l1 < datas.length; l1++) {
            self.addControl(datas[l1]);
        }
    };

    // Agregamos un control al formulario
    this.addControl = (pars) => {
        if (pars.type === undefined) {
            return null;
        }
        var tem = app.dat.controls.get(pars.type);
        if (tem === null) {
            return null;
        }

        pars.def = tem;
        pars.parent = self.parent;
        pars.enable = pars.enable ?? true;
        pars.visible = pars.visible ?? true;

        // Sacar los parametros de los controles a posterior
        var instance = newFunc(tem.clase, pars);
        instance.pars = { ...pars };

        if (instance.init !== undefined) {
            instance.init();
        }

        if (instance.dat === undefined) {
            instance.dat = {};
        }

        if(instance.render === undefined) {
            instance.render = () => { };
        }

        if(instance.eform === undefined) {
            instance.eform = (id) => RuleBase.eform(instance.pars.parent.idform, id);
        }

        if(instance.setstate === undefined) {
            instance.setstate = pars => { 
                
                instance.dat = {
                    ...instance.dat,
                    ...pars
                };
                instance.render(true);
            };
        }

        if(instance.getstate === undefined) {
            instance.getstate = () => { 
                
                return {
                    ...instance.pars,
                    ...instance.dat
                };
            };
        }
        

        if(instance.show === undefined) {
            instance.show = pars => {

                instance.currstate = pars;
                var template = document.getElementById(instance.pars.def.template);
                var res = Mustache.render(template.innerHTML, pars);

                var replace = false;
                if(instance.pars.ide) {
                    elem = instance.eform(instance.pars.ide);

                    if(elem.length > 0) {
                        replace = true;
                    }
                }

                if(replace) {
                    instance.eform(instance.pars.ide).replaceWith(res);
                } else {
                    instance.eform(pars.idparent).append(res);
                }
                return res;
            }
        }

        instance.dat.enable = pars.enable;
        instance.dat.visible = pars.visible;

        if (isFunc(instance.render)) {
            instance.render(true);
        }

        self.cons.push({
            ide: pars.ide,
            template: tem,
            instance: instance
        });
    };

    this.removeControl = (ide) => {
        for (let l1 = 0; l1 < self.cons.length; l1++) {
            let con = self.cons[l1];

            if (con.ide === ide) {
                self.eform(ide).remove();
                self.cons.splice(l1, 1);
                break;
            }
        }
    };

    this.clear = () => {
        for (let l1 = 0; l1 < self.cons.length; l1++) {
            let con = self.cons[l1];

            self.eform(con.ide).remove();
        }
        self.cons = [];
    };

    // Setea o recupera el valor de una propiedad de un control
    this.prop = function (ide, prop, value ) {
        var con = self.get(ide);

        if (con !== null) {
            if (!isUndefinedOrEmpty(value)) {
                con.instance.dat[prop] = value;
                con.instance.render(true);
            }
        }
        return con !== null ? con.instance.dat[prop] : null;
    };
    
    this.cbox = (pars) => {

        return new Promise((resolve, reject) => {

            if (pars.type === undefined) {
                return null;
            }
            var tem = app.dat.controls.get(pars.type);
            if (tem === null) {
                return null;
            }
    
            pars.def = tem;
            pars.parent = self.parent;
            //pars.enable = pars.enable ?? true;
            //pars.visible = pars.visible ?? true;
    
            // Sacar los parametros de los controles a posterior
            var instance = newFunc(tem.clase, pars);
            instance.pars = { ...pars };
    
            if (instance.init !== undefined) {
                instance.init();
            }
    
            if (instance.dat === undefined) {
                instance.dat = {};
            }
    
            if(instance.render === undefined) {
                instance.render = () => { };
            }
    
            if(instance.eform === undefined) {
                instance.eform = (id) => RuleBase.eform(instance.pars.parent.idform, id);
            }

            if(instance.show === undefined) {
                instance.show = (pars) => {
    
                    var template = document.getElementById(instance.pars.def.template);
                    var res = Mustache.render(template.innerHTML, pars);
    
                    if(instance.pars.ide) {
                        instance.eform(instance.pars.ide).remove();
                    }
    
                    instance.eform(pars.idparent).append(res);

                    return res;
                }
            }

            instance.render();

            instance.onclick = pars  => {
                resolve(pars);
                instance.close();
            }
        });
    };

    // Ejecuta una funcion de un control
    // ide = id del control, func = nombre de la funcion, pars = parametros
    this.func = function (ide, func, pars) {
        var con = self.get(ide);

        /*
        if (con === null) {
            for (var l1 = 0; l1 < self.cons.length; l1++) {
                var appbar = self.cons[l1];
                if (appbar.template.name === "appbar") {
                    for (var l2 = 0; l2 < appbar.instance.cons.length; l2++) {
                        if (appbar.instance.cons[l2].ide === ide) {
                            con = appbar.instance.cons[l2];
                            break;
                        }
                    }
                    if (con !== null) break;
                }
            }
        }
        */

        if (con !== null) {
            return con.instance[func](pars);
        }
        return null;
    };

    // Agrega un evento / funcion a un control
    this.addevent = (ide, fname, func) => {

        var con = self.get(ide);

        if (con !== null) {
            con.instance.pars[fname] = func;
        }
    };
     
    this.get = (ide, controls) => {
        controls = controls ? controls : self;

        for (var l1 = 0; l1 < controls.cons.length; l1++) {
            let con = controls.cons[l1];

            if (con.ide === ide) {
                return con;
            } else {
                if(con.instance.controls) {
                    let res = con.instance.controls.get(ide, con.instance.controls);
                    if(res != null) {
                        return res;
                    }
                }
                if (con.template.name === "appbar" || con.template.name === "dropbar") {
                    for (var l2 = 0; l2 < con.instance.cons.length; l2++) {
                        if (con.instance.cons[l2].ide === ide) {
                            return con.instance.cons[l2];
                        }
                    }
                }
            }
        }

        /*
        for (var l1 = 0; l1 < self.cons.length; l1++) {
            let con = self.cons[l1];

            if (con.ide === ide) {
                return self.cons[l1];
            } else {
                if (con.template.name === "appbar" || con.template.name === "dropbar") {
                    for (var l2 = 0; l2 < con.instance.cons.length; l2++) {
                        if (con.instance.cons[l2].ide === ide) {
                            return con.instance.cons[l2];
                        }
                    }
                }
            }
        }
        */

        return null;
    };

    this.setstate = (ide, pars) => {

        var con = self.get(ide);

        if (con !== null) {
            con.instance.setstate(pars);
        }
    };

    /*
    this.get_template = function (name) {
        for (var l1 = 0; l1 < app.dat.controls.length; l1++) {
            let con = app.dat.controls[l1];

            if (con.name === name) {
                return con;
            }
        }
        return null;
    };
    */
    this.eform = (id) => {
        return RuleBase.eform(self.parent.idform, id);
    };

    this.init();
}