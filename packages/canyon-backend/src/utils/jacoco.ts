import { transform } from 'camaro';
const counterTemplate = [
  'counter',
  {
    type: '@type',
    missed: 'number(@missed)',
    covered: 'number(@covered)',
  },
];

const template = [
  'report',
  {
    report: {
      name: '@name',
      package: [
        'package',
        {
          name: '@name',
          class: [
            'class',
            {
              name: '@name',
              sourcefilename: '@sourcefilename',
              counter: counterTemplate,
              method: [
                'method',
                {
                  name: '@name',
                  desc: '@desc',
                  line: '@line',
                  counter: counterTemplate,
                },
              ],
            },
          ],
          sourcefile: [
            'sourcefile',
            {
              name: '@name',
              line: [
                'line',
                {
                  nr: 'number(@nr)',
                  mi: 'number(@mi)',
                  ci: 'number(@ci)',
                  mb: 'number(@mb)',
                  cb: 'number(@cb)',
                },
              ],
              counter: counterTemplate,
            },
          ],
          counter: counterTemplate,
        },
      ],
      counter: counterTemplate,
    },
  },
];
export const jacocoXml2Json = (xml) => {
  return transform(xml, template).then((r) => r[0]);
};
