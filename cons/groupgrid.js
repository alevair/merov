function GroupGrid(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            data: null,
            filter: ""
        };
        if (!Array.isArray(self.pars.item.onclick)) {
            var arr = [];
            arr.push(self.pars.item.onclick);
            self.pars.item.onclick = arr;
        }
    };

    this.render = function (apply) {

    };

    // Setea los datos a mostrar en la grilla
    this.setdata = function (data) {
        self.dat.data = data;
        var it = self.eform(self.pars.item.template).html();

        for (var l1 = 0; l1 < self.dat.data.length; l1++) {
            let dat = self.dat.data[l1];
            dat.ide = "item_" + l1;
            dat.idxgroup = self.getgroupidx(dat.group);
            self.dat.groups[dat.idxgroup].count++;

            // Combinamos el template de la fila con los datos
            var ide = "inner_panel_grupo_" + dat.group;

            var itm = Mustache.render(it, dat);
            self.eform(ide).append(itm);

            for (let l2 = 0; l2 < self.pars.item.onclick.length; l2++) {
                var ite = self.pars.item.onclick[l2];
                if (isFunc(ite.func)) {
                    self.eform(ite.ide + dat.ide).on("click", { idx: l1, item: l2 }, function (e) {
                        var it = self.pars.item.onclick[e.data.item];
                        it.func(e.data.idx);
                    });
                }
            }
        }

        self.filtrar();

        // Una vez mostrada la lista llamamos al metodo onsuccess
        if (isFunc(self.pars.onsuccess)) {
            self.pars.onsuccess();
        }
    };

    this.setgroups = function (groups) {
        self.dat.groups = groups;
        self.eform(self.pars.item.ide).html("");

        var gr = self.eform(self.pars.group.template).html();

        for (var l1 = 0; l1 < self.dat.groups.length; l1++) {
            let dat = self.dat.groups[l1];

            let itm = Mustache.render(gr, dat);
            self.eform(self.pars.item.ide).append(itm);

            dat.open = false;
            dat.ide = "grupo_" + dat.anio;
            dat.count = 0;

            // Agregamos un evento click a cada fila de la grilla
            self.eform(dat.ide).on("click", { idx: l1 }, function (e) {
                self.group_toggle(e.data.idx);
                if (self.pars.group.onclick !== undefined) {
                    if (isFunc(self.pars.group.onclick.func)) {
                        self.pars.group.onclick.func(e.data.idx);
                    }
                }
            });
        }
    };

    this.group_toggle = function (indice) {
        var grp = self.dat.groups[indice];
        grp.open = !grp.open;
        if (grp.open) {
            self.eform(grp.ide).addClass("naranja");
            self.eform("panel_" + grp.ide).slideToggle(250);
        } else {
            self.eform(grp.ide).removeClass("naranja");
            self.eform("panel_" + grp.ide).slideToggle(250);
        }
    };

    this.setfilter = function (filter) {
        self.dat.filter = filter;
        self.filtrar();
    };

    this.filtrar = function () {

        for (let l1 = 0; l1 < self.dat.groups.length; l1++) {
            self.dat.groups[l1].visibles = 0;
        }

        var criterio = self.dat.filter.toLowerCase().split(" ");
        for (let l1 = 0; l1 < self.dat.data.length; l1++) {
            var item = self.dat.data[l1];
            var mostrar = true;

            for (let l2 = 0; l2 < criterio.length; l2++) {
                if (!(item.criterio.toLowerCase().indexOf(criterio[l2]) !== -1 || criterio[0] === "")) {
                    mostrar = false;
                    break;
                }
            }

            if (mostrar) {
                self.dat.groups[item.idxgroup].visibles++;
                self.eform(item.ide).show();
            } else {
                self.eform(item.ide).hide();
            }
        }

        var visibles = 0;
        var indice = -1;
        for (let l1 = 0; l1 < self.dat.groups.length; l1++) {
            var group = self.dat.groups[l1];
            if (group.visibles === 0) {
                self.eform(group.ide).hide();
            } else {
                visibles++;
                self.eform(group.ide).show();
                indice = l1;
            }
        }

        if (visibles === 1) {
            if (!self.dat.groups[indice].open) {
                self.group_toggle(indice);
            }
        } else {
            for (let l1 = 0; l1 < self.dat.groups.length; l1++) {
                let grp = self.dat.groups[l1];
                if (grp.open) {
                    self.group_toggle(l1);
                }
            }
        }
    };

    this.getgroupidx = function (group) {
        for (var l1 = 0; l1 < self.dat.groups.length; l1++) {
            if (self.dat.groups[l1].ide ===  "grupo_" + group) {
                return l1;
            }
        }
        return -1;
    };

    this.setmensaje = function (mensaje) {
        self.eform(self.pars.ide).html(mensaje);
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };

    this.init();
}