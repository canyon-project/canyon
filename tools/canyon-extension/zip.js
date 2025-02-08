import adm_zip from "adm-zip";

const zip = new adm_zip();
zip.addLocalFolder("./dist");
console.log("Zipping...");
zip.writeZip("./canyon-extension.zip");
console.log("Zipped!");
