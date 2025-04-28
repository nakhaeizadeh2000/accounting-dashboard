// const fse = require('fs-extra');
// const path = require('path');
// const topDir = __dirname;
// fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
// fse.copySync(path.join(topDir, 'node_modules', 'tinymce'), path.join(topDir, 'public', 'tinymce'), { overwrite: true });


// postinstall.js
const fs = require('fs-extra');
const path = require('path');

// Define paths
const tinymceSourcePath = path.join(__dirname, 'node_modules', 'tinymce');
const tinymceDestPath = path.join(__dirname, 'public', 'tinymce');

// Ensure destination directory exists and is empty
try {
  // Check if tinymce is installed
  if (!fs.existsSync(tinymceSourcePath)) {
    console.error(
      'TinyMCE is not installed. Please run: npm install tinymce @tinymce/tinymce-react',
    );
    process.exit(1);
  }

  // Create public directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
  }

  // Empty the destination directory if it exists
  if (fs.existsSync(tinymceDestPath)) {
    fs.emptyDirSync(tinymceDestPath);
  } else {
    fs.mkdirSync(tinymceDestPath, { recursive: true });
  }

  // Copy TinyMCE files to public directory
  fs.copySync(tinymceSourcePath, tinymceDestPath, { overwrite: true });
  console.log('TinyMCE files copied to public directory successfully!');
} catch (error) {
  console.error('Error copying TinyMCE files:', error);
  process.exit(1);
}


/* This script is used to copy the tinymce folder from node_modules to public/tinymce
It is run after the installation of the dependencies
It is used to make sure that the tinymce folder is always up to date
It is run after the installation of the dependencies */

//? "postinstall": "node ./postinstall.js",
//? "postinstall:check": "node ./postinstall.js --check"
