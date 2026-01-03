import { CollectionConfig } from 'payload/types';
import path from 'path';

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: path.resolve(process.cwd(), 'uploads'),
    // imageSizes are optional; Cloudinary would replace this if you use Cloudinary adapter
    imageSizes: [
      { name: 'desktop', width: 1920 },
      { name: 'medium', width: 1024 },
      { name: 'thumb', width: 320 },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
    { name: 'tags', type: 'text', hasMany: true },
  ],
};

export default Media;
