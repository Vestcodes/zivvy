// Create action — POST https://integrate.zivvy.xyz/v1/tasks

const perform = async (z, bundle) => {
  const body = {};
    if (bundle.inputData.subject !== undefined && bundle.inputData.subject !== '') body.subject = bundle.inputData.subject;
  if (bundle.inputData.project !== undefined && bundle.inputData.project !== '') body.project = bundle.inputData.project;
  if (bundle.inputData.status !== undefined && bundle.inputData.status !== '') body.status = bundle.inputData.status;
  if (bundle.inputData.priority !== undefined && bundle.inputData.priority !== '') body.priority = bundle.inputData.priority;
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/tasks',
    method: 'POST',
    body,
  });
  return response.data?.data || response.data;
};

module.exports = {
  key: 'create_task',
  noun: 'Project Event',
  display: {
    label: 'Create Project Event',
    description: 'Create a project event in Zivvy via REST.',
  },
  operation: {
    inputFields: [
      {
        key: 'subject',
        label: 'Subject',
        type: 'string',
        required: true,
        
      },
      {
        key: 'project',
        label: 'Project',
        type: 'string',
        required: false,
        
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        default: 'Open',
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'string',
        required: false,
        
      }
    ],
    perform,
    sample: {
      name: 'SAMPLE-CREATED',
      subject: 'Sample',
    },
  },
};
