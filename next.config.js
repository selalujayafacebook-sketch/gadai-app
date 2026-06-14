/** @type {import('next').NextConfig} */
module.exports = {
  images: { domains: ['res.cloudinary.com', 's3.amazonaws.com'] },
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
}
