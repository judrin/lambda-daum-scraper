# AWS Lambda Scraper for DAUM Cafe (다음카페 크롤링)

A scraper running on AWS Lambda scrapes data from a Korean website "Daum Cafe" using Cheerio, saves data to Dynamo DB, and spreads data to users through AWS API Gateway.

## Demo
A React app fetching data from the API

[https://xenodochial-mcclintock-3df30a.netlify.app/](https://xenodochial-mcclintock-3df30a.netlify.app/)

## Getting Started
This app uses Serverless Framework to manage AWS services. To install the Serverless Framework is optional.

### Installing
```
$ git clone hhttps://github.com/judrin/lambda-daum-scraper.git
$ cd lambda-daum-scraper
$ npm install
```

### Adding tables to Dynamo DB
1. Configure AWS region and credentials in `admin/init.js` or `admin/init-local.js` (for local Dynamo DB) as shown in the following:
```
daumAWS.init({
  endpoint: 'YOUR ENDPOINT', // (e.g. us-west-2)
  accessKeyId: 'YOUR ACCESS KEY',
  secretAccessKey: 'YOUR SECRET KEY'
});
```

2. Run a script
```
# create tables on the AWS server
$ npm run create-table

# create tables on the local server
$ npm run create-table-local
```

### Deploying lambda functions using Serverless Framework
1. Install Serverless Framework
```
npm install -g serverless
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_KEY
``` 
2. Update `serverless.yaml`,
```
# service name
service: daum-casmo

# change region depending on your AWS setting
provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: ca-central-1 

# change schedule time or replace it with cron 
functions:
  scrape:
    handler: handler.scrape
    events:
     - schedule: rate(30 minutes)

```
3. Deploy lambda functions
```
$ serverless deploy
```

## API
After deploy, `GET` API will be generated. The URL for the API is in the following format.
```
https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/posts
```

