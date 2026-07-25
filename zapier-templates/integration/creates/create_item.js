// Create action — POST https://integrate.zivvy.xyz/v1/items

const perform = async (z, bundle) => {
  const body = {};
    if (bundle.inputData.item_code !== undefined && bundle.inputData.item_code !== '') body.item_code = bundle.inputData.item_code;
  if (bundle.inputData.item_name !== undefined && bundle.inputData.item_name !== '') body.item_name = bundle.inputData.item_name;
  if (bundle.inputData.item_group !== undefined && bundle.inputData.item_group !== '') body.item_group = bundle.inputData.item_group;
  if (bundle.inputData.stock_uom !== undefined && bundle.inputData.stock_uom !== '') body.stock_uom = bundle.inputData.stock_uom;
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/items',
    method: 'POST',
    body,
  });
  return response.data?.data || response.data;
};

module.exports = {
  key: 'create_item',
  noun: 'Stock Event',
  display: {
    label: 'Create Stock Event',
    description: 'Create a stock event in Zivvy via REST.',
  },
  operation: {
    inputFields: [
      {
        key: 'item_code',
        label: 'Item Code',
        type: 'string',
        required: true,
        
      },
      {
        key: 'item_name',
        label: 'Item Name',
        type: 'string',
        required: false,
        
      },
      {
        key: 'item_group',
        label: 'Item Group',
        type: 'string',
        required: true,
        default: 'Products',
      },
      {
        key: 'stock_uom',
        label: 'Default UOM',
        type: 'string',
        required: true,
        default: 'Nos',
      }
    ],
    perform,
    sample: {
      name: 'SAMPLE-CREATED',
      item_code: 'Sample',
    },
  },
};
