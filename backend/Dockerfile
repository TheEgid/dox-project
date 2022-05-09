FROM nikolaik/python-nodejs:python3.10-nodejs16-bullseye

WORKDIR /usr/src/app

COPY ./py_child ./py_child
RUN pip install -r py_child/requirements.txt

RUN yarn global add @nestjs/cli rimraf cross-env jest typescript ts-node typeorm

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --ignore-engines

COPY ./ ./

RUN tsc
RUN yarn build 

CMD yarn start:prod
