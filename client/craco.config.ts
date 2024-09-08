import path from 'path';

export default {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
};
