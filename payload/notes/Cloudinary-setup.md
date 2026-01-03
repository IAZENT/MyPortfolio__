Cloudinary setup notes (brief)

1. Create a Cloudinary account and copy your `CLOUDINARY_URL` value (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME).
2. Add `CLOUDINARY_URL` to `.env` in the `payload/` folder.
3. To swap local uploads to Cloudinary, install an adapter (example approach):
   - Add a small storage adapter or use community packages (search `payload cloudinary` for maintained adapters).
   - Update the `upload` configuration on the Media collection to use the adapter and provide folder mapping and transformations.
4. Cloudinary will handle automatic CDN delivery + transformations; remove local imageSizes if you rely on Cloudinary transforms.

I'll add an example adapter config once you create the Cloudinary account and confirm you'd like me to wire it in.
