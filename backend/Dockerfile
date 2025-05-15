FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the full app
COPY . .

# Build TypeScript
RUN npm run build

# Expose the app port
EXPOSE 5000

# Start the app 
CMD ["node", "dist/server.js"]