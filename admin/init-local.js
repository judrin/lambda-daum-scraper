/**
 * Create Daynamo DB table on the local server
 */

const daumAWS = require('../lib/daum-aws');

const daumCasmoTableSchema = {
  TableName: daumAWS.POSTS_TABLE,
  KeySchema: [
    {
      AttributeName: 'board',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'id',
      KeyType: 'RANGE'
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'board',
      AttributeType: 'S'
    },
    {
      AttributeName: 'id',
      AttributeType: 'N'
    },
    {
      AttributeName: 'date',
      AttributeType: 'N'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'date',
      KeySchema: [
        {
          AttributeName: 'board',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'date',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      },
    }
  ]
};

const daumCasmoLatestPost = {
  TableName: daumAWS.LAST_POST_TABLE,
  KeySchema: [
    {
      AttributeName: 'board',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'id',
      KeyType: 'RANGE'
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'board',
      AttributeType: 'S'
    },
    {
      AttributeName: 'id',
      AttributeType: 'N'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10
  },
}

daumAWS.init({
  endpoint: 'http://localhost:8000/',
  accessKeyId: "keyId",
  secretAccessKey: "AccessKey"
});
const { dynamodb } = daumAWS.services;
const createTable = (table) => {  
  dynamodb.createTable(table, (err, data) => {
    if (err) {
      console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
};

createTable(daumCasmoTableSchema);
createTable(daumCasmoLatestPost);