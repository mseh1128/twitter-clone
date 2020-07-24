# Twitter Clone
Twitter Clone is exactly what it sounds like, a twitter clone. Twitter Clone is a semester-long web app built for the CSE356 (Cloud Computing) course at Stony Brook University. It is designed specifically to handle large server loads through a variety of techniques including caching, load balancing, sharding and replication.   

In order to meet stringent QoS requirements (1K concurrent useres w/ a 95th percentile tail latency of ~200ms and load testing w/ 20K responses), the following technologies were used:

* Node
* Express
* MongoDB
* Redis
* Nginx
* Ansible
* Elasticsearch

## Installation/Usage

Add your MONGODB_URI to the "config.js" file.

```bash
# Install dependencies
npm install

# Serve on localhost:3000
npm run dev (nodemon)
or
npm start
