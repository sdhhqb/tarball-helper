# tarball-helper

A tool help get npm package tarballs from cache. Can help nexus servers without internet connection to update packages.

## usage

1. create empty project, install tarball-helper package
```bash
npm install tarball-helper -D
# install peerDependencies
npm install cacache -D
```

2. create config file `tarball-helper.config.js`
```js
// windows path style
module.exports = {
  // cacache folder, use 'npm config get cache' to find
  cachePath: "C:\\Users\\Administrator\\AppData\\Roaming\\npm-cache\\_cacache", 
  // package-lock.json path of target project
  packageLockPath: "D:\\test\\target-project\\package-lock.json"
};
```

3. add scripts
```js
scripts: {
  "get-tarball": "tarball-helper"
}
```


*note: only tested for npm v6.x on node v12.x
