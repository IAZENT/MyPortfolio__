import { GlobalConfig } from 'payload/types';

const Globals: GlobalConfig = {
  slug: 'settings',
  fields: [
    { name: 'siteName', type: 'text' },
    { name: 'tagline', type: 'text' },
    { name: 'heroName', type: 'text' },
    { name: 'heroRoles', type: 'text', hasMany: true },
    { name: 'heroPhoto', type: 'upload', relationTo: 'media' },
    { name: 'socialLinks', type: 'array', fields: [
      { name: 'label', type: 'text' },
      { name: 'url', type: 'text' },
    ] },
  ],
};

export default Globals;
