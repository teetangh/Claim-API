FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create volume for logs
VOLUME [ "/usr/src/app/logs" ]

# Expose the port the app runs on
EXPOSE 5000

# Set environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "index.js"] 