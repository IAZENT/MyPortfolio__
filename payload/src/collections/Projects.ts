import { CollectionConfig } from 'payload/types';

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title' },
  timestamps: true,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', admin: { readOnly: true } },
    { name: 'description', type: 'richText' },
    {
      name: 'screenshots',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    { name: 'tech', type: 'text', hasMany: true },
    { name: 'githubUrl', type: 'text' },
    { name: 'featured', type: 'checkbox' },
    { name: 'year', type: 'number' },
  ],
};

export default Projects;
