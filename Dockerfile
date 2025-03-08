# Use Node.js 22.13.0 as specified in your package.json
FROM node:22.13.0-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci

# Copy the pre-built dist directory
COPY dist/ ./dist/

# Set environment to production
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 5500

STOPSIGNAL SIGINT
# Start the app
CMD ["node", "dist/index.js"]