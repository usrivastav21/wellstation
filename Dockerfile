# Use Node.js LTS version with wine for Windows builds
FROM node:20

# Install wine and dependencies for building Windows executables on Linux
RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y wine wine32 wine64 python3 python3-pip python3-dev xvfb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python

# Initialize Wine environment
ENV WINEARCH=win64
ENV WINEPREFIX=/root/.wine
RUN wine64 wineboot --init && \
    while pgrep -x wine >/dev/null; do sleep 1; done

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --break-system-packages -r /tmp/requirements.txt

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Windows executable
RUN rm -rf frontend/node_modules frontend/package-lock.json && \
    cd frontend && npm install && cd ..
RUN npm run dist:windows

# The output will be in dist/ folder
# You can copy it out using docker cp command