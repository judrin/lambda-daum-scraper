/**
 * This is handler.js for AWS Lambda
 */

const app = require('./app');
const moment = require('moment');

module.exports.scrape = event => {
  app.scrape();
  console.log(JSON.stringify(event, null, 2));
};

/**
 * Lambda function with API Gateway
 */
module.exports.posts = async (event, context) => {

  try {
    const qStrPrams = event.queryStringParameters;
    const date = qStrPrams && qStrPrams.date && !isNaN(qStrPrams.date)
     ? parseInt(qStrPrams.date) : 7;

    const searchEndTimestamp = moment().subtract(date, "days").unix();
    const result = await app.posts(searchEndTimestamp);
    const sortedItems = result.Items.sort((a, b) => b.id - a.id);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", 
      },
      body: JSON.stringify({
        success: true,
        result: sortedItems
      } , null, 2 ),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'Invalid request'
      })
    }
  }
}