FROM node:22.13.1

ENV NODE_ENV=production
ENV RC_VERSION=7.4.0
ENV METEOR_VERSION=3.1.2

# Install dependencies and create user in a single layer to reduce image size
RUN groupadd -r rocketchat && \
    useradd -r -g rocketchat rocketchat && \
    mkdir -p /app/uploads && chown rocketchat:rocketchat /app/uploads && \
    apt-get update && \
    apt-get install -y --no-install-recommends g++ make python3 ca-certificates libssl-dev curl && \
    curl https://install.meteor.com/\?release\=${METEOR_VERSION} | sh && \
    curl -fsSL https://deno.land/install.sh | sh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl https://install.meteor.com/ | sh

RUN apt-get install -y libssl-dev

WORKDIR /app

COPY . .

# Install dependencies
RUN yarn

# Build the app
RUN yarn build

WORKDIR /app/apps/meteor

ENV METEOR_ALLOW_SUPERUSER=1

# Install meteor dependencies
RUN yarn

# Skip browser warnings
ENV BROWSERSLIST_IGNORE_OLD_DATA=1

# Build the meteor app
RUN meteor build --directory ../output --server-only

WORKDIR /app/apps/output/bundle

# Install server dependencies with the ignore-engines flag to avoid Node version compatibility issues
RUN cd /app/apps/output/bundle/programs/server && npm install --ignore-engines && \
    cd npm/node_modules/isolated-vm && npm install --ignore-engines

# Set environment variables for runtime
ENV DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    Accounts_AvatarStorePath=/app/uploads

# Change to non-root user for security
USER rocketchat

EXPOSE 3000

CMD ["node", "main.js"]
