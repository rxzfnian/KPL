# Use a small Node.js base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install only server dependencies defined in deploy/package.json
COPY deploy/package.json ./package.json

# If you have a lockfile, uncomment the next two lines and change COPY accordingly
# COPY deploy/package-lock.json ./package-lock.json
# RUN npm ci --omit=dev

RUN npm install --omit=dev

# Copy server source
COPY deploy/src ./deploy/src

# Environment
ENV NODE_ENV=production \
    PORT=8080

EXPOSE 8080

# Start the server
CMD ["node", "deploy/src/server.js"]


