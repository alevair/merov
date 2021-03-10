var ioserver = new function () {

    this.getDummyFile = function (pars, fdone) {

        if (pars.dummydata !== null && pars.dummydata !== undefined) {
            fdone(pars.dummydata);
        } else {
            fetch(pars.dummyfilename)
                .then(res => res.json())
                .then(data => {
                    pars.filedata = data;
                    fdone(data);
                });
        }
    };

    this.getDummy = function (url, verb, pars, fsuccess, ferror) {
        var urls = url.split('?');
        url = urls[0];

        ioserver.getDummyFile(pars, function (json) {

            var res = json.results.correcto;
            var nombre = url;
            for (var l1 = 0; l1 < json.servicios.length; l1++) {
                var ser = json.servicios[l1];
                if (ser.nombre === nombre && ser.verb === verb) {
                    res.Elementos = ser.Elementos;
                    fsuccess(res);
                    return;
                }
            }

            json.results.error.Mensaje = "dummy no encontrado: " + url + " " + verb;
            ferror(json.results.error);
            return;
        });
    };

    this.get = function (url, fsuccess, ferror, pars) {

        let headers = pars !== undefined ? pars.headers : undefined;

        fetch(url, {
            headers: headers
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                fsuccess(data);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };

    this.getraw = function (url, fsuccess, ferror, pars) {

        let headers = pars !== undefined ? pars.headers : undefined;

        fetch(url, {
            headers: headers
        })
            .then(response => {
                return response.arrayBuffer();
            })
            .then(data => {
                var arraydata = new Uint8Array(data);

                fsuccess(arraydata);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };

    this.post = function (url, data, fsuccess, ferror, pars) {

        let headers = pars !== undefined ? pars.headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        fetch(url, {
            method: "POST",
            body: data,
            headers: headers
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                fsuccess(data);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };

    this.postfile = function (url, data, fsuccess, ferror, pars) {

        let headers = pars !== undefined ? pars.headers : undefined;

        fetch(url, {
            method: "POST",
            headers: headers,
            body: data
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                fsuccess(data);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };

    this.put = function (url, data, fsuccess, ferror, pars) {

        let headers = pars !== undefined ? pars.headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        fetch(url, {
            method: "PUT",
            body: data,
            headers: headers
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                fsuccess(data);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };

    this.delete = function (url, data, fsuccess, ferror, pars) {
        let headers = pars !== undefined ? pars.headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        fetch(url, {
            method: "DELETE",
            body: data,
            headers: headers
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                fsuccess(data);
            })
            .catch(err => {
                console.log(err);
                ferror(err);
            });
    };
};