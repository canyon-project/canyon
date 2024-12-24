// var adm_zip = require("adm-zip");
import adm_zip from 'adm-zip'
//creating archives
var zip = new adm_zip();
zip.addLocalFolder("./dist");
zip.writeZip("./canyon-extension.zip");