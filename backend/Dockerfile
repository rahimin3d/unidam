# Use an official node image as the base image
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy schema.sql
COPY db/schema.sql /docker-entrypoint-initdb.d/

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]