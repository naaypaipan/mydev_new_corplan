# IARC Monitoring System
# Intellgent Automation Research Center - PSU
# docker iarc/iarc-monitoring-system

FROM node:18-alpine

# Change Timezone
RUN apk --update add tzdata
RUN cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime
RUN echo "Asia/Bangkok"  > /etc/timezone
RUN  apk del tzdata

# Working Directory
RUN mkdir /home/node/app
WORKDIR /home/node/app

# Copy Package.json
COPY backend/ /home/node/app/
COPY process.yml /home/node/app/
RUN npm ci 
RUN npm install -g pm2



EXPOSE  3001

CMD [ "pm2-runtime","process.yml" ]