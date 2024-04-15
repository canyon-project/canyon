const ejs = require('ejs');
const fs = require('fs');
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 定义模版name
const name = 'usage';

const arr = ['model', 'module', 'resolver', 'service'];
for (let i = 0; i < arr.length; i++) {
  try {
    const a = arr[i];
    const organizationModel = fs.readFileSync(
      `./gen/template/organization.${a}.ejs`,
      'utf8',
    );

    const template = ejs.compile(organizationModel, {});
    fs.mkdirSync(`./gen/${name}`, { recursive: true });

    fs.writeFileSync(
      `./gen/${name}/${name}.${a}.ts`,
      template({
        dname: `${capitalizeFirstLetter(name)}`,
        xname: `${name}`,
      }),
    );
    console.log('123');
  } catch (e) {
    // console.log(e)
  }
}
