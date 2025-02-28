# Use the official Nginx image for Raspberry Pi (ARM architecture)
FROM nginx:stable

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy all game files to the container
COPY . .

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]