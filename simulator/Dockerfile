# Stage 1: Build the TypeScript code
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./src ./src

# Install TypeScript globally and compile
RUN npm install -g typescript
RUN npx tsc

# Stage 2: Run the application
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only the compiled code from the first stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy node_modules from the first stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Run the application with Node.js
CMD ["node", "dist/index.js"]
