FROM node:14.21.3

ENV NODE_ENV=production
ENV RC_VERSION=6.7.0

RUN groupadd -r rocketchat && \
    useradd -r -g rocketchat rocketchat && \
    mkdir -p /app/uploads && chown rocketchat:rocketchat /app/uploads

RUN curl https://install.meteor.com/ | sh

RUN apt-get install -y libssl-dev

WORKDIR /app

COPY . .

RUN yarn
RUN yarn build

WORKDIR /app/apps/meteor

RUN yarn
RUN meteor build --directory ../output  

WORKDIR /app/apps/output/bundle
RUN yarn add fibers

CMD ["node", "main.js"]
