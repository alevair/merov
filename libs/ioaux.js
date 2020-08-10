var ioaux = new function() {

    // Recupera un archivo .json
    this.get_json = function (url, fdone) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                fdone(JSON.parse(xmlhttp.responseText));
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    };

    this.load_into_element = function (nombre_elem, ruta_html, func) {
        var elem = $(nombre_elem);

        if (app.settings.lares) {
            ruta_html = app.settings.servidor + "/resource/" + ruta_html + "?ver=" + app.version;
        }

        var mem = $('<div>');
        mem.load(ruta_html, function () {

            elem.html(mem.html());

            if (!isUndefinedOrEmpty(func)) {
                func();
            }
        });
    };

    this.load_into_attr = function (nombre_elem, nombre_attr, ruta_html, func) {
        var mem = $('<div>');
        mem.load(ruta_html, function () {

            $(nombre_elem).attr(nombre_attr, mem.html());

            if (!isUndefinedOrEmpty(func)) {
                func();
            }
        });
    };

    this.load_html = function (ruta_html, fdone) {

        if (app.settings.lares) {
            ruta_html = app.settings.servidor + "/resource/" + ruta_html + "?ver=" + app.version;
        }

        var mem = $('<div>');
        mem.load(ruta_html, function () {

            fdone(mem.html());
        });
    };

    this.ajax_get = function (url, data_type, func_success, func_error) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: data_type,
            timeout: 60000,

            success:
            function (json) {
                func_success(json);
            },

            error:
            function (jqXHR, textStatus, errorThrown) {
                func_error(textStatus + " - " + errorThrown);
            }
        });
    };

    this.ajax_get_result = function (url, func_success, func_error) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            timeout: 60000,

            success:
            function (json) {
                if (!json.Ok) {
                    if(isFunc(func_error))  func_error(json.Mensaje);
                } else {
                    if(isFunc(func_success)) func_success(json);
                }
            },

            error:
            function (jqXHR, textStatus, errorThrown) {
                if(isFunc(func_error)) func_error(textStatus + " - " + errorThrown);
            }
        });
    };

    this.format_bytes = function (bytes) {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
        else return (bytes / 1073741824).toFixed(2) + " GB";
    };

    this.copyToClipboard = function (texto) {

        var aux = document.createElement("input");
        aux.setAttribute("value", texto);

        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    };

    // Pasar el html que corresponde al body
    this.print = function (html, css, titulo, ancho, alto, iniciarimpresion) {
        var mywindow = window.open('', 'PRINT', 'width=' + ancho + 'px, height=' + alto + "px");

        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        //if (css != null) {
        //mywindow.document.write('<link type="text/css" media="print">');
        //}
        mywindow.document.write('</head>');

        mywindow.document.write('<body><page size="A4" layout="landscape">');
        mywindow.document.write(html);
        mywindow.document.write('</page></body></html>');

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "print";
        link.onload = function () {
            if (iniciarimpresion) {
                mywindow.print();
                mywindow.close();
                return true;
            }
        };
        link.href = css;
        mywindow.document.head.appendChild(link);

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        return true;
    };

    this.clean_url = function () {
        // get the string following the ?
        var query = window.location.search.substring(1);

        // is there anything there ?
        if (query.length) {
            // are the new history methods available ?
            if (window.history !== undefined && window.history.pushState !== undefined) {
                // if pushstate exists, add a new state the the history, this changes the url without reloading the page

                window.history.pushState({}, document.title, window.location.pathname);
            }
        }
    };

    this.isChrome = function () {
        var isChromium = window.chrome,
            winNav = window.navigator,
            vendorName = winNav.vendor,
            isOpera = winNav.userAgent.indexOf("OPR") > -1,
            isIEedge = winNav.userAgent.indexOf("Edge") > -1,
            isIOSChrome = winNav.userAgent.match("CriOS");

        if (isIOSChrome) {
            return true;
        } else if (
            isChromium !== null &&
            typeof isChromium !== "undefined" &&
            vendorName === "Google Inc." &&
            isOpera === false &&
            isIEedge === false
        ) {
            return true;
        } else {
            return false;
        }
    };

    this.isMobile = function () {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    };

    this.setOrDefault = function (source, defaultval) {
        return isUndefinedOrEmpty(source) ? defaultval : source;
    };

    // Agrega un delay en la llamada a la funcion callback
    this.delay = function (callback, ms) {
        var timer = 0;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    };

    // Recupera un archivo .json
    this.get_json = function (url, fdone) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                fdone(JSON.parse(xmlhttp.responseText));
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    };
};

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function dateTimeStringDiaMesAnio(date) {
    return zeroPad(date.getDate(), 2) + "/" + zeroPad(date.getMonth() + 1, 2) + "/" + zeroPad(date.getFullYear(), 4);
}

