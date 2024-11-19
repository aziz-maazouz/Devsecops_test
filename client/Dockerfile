# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that the React app will run on (typically 3000)
EXPOSE 3000

# Set environment variable for the API URL (you can also pass this through Docker Compose)
ENV REACT_APP_API_URL=http://localhost:8000/ssa-api/

# Start the React app in development mode (or production based on your setup)
CMD ["npm", "start"]
