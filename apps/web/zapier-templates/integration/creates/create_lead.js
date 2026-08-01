// Create action — POST https://integrate.zivvy.xyz/v1/leads

const perform = async (z, bundle) => {
  const body = {};
    if (bundle.inputData.lead_name !== undefined && bundle.inputData.lead_name !== '') body.lead_name = bundle.inputData.lead_name;
  if (bundle.inputData.email_id !== undefined && bundle.inputData.email_id !== '') body.email_id = bundle.inputData.email_id;
  if (bundle.inputData.status !== undefined && bundle.inputData.status !== '') body.status = bundle.inputData.status;
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/leads',
    method: 'POST',
    body,
  });
  return response.data?.data || response.data;
};

module.exports = {
  key: 'create_lead',
  noun: 'Lead',
  display: {
    label: 'Create Lead',
    description: 'Create a lead in Zivvy via REST.',
  },
  operation: {
    inputFields: [
      {
        key: 'lead_name',
        label: 'Lead Name',
        type: 'string',
        required: true,
        
      },
      {
        key: 'email_id',
        label: 'Email',
        type: 'string',
        required: false,
        
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        default: 'Open',
      }
    ],
    perform,
    sample: {
      name: 'SAMPLE-CREATED',
      lead_name: 'Sample',
    },
  },
};
