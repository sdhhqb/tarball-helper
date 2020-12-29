const fs = require('fs');
const path = require('path');

let cacache = null;
try {
    cacache = require('cacache');
} catch (e) { }

const options = require(path.resolve('./tarball-helper.config.js'));

const cacachePath = path.resolve(options.cachePath);
const packageLockPath = path.resolve(options.packageLockPath || './package-lock.json');
const packageLock = require(packageLockPath);   // 读取package-lock.json

function getTarballs() {
    if (!cacache) {
        console.log('Note: in order to getTarballs, you should install peer dependencies cacache.');
        return;
    }
    let dependencies = packageLock.dependencies;

    Object.keys(dependencies).forEach(depName => {
        let depData = dependencies[depName];
        let destName = (depData.resolved || '').split('?')[0].match(/[^/]+$/);
        destName = destName ? destName[0] : `${depName}.tgz`;

        console.log(`parse: [${depName}], write to: [${destName}]`);
        cacache.get.stream.byDigest(cacachePath, depData.integrity).pipe(fs.createWriteStream(`./tgzs/${destName}`));
    });
    console.log('finished.');
}

module.exports = function() {
    if (fs.existsSync('./tgzs')) {
        getTarballs();
    } else {
        fs.mkdir('./tgzs', function(err) {
            if (err) {
                console.log('error: create folder failed.');
                return;
            }
            getTarballs();
        })
    }
}