function dateTimeAnsiDate(date) {
    return zeroPad(date.getFullYear(), 4) + "-" + zeroPad(date.getMonth() + 1, 2) + "-" + zeroPad(date.getDate(), 2);
}

function dateTimeStringToAnsiDate(datestring) {
    return datestring.substring(6, 10) + "-" + datestring.substring(3, 5) + "-" + datestring.substring(0,2);
}

function jsonDateTimeIsNull(jsonDateString) {
    if (isUndefinedOrEmpty(jsonDateString)) {
        return false;
    } 
    if (jsonDateString.substring(0, 4) === "0001") {
        return true;
    } else {
        return false;
    }
}

function shortTimeString(datetime, posttext = '') {
    return zeroPad(datetime.getHours(), 2) + ":" + zeroPad(datetime.getMinutes(), 2) + posttext;
}

function shortDateString(datetime) {
    return datetime.toLocaleDateString();
};

// Convierte una fecha en formato json en una fecha corta
function jsonDateToShortDateString(jsonDateString) {
    if (isUndefinedOrEmpty(jsonDateString)) {
        return false;
    } 
    if (jsonDateString.substring(0, 4) === "0001") {
        return "-";
    } else {
        return jsonDateString.substring(8, 10) + "/" + jsonDateString.substring(5, 7) + "/" + jsonDateString.substring(0, 4);
    }
}

function dateTimeAddDays(fecha, dias) {
    var dayMillisecs = 24 * 60 * 60 * 1000;
    return new Date(fecha + dias * dayMillisecs);
}


function dateTimeGetMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function dateTimeGetSunday(d) {
    var day = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day === 0 ? 0 : 7) - day);
}

function jsonDateToShortTimeString(jsonDateString) {
    if (jsonDateString.substring(0, 4) === "0001") {
        return "-";
    } else {
        return jsonDateString.substring(11, 13) + ":" + jsonDateString.substring(14, 16) +  "hs";
    }
}

function jsonDateToTimeString(jsonDateString) {
    if (jsonDateString.substring(0, 4) === "0001") {
        return "-";
    } else {
        return jsonDateString.substring(11, 13) + ":" + jsonDateString.substring(14, 16) + ":" + jsonDateString.substring(17, 19) + " hs";
    }
}

function jsonDateToShortDateTimeString(jsonDateString) {
    if (jsonDateString.substring(0, 4) === "0001") {
        return "-";
    } else {
        var dat = jsonDateString.substring(8, 10) + "/" + jsonDateString.substring(5, 7) + "/" + jsonDateString.substring(0, 4);
        var tim = jsonDateString.substring(11, 13) + ":" + jsonDateString.substring(14, 16) + ":" + jsonDateString.substring(17, 19) + " hs";
        return dat + " - " + tim;
    }
}

// Chequea si una fecha en json puede interpretarse como nula
function jsonDateIsNull(jsonDateString) {
    return jsonDateString.substring(0, 4) === "0001";
}

//
// Convierte un string de fecha json a un Date
//
function parseJsonDateTime(jsonDateString) {
    return new Date(jsonDateString);
}

function parseJsonDate(jsonDateString) {

    return new Date(Number(jsonDateString.substring(0, 4)), Number(jsonDateString.substring(5, 7)) - 1, Number(jsonDateString.substring(8, 10)));
}
//
// Agrega un metodo toShortString al tipo Date
// El objetivo es que retorna una fecha en formato corto
//
Date.prototype.toShortDateString = function () {
    return this.toLocaleDateString();
};

//
// Agrega un metodo toShortDateTimeString al tipo date
// El objetivo es que retorna una fecha y hora en formato corto
//
Date.prototype.toShortDateTimeString = function () {
    var dd = this.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = this.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yyyy = this.getFullYear();
    if (yyyy < 1000) {
        if (yyyy < 100) {
            if (yyyy < 10) {
                yyyy = '0' + yyyy;
            }
            else {
                yyyy = '00' + yyyy;
            }
        }
        else {
            yyyy = '000' + yyyy;
        }
    }

    var hh = this.getHours();
    if (hh < 10) hh = '0' + hh;

    var ii = this.getMinutes();
    if (ii < 10) ii = '0' + ii;

    var ss = this.getSeconds();
    if (ss < 10) ss = '0' + ss;


    return String(dd + "\/" + mm + "\/" + yyyy + " - " + hh + ":" + ii + ":" + ss);
};

//
// Obtiene un parametro dado por su nombre de querystring
//
function getUrlParameter(param) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === param) {
            return sParameterName[1];
        }
    }
}

/*
function executeFunctionByName(str, args) {
    var arr = str.split('.');
    var fn = window[arr[0]];

    for (var i = 1; i < arr.length; i++)
    { fn = fn[arr[i]]; }
    fn.apply(window, args);
}
*/

