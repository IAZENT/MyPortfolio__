import { CollectionConfig } from 'payload/types';

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'slug' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'slug', type: 'text', required: true },
    { name: 'status', type: 'select', options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }], defaultValue: 'draft' },
    // Simple flexible content: you can replace with Payload Blocks if you want a full page builder
    { name: 'content', type: 'richText' },
    { name: 'showInNav', type: 'checkbox' },
  ],
};

export default Pages;
