# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that the server will run on (typically 8000)
EXPOSE 8000

# Start the Node.js app in development mode (or production based on your setup)
CMD ["npm", "run", "dev"] 
