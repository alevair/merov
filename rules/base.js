var RuleBase = {};

RuleBase.eform = function (idform, id) {

    if (isUndefinedOrEmpty(id)) {
        return $('#' + idform);
    }
    if (id.indexOf(".") > -1) {
        return $('#' + idform + ' ' + id);
    }
    if (id.indexOf(">") > -1) {
        return $('#' + idform + ' ' + id);
    }

    return $('#' + idform + ' #' + id);
};

RuleBase.setvars = function (idform, vars, prep = "", post = "") {
    var keys = Reflect.ownKeys(vars);

    for (var l1 = 0; l1 < keys.length; l1++) {
        let ide = (idform, prep + keys[l1] + post).toLowerCase();
        let elem = RuleBase.eform(idform, ide);

        let dat = vars[keys[l1]];

        if (elem.length > 0) {
            switch (elem.get(0).tagName) {
                case "INPUT":
                case "TEXTAREA":
                    elem.val(dat);
                    break;
                default:
                    elem.html(dat);
            }
        }
    }
};

RuleBase.getvars = function (idform, vars, prep = "", post = "") {
    var txt = "{";
    var keys = Reflect.ownKeys(vars);

    for (var l1 = 0; l1 < keys.length; l1++) {
        var val = "";
        
        var elem = RuleBase.eform(idform, prep + keys[l1] + post);

        if (elem.length > 0) {
            switch (elem.get(0).tagName) {
                case "INPUT":
                case "TEXTAREA":
                case "SELECT":
                    val = elem.val();
                    break;
                default:
                    val = elem.html();
            }
        }
        txt += ' "' + keys[l1] + '":"' + val + '"' + (l1 < keys.length - 1 ? ',' : '');
    }
    txt += " }";

    return JSON.parse(txt);
};
