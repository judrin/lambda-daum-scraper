const daum = require('./lib/daum-scraper');
const daumAWS = require('./lib/daum-aws');

daumAWS.init();

const { docClient } = daumAWS.services;

const scrape = (latestPostId) => {
  const cafeUrl = '/skc67/33dV';
  const searchDays = 2;

  daum.scrape(cafeUrl, searchDays, latestPostId)
    .then(data => {
      console.log(`\nTotal ${data.length} items scraped\n`);

      if (data.length > 0) {
        daumAWS.deleteRecentItem(latestPostId);
        daumAWS.addLatestPostId(data[data.length - 1].id);
        console.log(`Latest id[${data[data.length - 1].id}] has been added to the table [daum-casmo-latest-post]`);
      }

      data.forEach(item => {
        daumAWS.addItem(item);
      });
    })
    .catch(error => console.log(error));;
}

const handleScan = (err, data) => {
  if (err) {
    console.log('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    const items = data.Items;
    scrape(items.length > 0 ? items[0].id : -1);
  }
}

exports.scrape = () => docClient.scan({ TableName: daumAWS.LAST_POST_TABLE }, handleScan);
exports.posts = (timestamp) => daumAWS.getItems(timestamp);