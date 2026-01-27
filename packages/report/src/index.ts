import {ReportBase} from 'istanbul-lib-report'

export default class CustomReporter extends ReportBase {
  constructor() {
    super();
  }

  onStart(_root, _context) {
  }

  onDetail(node) {
    console.log('onDetail')
  }

  async onEnd(_rootNode, context) {
    console.log('onEnd')
  }
};
