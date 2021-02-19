# Pull latest official node image
FROM node:latest

# Expose ports
EXPOSE 3000
EXPOSE 35729

# Set working directory
WORKDIR /app

# Copy package files and install app dependencies
COPY . /app
RUN npm install

CMD npm run start
