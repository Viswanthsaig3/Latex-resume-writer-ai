# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install necessary dependencies for TeX Live and utilities
# Using texlive-base, recommended, extra, and fonts-extra for broader compatibility
# Including 'procps' for debugging purposes (optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-fonts-extra \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Create the output directory for PDFs (ensure it exists)
RUN mkdir -p output

# Make port 5001 available to the world outside this container (Render uses $PORT env var)
# EXPOSE 5001 - Render sets this automatically based on PORT env var, so not strictly needed

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "server.js" ]
