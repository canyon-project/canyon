// var adm_zip = require("adm-zip");
import adm_zip from 'adm-zip';
//creating archives
const zip = new adm_zip();
zip.addLocalFolder('./dist');
zip.writeZip('./canyon-extension.zip');
