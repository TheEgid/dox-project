FROM nikolaik/python-nodejs:python3.9-nodejs16-bullseye

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
