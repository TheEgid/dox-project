FROM node:14.5.0-buster as builder

RUN apt-get update && apt-get install apt-utils -qy

RUN npm install @angular/cli -g

#COPY ./package.json /opt/services/nodeapp
#COPY ./package-lock.json /opt/services/nodeapp

# Move our files into directory name "app"
WORKDIR /app
COPY package.json package-lock.json  /app/

RUN cd /app && npm install --no-fund > /dev/null

COPY .  /app

# Build with $env variable from outside :$env
####  ARG env=prod

RUN cd /app && ng build --prod --build-optimizer > /dev/null

# Build a small nginx image with static website

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/* /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
