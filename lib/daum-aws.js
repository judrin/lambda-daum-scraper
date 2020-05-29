const AWS = require('./aws');

const defaultConfig = {
  region: 'ca-central-1'
}

const services = {
  dynamodb: null,
  docClient: null
}

const POSTS_TABLE = 'daum-casmo';
const LAST_POST_TABLE = 'daum-casmo-latest-post';

exports.POSTS_TABLE = POSTS_TABLE;
exports.LAST_POST_TABLE = LAST_POST_TABLE;
exports.services = services;

exports.init = (config = {}) => {
  AWS.config.update({
    ...defaultConfig,
    ...config
  });

  services.dynamodb = AWS.dynamodb();
  services.docClient = AWS.docClient();
}

exports.deleteRecentItem = (id) => {
  services.docClient.delete({
    TableName: LAST_POST_TABLE,
    Key: {
      board: 'rent-room',
      id
    },
  }, (err, data) => {
    if (err) {
      console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2));
    }
  });
}

exports.addItem = (item) => {
  const params = {
    TableName: POSTS_TABLE,
    Item: {
      ...item,
      board: 'rent-room'
    }
  }

  services.docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add item', item.id, 'Error JSON:', JSON.stringify(err, null, 2));
    }
  });
}

exports.addLatestPostId = (id) => {
  const params = {
    TableName: LAST_POST_TABLE,
    Item: {
      board: 'rent-room',
      id
    }
  }

  services.docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add post', id, '. Error JSON:', JSON.stringify(err, null, 2));
      throw Error('Break');
    }
  });
}

exports.getItems = (timestamp) => {
  const params = {
    TableName: POSTS_TABLE,
    IndexName: 'date',
    KeyConditionExpression: 'board = :board and #d >= :date',
    ExpressionAttributeNames: {
      '#d': 'date'
    },
    ExpressionAttributeValues: {
      ':board': 'rent-room',
      ':date': timestamp
    }
  }

  return services.docClient.query(params).promise();
}