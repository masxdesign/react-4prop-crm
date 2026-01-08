// Street-post specific field configurations

// Editable fields with revision support
export const STREET_POST_EDITABLE_FIELDS = [
  { name: 'demographic', label: 'Demographic', minRows: 3, remixable: true, editable: true },
  { name: 'description', label: 'Description', minRows: 4, remixable: true, editable: true },
];

// Preview fields (includes non-editable input fields)
// remixable fields will display selected version from revision history
export const STREET_POST_PREVIEW_FIELDS = [
  { name: 'postcode', label: 'Postcode' },
  { name: 'street', label: 'Street' },
  { name: 'demographic', label: 'Demographic', remixable: true },
  { name: 'description', label: 'Description', remixable: true },
];

// Job type configuration for JobsList
export const STREET_POST_JOB_CONFIG = {
  type: 'street_post',
  remixType: 'street_post_remix',
  displayName: 'street post job',
  pluralName: 'street post jobs',
  getTitle: (job) => job ? `${job.input_data?.postcode} - ${job.input_data?.street}` : '',
  getDescription: () => 'View and edit job output for this street post',
  getRelatedJobsKey: (job) => job ? {
    postcode: job.input_data?.postcode,
    street: job.input_data?.street,
  } : {},
};
