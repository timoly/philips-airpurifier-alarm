FROM nikolaik/python-nodejs:python3.8-nodejs13-alpine
RUN apk add --update build-base
RUN pip3 install py-air-control==1.0
COPY . /app
WORKDIR /app
RUN npm install
CMD node app.js