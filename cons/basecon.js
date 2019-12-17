function Basecon() { }

Basecon.prototype = {
    set enable(valor) {
        this.dat.enable = valor;
        if (isFunc(this.ev_enable)) {
            this.ev_enable();
        } else {
            if (valor) {
                this.eform(this.pars.ide).attr("class", this.pars.class);
            } else {
                this.eform(this.pars.ide).attr("class", this.pars.disclass);
            }
        }
    },
    get enable() {
        return this.dat.enable;
    },
    set visible(valor) {
        this.dat.visible = valor;
        if (isFunc(this.ev_visible)) {
            this.ev_visible();
        } else {
            if (valor) {
                this.eform(this.pars.ide).show();
            } else {
                this.eform(this.pars.ide).hide();
            }
        }
    },
    get visible() {
        return this.dat.visible;
    },
    set text(valor) {
        this.dat.text = valor;
        if (isFunc(this.ev_text)) {
            this.ev_text();
        } else {
            this.eform(this.pars.ide).html(valor);
        }
    },
    get text() {
        return this.dat.text;
    }
};
