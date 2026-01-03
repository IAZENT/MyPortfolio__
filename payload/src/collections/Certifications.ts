import { CollectionConfig } from 'payload/types';

const Certifications: CollectionConfig = {
  slug: 'certifications',
  admin: {
    useAsTitle: 'name',
  },
  timestamps: true,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'org', type: 'text' },
    { name: 'year', type: 'number' },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload PDF certificate. A PDF extractor (optional) can parse metadata and populate name/org/year automatically.',
      },
    },
    { name: 'credentialId', type: 'text' },
    { name: 'verificationUrl', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
};

export default Certifications;
