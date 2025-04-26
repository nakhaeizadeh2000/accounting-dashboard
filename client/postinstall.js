const fse = require('fs-extra');
const path = require('path');
const topDir = __dirname;
fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
fse.copySync(path.join(topDir, 'node_modules', 'tinymce'), path.join(topDir, 'public', 'tinymce'), { overwrite: true });


//* This script is used to copy the tinymce folder from node_modules to public/tinymce
//* It is run after the installation of the dependencies
//* It is used to make sure that the tinymce folder is always up to date
//* It is run after the installation of the dependencies
// "postinstall": "node ./postinstall.js",
// "postinstall:check": "node ./postinstall.js --check"
