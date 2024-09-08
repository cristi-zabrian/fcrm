# Base image for Node.js 20.10
FROM node:20.10-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

COPY node_modules ./node_modules

COPY dist ./dist

RUN #npm run build

# Start the app
CMD ["node", "./dist/main.js"]