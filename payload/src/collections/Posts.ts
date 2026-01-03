import { CollectionConfig } from 'payload/types';

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  timestamps: true,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    },
    { name: 'publishedAt', type: 'date' },
    { name: 'featured', type: 'checkbox' },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'excerpt', type: 'text' },
    { name: 'content', type: 'richText' },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'categories', type: 'text', hasMany: true },
  ],
};

export default Posts;
