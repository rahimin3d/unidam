# Use an official nginx image as the base image
FROM nginx:alpine

# Copy the frontend build to the nginx html directory
COPY public /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]