//
// Retorna la cadena QueryString
// uso: GetQueryString()["myParam"];
//
function getQueryString() {
    var result = {}, queryString = location.search.substring(1),
	re = /([^&=]+)=([^&]*)/g, m;
    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
}

//
// Chequea si el parametro pasado es undefined o esta vacio
// Si es asi retorna true, si no false
//
function isUndefinedOrEmpty(param) {
    /*if(param)*/
    if (param === null || param === '' || param === undefined || param === "null") {
        return true;
    }
    return false;
}

// Determina si un parametro dado es una funcion
function isFunc(param, fdone) {
    if (typeof fdone === "function") {
        if (typeof param === "function") {
            fdone(param);
            return true;
        }
    } else {
        return typeof param === "function";
    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isFloat(val) {
    var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
    if (!floatRegex.test(val))
        return false;

    val = parseFloat(val);
    if (isNaN(val))
        return false;
    return true;
}

function reloadWithQueryStringVars(queryStringVars) {
    var existingQueryVars = location.search ? location.search.substring(1).split("&") : [],
        currentUrl = location.search ? location.href.replace(location.search, "") : location.href,
        newQueryVars = {},
        newUrl = currentUrl + "?";
    if (existingQueryVars.length > 0) {
        for (var i = 0; i < existingQueryVars.length; i++) {
            var pair = existingQueryVars[i].split("=");
            newQueryVars[pair[0]] = pair[1];
        }
    }
    if (queryStringVars) {
        for (var queryStringVar in queryStringVars) {
            newQueryVars[queryStringVar] = queryStringVars[queryStringVar];
        }
    }
    if (newQueryVars) {
        for (var newQueryVar in newQueryVars) {
            newUrl += newQueryVar + "=" + newQueryVars[newQueryVar] + "&";
        }
        newUrl = newUrl.substring(0, newUrl.length - 1);
        window.location.href = newUrl;
    } else {
        window.location.href = location.href;
    }
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

//
// Reemplaza todas las ocurrencias del texto "origen" por el texto "destino"
//
function replaceAll(texto, origen, destino) {
    if (isUndefinedOrEmpty(texto)) {
        return "";
    }
    return texto.replace(new RegExp(escapeRegExp(origen), 'g'), destino);
}

String.prototype.replaceall = function (source, target) {
    return this.replace(new RegExp(escapeRegExp(source), 'g'), target);
};

//
// Agrega funcionalidad de borrar items a un array
//
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

//
// Precarga el array de imagenes indicado
//
function preload(arrayOfImages) {
    $(arrayOfImages).each(function () {
        $('<img/>')[0].src = this;
    });
}

$.postify = function (value) {
    var result = {};

    var buildResult = function (object, prefix) {
        for (var key in object) {

            var postKey = isFinite(key)
                ? (prefix !== "" ? prefix : "") + "[" + key + "]"
                : (prefix !== "" ? prefix + "." : "") + key;

            switch (typeof object[key]) {
                case "number": case "string": case "boolean":
                    result[postKey] = object[key];
                    break;

                case "object":
                    if (object[key].toUTCString)
                        result[postKey] = object[key].toUTCString().replace("UTC", "GMT");
                    else {
                        buildResult(object[key], postKey !== "" ? postKey : key);
                    }
            }
        }
    };

    buildResult(value, "");

    return result;
};

function zeroPad(number, digits) {
    var num = number + "";
    while (num.length < digits) {
        num = '0' + num;
    }
    if (num.length > digits) {
        num = num.substr(0, digits);
    }
    return num;
}

function minorDateTime(first, second) {
    return new Date(first).getTime() <= new Date(second).getTime() ? 0 : 1;
}

$.fn.exists = function () {
    return this.length > 0;
};

Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};  

function callFunction(func, pars) {
    if (typeof func === 'function') {
        if (isUndefinedOrEmpty(pars)) {
            func();
        } else {
            func(pars);
        }
    }
}

function callFunc(name, pars) {

    var pals = name.split(".");
    var fn = null; //window[name];

    if (pals.length === 1) {
        fn = window[name];
    } else {
        if (pals.length === 2) {
            fn = window[pals[0]][pals[1]];
        } else {
            fn = window[pals[0]][pals[1]][pals[2]];
        }
    }

    if (typeof fn === "function") {
        if (pars !== undefined) {
            fn(pars);
        } else {
            fn();
        }
    }
}

function newFunc(name, pars) {

    var fr = window[name];
    if (typeof fr !== "function") {
        console.log("newFunc - NO es una funcion. " + name);
        return null;
    }

    return new fr(pars);
}

function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }


}

function downloadJsonFile(data, filename) {

    if (!data) {
        console.error('No data');
        return;
    }

    if (!filename) filename = 'console.json';

    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], { type: 'text/json' });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}

function downloadFileFromUrl(url) {
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');

    a.href = url;
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}