//
// Deployver - fast deployment for anything
// @link: http://github.com/noroot/deployver/


// Dependencies

var Exec = require('child_process').exec;
var Util = require('util');
var Promise = require('promise');
var Colors = require('colors');

var Deployver = function(config) {

    this.config = config || {};
    this.releaseDir = false;

    this.log = function(str) {
        console.log(str.green)
    }

    this.debug = function(str) {
        if (this.config.debug) {
            console.log(str.yellow);
        }
    }

    this.exec = function(cmd) {

        var promise = new Promise(function(resolve, reject) {
            Exec(cmd, function(err, stdout, stderr) {
                if (stderr) resolve(stderr);

                if (err) reject(err)
                else resolve(stdout);
            });
        });
        return promise;
    }

    this.getReleaseDir = function() {
        return this.releaseDir;
    }

    this.setReleaseDir = function() {
        var d = new Date();

        this.releaseDir =
            d.getUTCFullYear().toString() +
            (d.getUTCMonth() + 1).toString() +
            d.getUTCDate().toString() +
            d.getUTCHours().toString() +
            d.getUTCMinutes().toString() +
            d.getUTCSeconds().toString() +
            d.getUTCMilliseconds().toString();

        return this.releaseDir;
    }
}


Deployver.prototype.deploy = function() {

    var self = this;
    var cmd = Util.format('ssh %s "cd %s/releases/ && mkdir %s"',
                          this.config.ssh,
                          this.config.paths.remote,
                          this.setReleaseDir());

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
        self.copy();
        self.link(self.getReleaseDir());
        self.rotate();
    }, function(err) {
        self.log(err);
    });
}

Deployver.prototype.copy = function() {

    var self = this;

    var cmd = Util.format("scp -rv %s %s:%s/releases/%s/",
                          this.config.paths.local,
                          this.config.ssh,
                          this.config.paths.remote,
                          this.getReleaseDir());

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
    }, function(err) {
        self.log(err);
    });
}

Deployver.prototype.init = function() {

    var self = this;
    var cmd = Util.format('ssh %s "cd %s && mkdir releases shared tmp"',
                          this.config.ssh,
                          this.config.paths.remote);

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
        self.log(result.red);
    }, function(err) {
        self.debug(err);
    });
}




Deployver.prototype.rotate = function() {

    var self = this;
    var cmd = Util.format('ssh %s "cd %s/releases && ls"',
                          this.config.ssh,
                          this.config.paths.remote);

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {

        var releases = result.split(/\n/g);
        releases = releases.filter(function(x) { if (x == '') return false; else return x; });
        
        if (releases.length > self.config.keep) {
            releases = releases.sort().reverse();
            toRemove = releases.slice(self.config.keep);

            var removeCmd = Util.format('ssh %s "cd %s/releases && rm -rv %s"',
                                        self.config.ssh,
                                        self.config.paths.remote,
                                        toRemove.join(" ")
                                       );

            self.log('Exec ' + removeCmd);
            self.exec(removeCmd).then(function(result) {
                self.log(result);
            }, function(err){
                self.log(err)
            });
        }
        
    }, function(err) {
        self.debug(err);
    });
}


Deployver.prototype.rollback = function() {
    
    var self = this;
    var cmd = Util.format('ssh %s "cd %s/releases && ls"',
                          this.config.ssh,
                          this.config.paths.remote);

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
        var releases = result.split(/\n/g);
        releases = releases.filter(function(x) { if (x == '') return false; else return x; });
        if (releases.length >= 2 ) {
            
            releases = releases.sort().reverse();
            currentRelease = releases[0];
            toRollback = releases[1];
            console.log(releases);
            self.link(toRollback);
            self.remove(currentRelease);
            self.log('Rolling back to ' + toRollback);
        } else {
            self.log('No rollback possible');
        }
        
    }, function(err) {
        self.debug(err);
    });
}


Deployver.prototype.remove = function(release) {

    var self = this;
    var cmd = Util.format('ssh %s "cd %s/releases && rm -rv %s"',
                          this.config.ssh,
                          this.config.paths.remote,
                          release
                         );

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
        this.log(result);
    }, function(err) {
        this.log(err);
    });
}



Deployver.prototype.link = function(release) {

    var self = this;
    var cmd = Util.format('ssh %s "cd %s && rm current &&ln -s releases/%s current"',
                          this.config.ssh,
                          this.config.paths.remote,
                          release
                         );

    this.log('Exec ' + cmd);
    this.exec(cmd).then(function(result) {
        this.log(result);
    }, function(err) {
        this.log(err);
    });
}

module.exports = function(config) {
    return new Deployver(config);
}

