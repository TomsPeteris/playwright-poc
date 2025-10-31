FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.56.1-noble

# Set environment variable to indicate Docker environment
ENV DOCKER=true
ENV CHOKIDAR_USEPOLLING=1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Verify browsers are installed and test browser launch
RUN npx playwright install chromium --with-deps && \
    node test-browser-launch.js || echo "Browser test failed but continuing..."

# Create directory for shared memory (helps with browser stability)
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix

# Set display for headless mode
ENV DISPLAY=:99

# Expose port for UI mode
EXPOSE 8080

# Start command will be overridden by Cloud Foundry manifest
CMD ["npx", "playwright", "test", "--ui", "--ui-port=8080", "--ui-host=0.0.0.0"]

