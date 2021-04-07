var iobootpak = new function () {

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

    this.load_html = function (url, fdone) {



        var mem = document.createElement("div");
        mem.load(url, function () {

            fdone(mem.html());
        });
    };
};

var app = [];
var config = init_pak + "/app.json";

document.addEventListener("DOMContentLoaded", function (event) {

    fetch(init_pak + "/index.html")
        .then((response) => response.text())
        .then((html) => {
            document.open();
            document.write(html);
            document.close();

            iobootpak.load_js("merov/libs/ioboot.js", function () {
                ioboot.start();
            });

        })
        .catch((error) => {
            console.warn(error);
        });

    //config = init_pak + "/app.json";
});
