// Street-post specific field configurations

// Editable fields with revision support (draft-based)
// All 6 content fields are now editable with revision history
// inputType: 'input' renders as single-line input, otherwise textarea
export const STREET_POST_EDITABLE_FIELDS = [
  { name: 'title', label: 'Title', inputType: 'input', remixable: false, editable: true },
  { name: 'meta_description', label: 'Meta Description', minRows: 2, remixable: false, editable: true },
  { name: 'area', label: 'Area', inputType: 'input', remixable: false, editable: true },
  { name: 'coordinates', label: 'Coordinates', inputType: 'map', remixable: false, editable: true },
  { name: 'demographic', label: 'Demographic', minRows: 3, remixable: true, editable: true },
  { name: 'description', label: 'Description', minRows: 4, remixable: true, editable: true },
];

// Preview fields (includes non-editable input fields)
// remixable fields will display selected version from revision history
// displayType: 'title' renders as h1, 'map' renders as map component
export const STREET_POST_PREVIEW_FIELDS = [
  { name: 'title', label: 'Title', displayType: 'title' },
  { name: 'coordinates', label: 'Coordinates', displayType: 'map' },
  { name: 'postcode', label: 'Postcode' },
  { name: 'area', label: 'Area' },
  { name: 'street', label: 'Street' },
  { name: 'meta_description', label: 'Meta Description' },
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
