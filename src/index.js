const fs = require('fs');
const path = require('path');
const logger = require('./logger')

let cacache = null;
try {
    cacache = require('cacache');
} catch (e) { }

const options = require(path.resolve('./tarball-helper.config.js'));

const cacachePath = path.resolve(options.cachePath);
const packageLockPath = path.resolve(options.packageLockPath || './package-lock.json');
const packageLock = require(packageLockPath);   // 读取package-lock.json

// collect sub dependencies. 
// When have same name but different version package, will locate in dependency object's dependencies.
function collectSubDepends(dependencies, dependencyKeys) {
    let subDepends = {};
    dependencyKeys.forEach(depName => {
        let depData = dependencies[depName]
        if (depData.dependencies) {
            let subKeys = Object.keys(depData.dependencies);
            subKeys.forEach(subDepName => {
                let subDepData = depData.dependencies[subDepName];
                let subKey = subDepName + '-' + subDepData.version;
                if (!subDepends[subKey]) {
                    subDepends[subKey] = subDepData
                }
            })
        }
    })
    return subDepends;
}

// download one
function downloadDependency(depName, depData) {
    let destName = (depData.resolved || '').split('?')[0].match(/[^/]+$/);
    destName = destName ? destName[0] : `${depName}.tgz`;

    let msg = `parse: [${depName}], write to: [${destName}]`
    console.log(msg);
    logger.log(msg)
    cacache.get.stream.byDigest(cacachePath, depData.integrity).pipe(fs.createWriteStream(`./tgzs/${destName}`));
}

function getTarballs() {    
    if (!cacache) {
        console.log('Note: in order to getTarballs, you should install peer dependencies cacache.');
        return;
    }
    let dependencies = packageLock.dependencies;
    let dependencyKeys = Object.keys(dependencies);

    // sub dependencies
    let subDependencies = collectSubDepends(dependencies, dependencyKeys);
    let subDependencyKeys = Object.keys(subDependencies);

    let total = dependencyKeys.length + subDependencyKeys.length;
    console.log(`total ${total} dependencies, level one: ${dependencyKeys.length}, sub level: ${subDependencyKeys.length}`);
    console.log(`cacachePath ${cacachePath}`)

    // level one
    dependencyKeys.forEach(depName => {
        downloadDependency(depName, dependencies[depName])
    });
    // sub level
    subDependencyKeys.forEach(subDepName => {
        downloadDependency(subDepName, subDependencies[subDepName])
    }) 
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
