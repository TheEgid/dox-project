# Build Stage 1
# This build created a staging docker image

FROM nikolaik/python-nodejs:python3.8-nodejs16-bullseye AS appbuild

WORKDIR /usr/src/app

COPY ./py_child ./py_child
RUN pip install --upgrade pip
RUN pip install -r py_child/requirements.txt

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

RUN yarn install --ignore-engines

RUN yarn global add @nestjs/cli rimraf cross-env jest typescript ts-node typeorm

COPY . .

RUN tsc
RUN yarn build 

CMD yarn start:prod

# # Build Stage 2
# # This build takes the production build from staging build
#
# FROM nikolaik/python-nodejs:python3.8-nodejs16-bullseye
#
# WORKDIR /usr/app
#
# COPY package.json ./
# COPY yarn.lock ./
#
# COPY --from=appbuild /usr/app/dist ./dist
#
# EXPOSE 3000
#
# CMD yarn start:prod

#CMD ["sh", "-c", "yarn typeorm migration:run && yarn start:prod"]