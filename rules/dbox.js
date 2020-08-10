function RuleDialogWait() {
    var self = this;

    this.document_ready = function () {

    };

    this.sh = function (mensaje) {

        self.eform("dwait_msg").html(mensaje);

        self.eform('mask').fadeIn(0);
        self.eform('mask').fadeTo(0, 0.3);

        self.eform('dwait').fadeIn(200);
    };

    this.msg = function (mensaje) {
        self.eform("dwait_msg").html(mensaje);
    };

    this.close = function () {
        self.eform('mask').hide();
        self.eform('dwait').hide();
    };

    this.eform = function (id) {
        return $('#' + id);
    };

    this.document_ready();
}


function RuleDialogError() {
    var self = this;

    this.document_ready = function () {
    };

    this.sh = function (titulo, mensaje, fdone) {

        console.log(titulo + " : " + mensaje);

        self.fdone = fdone;

        self.eform("derror_tit").html(titulo);
        self.eform("derror_msg").html(mensaje);

        self.eform('mask').fadeIn(0);
        self.eform('mask').fadeTo(0, 0.3);

        self.eform('derror').fadeIn(200);
    };

    this.msg = function (mensaje) {
        self.eform("derror_msg").html(mensaje);
    };

    this.close = function () {
        self.eform('mask').hide();
        self.eform('derror').hide();

        console.log(self.fdone);

        if (self.fdone !== undefined) {
            self.fdone();
        }
    };

    this.eform = function (id) {
        return $('#' + id);
    };
}


function RuleDialogQuestion() {
    var self = this;

    this.document_ready = function () {
        this.faceptar = null;
        this.fcancelar = null;
        this.isloaded = false;

    };

    this.enter_onkeyup = function (event) {

        switch (event.keyCode) {
            case 13:  // enter
                self.aceptar();
                break;

            case 27:  // esc
                self.cancelar();
                break;
        }
    };

    this.sh = function (mensaje, pregunta, faceptar, fcancelar) {

        if (!self.isloaded) {
            self.isloaded = true;
            self.eform("dquest_preg").on("keyup", function (event) {
                self.enter_onkeyup(event);
            });
        }

        self.faceptar = faceptar;
        self.fcancelar = fcancelar;

        self.eform("dquest_msg").html(mensaje);
        self.eform("dquest_quest").html(pregunta);

        self.eform('mask').fadeIn(0);
        self.eform('mask').fadeTo(0, 0.3);

        self.eform('dquest').fadeIn(200, function () {
            self.eform("akey").focus();
        });
    };

    this.aceptar = function () {
        self.eform('mask').hide();
        self.eform('dquest').hide();
        if (isFunc(self.faceptar)) self.faceptar();
    };

    this.cancelar = function () {
        self.eform('mask').hide();
        self.eform('dquest').hide();
        if (isFunc(self.fcancelar)) self.fcancelar();
    };

    this.eform = function (id) {
        return $('#' + id);
    };
}

function RuleDialogInput() {
    var self = this;

    this.document_ready = function () {
        this.faceptar = null;
        this.fcancelar = null;
    };

    this.sh = function (mensaje, pregunta, placeholder, contenido, faceptar, fcancelar) {

        self.faceptar = faceptar;
        self.fcancelar = fcancelar;
        self.contenido = contenido;

        self.eform("dinput_msg").html(mensaje);
        self.eform("dinput_quest").html(pregunta);
        self.eform("dinput_text").val(contenido);
        self.eform("dinput_text").prop("placeholder", placeholder);

        self.eform('mask').fadeIn(0);
        self.eform('mask').fadeTo(0, 0.3);

        self.eform('dinput').fadeIn(200, function () {
            self.eform("dinput_text").focus();
        });
    };

    this.aceptar = function () {
        self.eform('mask').hide();
        self.eform('dinput').hide();
        if (isFunc(self.faceptar)) self.faceptar(self.eform("dinput_text").val());
    };

    this.cancelar = function () {
        self.eform('mask').hide();
        self.eform('dinput').hide();
        if (isFunc(self.fcancelar)) self.fcancelar();
    };

    this.eform = function (id) {
        return $('#' + id);
    };
}

function RuleDialogInfo() {
    var self = this;

    this.document_ready = function () {
    };

    this.sh = function (titulo, mensaje, fdone) {

        console.log(titulo + " : " + mensaje);

        self.fdone = fdone;

        self.eform("dinfo_tit").html(titulo);
        self.eform("dinfo_msg").html(mensaje);

        self.eform('mask').fadeIn(0);
        self.eform('mask').fadeTo(0, 0.3);

        self.eform('dinfo').fadeIn(200);
    };

    this.msg = function (mensaje) {
        self.eform("dinfo_msg").html(mensaje);
    };

    this.close = function () {
        self.eform('mask').hide();
        self.eform('dinfo').hide();

        if (self.fdone !== undefined) {
            self.fdone();
        }
    };

    this.eform = function (id) {
        return $('#' + id);
    };
}
