FROM node:10.10.0
MAINTAINER Tarun Mittal <gmail@ta.run>
 
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install -g forever

# Bundle app source
COPY . /usr/src/app

#RUN sequelize --env write db:migrate


EXPOSE 8080
CMD [ "forever", "index.js" ]