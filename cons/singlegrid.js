function SingleGrid(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            data: [],
            groups: null
        };
    };

    this.render = function (apply) {
        if (self.pars.header !== undefined) {
            var h = self.temheader();

            self.eform(self.pars.header.ide).append(h);

            self.checks(self.pars.item.check);
        }
    };

    this.temheader = function () {

        var h = $('#' + self.pars.def.templates.header).html();

        var dat = {
            campos: [],
            prop: self.pars.item.prop,
            check: true
        };

        for (var l1 = 0; l1 < self.pars.columns.length; l1++) {
            let col = self.pars.columns[l1];

            let style = 'width:' + col.width + ';';
            style += col.width.indexOf('%') === -1 ? ' min-width:' + col.width + ';' : '';

            dat.campos.push({
                class: col.class === undefined ? 'col_s nomob' : col.class,
                text: col.title === undefined ? '' : col.title,
                style: style
            });
        }

        return Mustache.render(h, dat);
    };

    this.temgroup = function () {

        return $('#' + self.pars.def.templates.group).html();
    };

    this.temitem = function () {

        if (!isUndefinedOrEmpty(self.pars.item.template)) {
            return $('#' + self.pars.item.template).html();
        }

        let h = $('#' + self.pars.def.templates.row).html();

        var dat = {
            ide: '{{ide}}',
            classren: '{{classren}}',
            campos: [],
            prop: self.pars.item.prop,
            check: true
        };

        for (var l1 = 0; l1 < self.pars.columns.length; l1++) { 
            let col = self.pars.columns[l1];

            let style = 'width:' + col.width + ';';
            style += col.width.indexOf('%') === -1 ? ' min-width:' + col.width + ';' : '';

            dat.campos.push({
                class: col.class === undefined ? 'col_s nomob' : col.class,
                text: '{{' + (col.prop !== undefined ? col.prop : col.field) + '}}',
                style: style
            });
        }

        return Mustache.render(h, dat);
    };

    this.checks = function (enable) {
        if (enable) {
            self.eform(".colcheck").show();
        } else {
            self.eform(".colcheck").hide();
        }
    };

    // Setea los datos a mostrar en la grilla
    this.setdata = function (data) {
        self.dat.data = data;

        self.bindex();

        self.shdata();

        // Una vez mostrada la lista llamamos al metodo onsuccess
        if (isFunc(self.pars.onsuccess)) {
            self.pars.onsuccess();
        }
    };

    this.bindex = function () {

        for (let l1 = 0; l1 < self.dat.data.length; l1++) {
            let dat = self.dat.data[l1];
            dat._index = "";

            for (let l2 = 0; l2 < self.pars.columns.length; l2++) {
                let col = self.pars.columns[l2];

                let cam = dat[col.field];
                if (!isUndefinedOrEmpty(cam)) {
                    dat._index += " " + cam;
                }
            }
            dat._index = dat._index.trim().toLowerCase();
        }
    };

    this.shdata = function () {
        self.eform(self.pars.item.ide).html("");

        var it = self.temitem();
        var gt = self.temgroup();

        if (self.dat.groups !== null) {
            for (let l1 = 0; l1 < self.dat.groups.length; l1++) {
                let group = self.dat.groups[l1];

                let cant = 0;
                for (let l2 = 0; l2 < self.dat.data.length; l2++) {
                    let dat = self.dat.data[l2];

                    if (dat.group === group.key) {
                        cant++;
                    }
                }

                if (cant > 0) {
                    var gm = Mustache.render(gt, { text: group.title });
                    self.eform(self.pars.item.ide).append(gm);

                    for (let l2 = 0; l2 < self.dat.data.length; l2++) {
                        let dat = self.dat.data[l2];

                        if (dat.group === group.key) {
                            dat.ide = self.pars.item.ide + l2;
                            self.shitem(it, dat, l2);
                        }
                    }
                }
            }
        } else {
            for (let l1 = 0; l1 < self.dat.data.length; l1++) {
                let dat = self.dat.data[l1];
                dat.ide = self.pars.item.ide + l1;
                self.shitem(it, dat, l1);
            }
        }

        self.checks(self.pars.item.check);
    };

    this.shitem = function (temitem, dat, idx) {

        var itm = Mustache.render(temitem, dat);
        self.eform(self.pars.item.ide).append(itm);

        // Agregamos un evento click a cada fila de la grilla
        if (isFunc(self.pars.item.onclick.func)) {
            self.eform(dat.ide).on("click", { idx: idx }, function (e) {
                self.pars.item.onclick.func(e.data.idx);
            });

            let elemcheck = self.eform(dat.ide + "_chk");
            if (elemcheck.length > 0) {
                elemcheck.on("click", { idx: idx }, function (e) {
                    e.stopPropagation();
                });
            }
        }
        if (self.pars.item.onprop !== undefined && isFunc(self.pars.item.onprop.func)) {
            let elemprop = self.eform(dat.ide + "_but");
            if (elemprop.length > 0) {
                elemprop.on("click", { idx: idx, idelem: dat.ide + "_but" }, function (e) {
                    e.stopPropagation();
                    self.pars.item.onprop.func(e.data.idx, e.data.idelem);
                });
            }
        }
    };

    this.setfilter = function (text) {
        text = text.toLowerCase();
        for (let l1 = 0; l1 < self.dat.data.length; l1++) {
            let dat = self.dat.data[l1];

            if (dat._index.indexOf(text) > -1) {
                self.eform(dat.ide).show();
            } else {
                self.eform(dat.ide).hide();
            }
        }
    };

    this.setgroups = function (groups) {
        self.dat.groups = groups;
    };

    this.message = function (mensaje) {
        self.eform(self.pars.item.ide).html(mensaje);
    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };

    /*
    this.temheader_OLD = function () {

        var h = '<div class="renglon cab" style="height:40px">';
        for (var l1 = 0; l1 < self.pars.columns.length; l1++) {
            let col = self.pars.columns[l1];

            let style = 'style="width:' + col.width + ';';
            style += col.width.indexOf('%') === -1 ? ' min-width:' + col.width + ';' : '';
            style += '"';
            let clase = col.class === undefined ? 'class="col_s nomob"' : 'class="' + col.class + '"';
            let tit = col.title === undefined ? '' : col.title;

            h += '<div ' + clase + ' ' + style + '>' + tit + '</div>';
        }
        h += '</div>';

        return h;
    };

    this.temitem_OLD = function () {

        var h = null;
        if (self.pars.columns !== undefined && self.pars.columns.length > 0) {

            h = '<div id="{{ide}}" class="renglon_sel">';
            for (var l1 = 0; l1 < self.pars.columns.length; l1++) {
                let col = self.pars.columns[l1];
                let style = 'style="width:' + col.width + ';';
                style += col.width.indexOf('%') === -1 ? ' min-width:' + col.width + ';' : '';
                style += '"';
                let clase = col.class === undefined ? 'class="col_s nomob"' : 'class="' + col.class + '"';
                let fld = col.field === undefined ? '' : '{{' + col.field + '}}';

                h += '<div ' + clase + ' ' + style + '>' + fld + '</div>';
            }
            h += '</div>';
        } else {
            h = self.eform(self.pars.item.template).html();
        }

        return h;
    };

     
     */


}