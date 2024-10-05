# Stage 1: Build the TypeScript code
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the tsconfig.json and the source code
COPY tsconfig.json ./
COPY ./src ./src

# Compile the TypeScript code
RUN npm run build



# Stage 2: Create the production-ready container with the compiled code
FROM node:18-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli

# Set the working directory for the runtime container
WORKDIR /usr/src

# Copy only the compiled code from the build stage
COPY --from=builder /usr/src/dist ./dist

# Copy node_modules from the builder stage
COPY --from=builder /usr/src/node_modules ./node_modules

# Run the application with Node.js
CMD ["node", "dist/index.js"]
