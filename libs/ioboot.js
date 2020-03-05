var ioboot = new function () {

    this.boot = function (filename, fdone) {
        ioboot.get_json(filename, function (json) {
            ioboot.load_libs_rec(json.boot, 0, function () {
                ioboot.start_rules(json.boot, function () {
                    fdone(json);
                });
            });
        });
    };

    this.post = function (filename, fdone) {
        ioboot.get_json(filename, function (json) {
            ioboot.load_libs_rec(json.post, 0, function () {
                if (isFunc(fdone)) {
                    fdone(json);
                }
            });
        });
    };

    this.load_libs_rec = function (elem, index, fdone) {
        if (index >= elem.libs.length) {
            fdone();
            return;
        }

        var progress = app.settings.libsindex++ / app.settings.libscount * 100;
        var progressbar = document.getElementById("bar");
        progressbar.value = Math.round(progress);

        var lib = elem.libs[index];
        var surl = elem.base + lib.source + "?ver=" + app.settings.ver;

        switch (lib.tipo) {
            case "js":
                ioboot.load_js(surl, function () {
                    ioboot.load_libs_rec(elem, index + 1, fdone);
                });
                break;

            case "css":
                ioboot.load_css(surl, function () {
                    ioboot.load_libs_rec(elem, index + 1, fdone);
                });
                break;

            case "img":
                ioboot.preload_image(surl, function () {
                    ioboot.load_libs_rec(elem, index + 1, fdone);
                });
                break;

            case "html":
                ioboot.preload_html(surl, function () {
                    ioboot.load_libs_rec(elem, index + 1, fdone);
                });
                break;

            case "template":
                ioboot.load_template(surl, function () {
                    ioboot.load_libs_rec(elem, index + 1, fdone);
                });
                break;
        }
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

    // Carga dinamicamente un archivo .js
    this.load_js = function (url, fdone) {
        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    if (fdone !== null) fdone();
                }
            };
        } else {  //Others
            script.onload = function () {
                if (fdone !== null) fdone();
            };
        }

        script.src = url;
        document.head.appendChild(script);
    };

    // Carga dinamicamente un archivo .css
    this.load_css = function (url, fdone) {

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";

        if (fdone !== null) {
            if (link.readyState) {
                link.onreadystatechange = function () {
                    if (link.readyState === "loaded" || link.readyState === "complete") {
                        link.onreadystatechange = null;
                        if (fdone !== null) fdone();
                    }
                };
            }
            else {
                link.onload = function () {
                    if (fdone !== null) fdone();
                };
            }
        }

        link.href = url;
        document.head.appendChild(link);
    };

    this.preload_image = function (url, fdone) {

        var image = new Image();
        image.onload = function () {
            fdone();
        };
        image.src = url;
    };

    this.load_template = function (url, fdone) {

        var div = document.getElementById("templates");

        if (div === null) {
            div = document.createElement("div");
            div.style = "display:none";
            div.id = "templates";
            document.body.appendChild(div);
        }

        fetch(url)
            .then((response) => response.text())
            .then((html) => {
                div.innerHTML += html;
                fdone();
            })
            .catch((error) => {
                fdone(error);
            });
    };

    this.preload_html = function (url, fdone) {
        var mem = $('<div>');
        mem.load(url, function () {

            fdone(mem.html());
        });
    };

    this.start_rules = function (elem, fdone) {

        if (elem.rules.length > 0) {
            for (var l1 = 0; l1 < elem.rules.length; l1++) {
                var regla = elem.rules[l1];

                if (typeof window[regla.class] === 'function') {

                    if (regla.name.indexOf(".") !== -1) {

                        var names = regla.name.split(".");
                        if (names.length === 2) {
                            if (app[names[0]] === undefined) {
                                app[names[0]] = [];
                            }
                            let rule = new window[regla.class]();
                            app[names[0]][names[1]] = rule;
                            app[names[0]][names[1]].document_ready();
                            app.rules.push(rule);
                        } else {
                            alert("Error iniciando clase: " + regla.class + " ,nombre: " + regla.name);
                        }
                    } else {
                        let rule = new window[regla.class]();
                        app[regla.name] = rule;
                        app[regla.name].document_ready();
                        app.rules.push(rule);
                    }
                } else {
                    alert("Error iniciando clase: " + regla.class + " ,nombre: " + regla.name);
                }
            }
        }
        fdone();
    };

    this.queryString = function () {
        var result = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
        while (m = re.exec(queryString)) {
            result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return result;
    };

    // Este metodo realiza la carga inicial de todos los paquetes, incluyendo el del proyecto
    // y luego inicializa la carga de los recursos e inicializacion del framework
    this.start = function () {
        let parconfig = ioboot.getQueryString()["config"];
        app.global = {
            fileconfig: parconfig !== undefined ? parconfig : (window.config !== undefined ? window.config : "config.json"),
            accesos: []
        };
        app.dat = {
            usuario: null
        };

        app.rules = [];

        ioboot.get_json(app.global.fileconfig + "?dtime=" + (new Date()).getTime(), function (json) {
            app.settings = json;

            let paks = json.packages;
            app.settings.packages = [];

            let pak = {
                name: "base",
                sets: json,
                base : ""
            };
            app.settings.packages.push(pak);

            /*
            // Si no especificamos archivo de boot
            if (pak.sets.boot === undefined) {
                pak.sets.boot = {
                    boot: {
                        libs: []
                    },
                    post: {
                        libs: []
                    }
                };
            }
            */
            /*
{
    "boot": {
        "libs": [
            {
                "tipo": "css",
                "source": "afont/css/all.css"
            }
        ],
        "rules": [
        ]
    },

    "post": {
        "libs": [
        ]
    }
             
             */

            ioboot.load_pakdef(pak, 0, function () {

                // Inicializamos y cargamos todos los packages
                ioboot.init_pak(paks, 0, function () {

                    app.settings.libsindex = 0;
                    app.settings.libscount = 0;
                    for (let l1 = 0; l1 < app.settings.packages.length; l1++) {
                        app.settings.libscount += app.settings.packages[l1].boot.libs.length;
                    }
                    
                    ioboot.load_pakres(0, function () {
                        app.dat.menu = {
                            options: [],
                            backup: []
                        };

                        app.dat.forms = {
                            tems: [],
                            get: function (pars) {
                                for (let l1 = 0; l1 < app.dat.forms.tems.length; l1++) {
                                    if (pars.name !== undefined) {
                                        if (app.dat.forms.tems[l1].name === pars.name) {
                                            return app.dat.forms.tems[l1];
                                        }
                                    }
                                    if (pars.model !== undefined && pars.type !== undefined) {
                                        if (app.dat.forms.tems[l1].model === pars.model && app.dat.forms.tems[l1].type === pars.type) {
                                            return app.dat.forms.tems[l1];
                                        }                                        
                                    }
                                }
                                return null;
                            }
                        };
                        app.dat.fulls = {
                            tems: [],
                            get: function (pars) {
                                for (let l1 = 0; l1 < app.dat.fulls.tems.length; l1++) {
                                    if (pars.name !== undefined) {
                                        if (app.dat.fulls.tems[l1].name === pars.name) {
                                            return app.dat.fulls.tems[l1];
                                        }
                                    }
                                }
                                return null;
                            }
                        };
                        app.dat.controls = {
                            tems: [],
                            get: function (name) {
                                for (let l1 = 0; l1 < app.dat.controls.tems.length; l1++) {
                                    if (app.dat.controls.tems[l1].name === name) {
                                        return app.dat.controls.tems[l1];
                                    }
                                }
                                return null;
                            }
                        };


                        // Iniciamos y unificamos forms, fulls, controls y menues
                        for (let l1 = 0; l1 < app.settings.packages.length; l1++) {
                            let pak = app.settings.packages[l1];

                            if (!isUndefinedOrEmpty(pak.forms)) {
                                for (let l1 = 0; l1 < pak.forms.length; l1++) {
                                    let form = pak.forms[l1];
                                    form.package = pak;
                                    app.dat.forms.tems.push(form);
                                }
                            }

                            if (!isUndefinedOrEmpty(pak.fulls)) {
                                for (let l1 = 0; l1 < pak.fulls.length; l1++) {
                                    let full = pak.fulls[l1];
                                    full.package = pak;
                                    app.dat.fulls.tems.push(full);
                                }
                            }

                            /*
                            app.dat.fulls.get = function (name) {
                                for (let l1 = 0; l1 < app.dat.fulls.tems.length; l1++) {
                                    if (app.dat.fulls.tems[l1].nombre === name) {
                                        return app.dat.fulls.tems[l1];
                                    }
                                }
                                return null;
                            };
                            */

                            if (pak.controls !== null) {
                                for (let l2 = 0; l2 < pak.controls.length; l2++) {
                                    app.dat.controls.tems.push(pak.controls[l2]);
                                }
                            }

                            if (pak.menu !== null) {
                                for (let l2 = 0; l2 < pak.menu.options.length; l2++) {
                                    app.dat.menu.options.push(pak.menu.options[l2]);
                                    app.dat.menu.backup.push(pak.menu.options[l2]);
                                }
                            }
                        }

                        let pak = app.settings.packages[0];
                        var fn = app.settings.main !== undefined ? window[app.settings.main] :  window[pak.boot.main];
                        if (typeof fn === "function") fn();

                    });
                });
            });
        });

        this.load_pakres = function (index, fdone) {

            if (index > app.settings.packages.length - 1) {
                fdone();
                return;
            }
            let pak = app.settings.packages[index];

            ioboot.load_libs_rec(pak.boot, 0, function () {
                ioboot.start_rules(pak.boot, function () {
                    ioboot.load_pakres(index + 1, fdone);
                });
            });
        };

        this.init_pak = function (paks, index, fdone) {

            if (index > paks.length - 1) {
                fdone();
                return;
            }

            let pak = {
                name: paks[index],
                base: paks[index] + "/"
            };
            app.settings.packages.push(pak);

            ioboot.get_json(pak.base + "config.json?ver=" + app.settings.ver, function (json) {
                pak.sets = json;

                // Inicializamos y cargamos todos los packages
                ioboot.load_pakdef(pak, 0, function () {

                    // Cargamos recursivamente todos los packages
                    ioboot.init_pak(paks, index + 1, fdone);
                });
            });

        };

        // Carga todas las definiciones del paquete, tiene que estar previamente cargado el archivo de seteos
        this.load_pakdef = function (pak, index, fdone) {

            switch (index) {
                case 0:
                    // Cargamos la definition del boot
                    if (pak.sets.boot !== undefined) {
                        ioboot.get_json(pak.base + pak.sets.boot + "?ver=" + app.settings.ver, function (json) {
                            pak.boot = json.boot;
                            pak.boot.base = pak.base;
                            if (json.post !== undefined) {
                                pak.post = json.post;
                                pak.post.base = pak.base;
                            }
                            ioboot.load_pakdef(pak, index + 1, fdone);
                        });
                    } else {
                        pak.boot = {
                            base: pak.base,
                            libs: [],
                            rules: []
                        };
                        pak.post = {
                            base: pak.base,
                            libs: []
                        };
                        ioboot.load_pakdef(pak, index + 1, fdone);
                    }
                    break;

                case 1:
                    // Cargamos la definicion de controles
                    if (pak.sets.controls !== undefined) {
                        ioboot.get_json(pak.base + pak.sets.controls + "?ver=" + app.settings.ver, function (json) {
                            pak.controls = json.controls;
                            ioboot.load_pakdef(pak, index + 1, fdone);
                        });
                    } else {
                        pak.controls = null;
                        ioboot.load_pakdef(pak, index + 1, fdone);

                    }
                    break;

                case 2:
                    // Cargamos la definicion de formularios
                    if (pak.sets.forms !== undefined) {
                        ioboot.get_json(pak.base + pak.sets.forms + "?ver=" + app.settings.ver, function (json) {
                            pak.forms = json.forms;
                            pak.fulls = json.fulls;
                            ioboot.load_pakdef(pak, index + 1, fdone);
                        });
                    } else {
                        pak.forms = null;
                        ioboot.load_pakdef(pak, index + 1, fdone);
                    }
                    break;

                case 3:
                    // Cargamos la definicion de menu
                    if (pak.sets.menu !== undefined) {
                        ioboot.get_json(pak.base + pak.sets.menu + "?ver=" + app.settings.ver, function (json) {
                            pak.menu = json;
                            ioboot.load_pakdef(pak, index + 1, fdone);
                        });
                    } else {
                        pak.menu = { options: [] };
                        ioboot.load_pakdef(pak, index + 1, fdone);
                    }
                    break;

                case 4:
                    fdone();
                    return;
            }
        };


    };

    this.getQueryString = function () {
        var result = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
        while (m = re.exec(queryString)) {
            result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return result;
    };
};


document.addEventListener("DOMContentLoaded", function (event) {
    ioboot.start();
});


var app = [];
