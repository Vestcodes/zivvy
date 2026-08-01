// Create action — POST https://integrate.zivvy.xyz/v1/employees

const perform = async (z, bundle) => {
  const body = {};
    if (bundle.inputData.first_name !== undefined && bundle.inputData.first_name !== '') body.first_name = bundle.inputData.first_name;
  if (bundle.inputData.last_name !== undefined && bundle.inputData.last_name !== '') body.last_name = bundle.inputData.last_name;
  if (bundle.inputData.gender !== undefined && bundle.inputData.gender !== '') body.gender = bundle.inputData.gender;
  if (bundle.inputData.date_of_joining !== undefined && bundle.inputData.date_of_joining !== '') body.date_of_joining = bundle.inputData.date_of_joining;
  if (bundle.inputData.date_of_birth !== undefined && bundle.inputData.date_of_birth !== '') body.date_of_birth = bundle.inputData.date_of_birth;
  if (bundle.inputData.company !== undefined && bundle.inputData.company !== '') body.company = bundle.inputData.company;
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/employees',
    method: 'POST',
    body,
  });
  return response.data?.data || response.data;
};

module.exports = {
  key: 'create_employee',
  noun: 'HR Event',
  display: {
    label: 'Create HR Event',
    description: 'Create a hr event in Zivvy via REST.',
  },
  operation: {
    inputFields: [
      {
        key: 'first_name',
        label: 'First Name',
        type: 'string',
        required: true,
        
      },
      {
        key: 'last_name',
        label: 'Last Name',
        type: 'string',
        required: false,
        
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'string',
        required: true,
        default: 'Other',
      },
      {
        key: 'date_of_joining',
        label: 'Date of Joining',
        type: 'string',
        required: true,
        
      },
      {
        key: 'date_of_birth',
        label: 'Date of Birth',
        type: 'string',
        required: true,
        
      },
      {
        key: 'company',
        label: 'Company',
        type: 'string',
        required: true,
        
      }
    ],
    perform,
    sample: {
      name: 'SAMPLE-CREATED',
      first_name: 'Sample',
    },
  },
};
