FROM node:20-alpine
WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source files
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run Vite with --host to listen on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
