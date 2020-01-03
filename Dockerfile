FROM node:12.13.1-alpine
 
WORKDIR /Users/yanniskonstas/dev/code/node/bootstrapping-microservices/microvideo
COPY package*.json ./
RUN npm install --only=production
COPY ./src ./src
COPY ./videos ./videos
ENV VIDEOS_PATH=./videos
EXPOSE 3000
CMD npm start