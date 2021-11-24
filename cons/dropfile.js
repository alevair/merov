function Dropfile(pars) {
    var self = this;
    this.pars = pars;

    this.init = function () {
        self.dat = {
            title: ioaux.setOrDefault(self.pars.title, ""),
            description: ioaux.setOrDefault(self.pars.description, ""),
            alert: ioaux.setOrDefault(self.pars.alert, "")
        };
    };

    this.render = function (apply) {

        var h = $('#' + self.pars.def.template).html();

        var dat = {
            id: self.pars.ide,
            title: self.dat.title,
            description: self.dat.description,
            alert: self.dat.alert
        };

        var res = Mustache.render(h, dat);
        if (apply) {
            self.eform(self.pars.ide).replaceWith(res);

            //if (isFunc(self.pars.onclick)) {

            //console.log(self.pars.ide);

            //}

            let drop = self.eform(self.pars.ide).get(0);

            self.eform(self.pars.ide).on("click", function (e) {
                self.eform(self.pars.ide + "_fileinput").get(0).click();
                //e.data.elem.click();
            });

            drop.addEventListener("dragover", function (e) {
                e.preventDefault();

                e.dataTransfer.dropEffect = 'move';
                self.eform(self.pars.ide).attr("drop-active", true);
            });
            drop.addEventListener("dragleave", function (e) {
                self.eform(self.pars.ide).removeAttr("drop-active");
            });
            drop.addEventListener("drop", function (e) {

                self.eform(self.pars.ide).removeAttr("drop-active");
                e.preventDefault();

                let files = [];

                if (e.dataTransfer.items) {
                    for (let i = 0; i < e.dataTransfer.items.length; i++) {
                        // If dropped items aren't files, reject them
                        if (e.dataTransfer.items[i].kind === 'file') {
                            let file = e.dataTransfer.items[i].getAsFile();
                            files.push(file);
                        }
                    }
                } else {
                    // Use DataTransfer interface to access the file(s)
                    for (let i = 0; i < e.dataTransfer.files.length; i++) {
                        let file = e.dataTransfer.files[i];
                        files.push(file);
                    }
                }

                self.chekvalid(files);

                if (isFunc(self.pars.onselect)) {
                    self.pars.onselect(self, files);
                }
            });
            self.eform(self.pars.ide + "_fileinput").on("change", function (e) {
                if (isFunc(self.pars.onselect)) {
                    self.pars.onselect(self, this.files);
                }
            });
        }

        return res;
    };

    this.chekvalid = function (files) {

    };

    this.eform = function (id) {
        return RuleBase.eform(self.pars.parent.idform, id);
    };
}