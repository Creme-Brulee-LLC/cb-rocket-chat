FROM node:13

RUN npm i -g meteor@2.15

ENV NODE_ENV=production
ENV RC_VERSION=6.6.6

RUN groupadd -r rocketchat && \
    useradd -r -g rocketchat rocketchat && \
    mkdir -p /app/uploads && chown rocketchat:rocketchat /app/uploads

WORKDIR /app

COPY . .

RUN yarn
RUN yarn build

CMD ["yarn", "dsv"]
