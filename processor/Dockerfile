# Use a Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire source code
COPY ./src ./src

# Install TypeScript globally and compile the project
RUN npm install -g typescript
RUN npx tsc

# Run the compiled code
CMD ["node", "dist/fitnessProcessor/index.js"]
