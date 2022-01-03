FROM nikolaik/python-nodejs:python3.9-nodejs16-bullseye

WORKDIR /usr/src/app

COPY ./py_child ./py_child
RUN pip install -r py_child/requirements.txt

COPY . .

RUN yarn install --ignore-engines

RUN yarn global add @nestjs/cli rimraf cross-env jest typescript ts-node typeorm

RUN tsc
RUN yarn build 

CMD yarn start:prod
