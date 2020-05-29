const AWS = require('aws-sdk');

exports.config = AWS.config;
exports.dynamodb = () => new AWS.DynamoDB;
exports.docClient = () => new AWS.DynamoDB.DocumentClient();