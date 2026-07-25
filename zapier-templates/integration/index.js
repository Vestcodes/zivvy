const authentication = require('./authentication');
const { includeApiKey } = require('./middleware');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [includeApiKey],

  triggers: {
  crm_lead_created: require('./triggers/crm_lead_created'),
  sales_order_submitted: require('./triggers/sales_order_submitted'),
  billing_invoice: require('./triggers/billing_invoice'),
  purchasing_po: require('./triggers/purchasing_po'),
  stock_movement: require('./triggers/stock_movement'),
  banking_transaction: require('./triggers/banking_transaction'),
  hr_people: require('./triggers/hr_people'),
  projects_tasks: require('./triggers/projects_tasks'),
  manufacturing: require('./triggers/manufacturing'),
  support_ticket: require('./triggers/support_ticket')
  },

  creates: {
  create_lead: require('./creates/create_lead'),
  create_item: require('./creates/create_item'),
  create_employee: require('./creates/create_employee'),
  create_task: require('./creates/create_task')
  },

  searches: {},
};

module.exports = App;
