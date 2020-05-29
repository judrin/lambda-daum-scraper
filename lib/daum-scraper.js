const axios = require('axios');
const cheerios = require('cheerio');

const moment = require('moment');
require('moment-timezone');


const DEFAULT_SEARCH_DAYS = 2; // Default posts search days for scraping
const MAX_SEARCH_DAYS = 7;     // Maximum posts search days for scraping

const config = {
  baseURL: 'https://m.cafe.daum.net',
  searchDate: {
    start: moment().tz('Asia/Seoul'),
    end: null
  }
}

let continueToSearch = true;

const getPagination = $ => {
  const $pages = $('#pagingNav .link_page');
  const $next = $('.btn_next');
  const nextLink = $next.length ? $next.attr('href') : null;
  const pages = [];

  // page link starts from second page not first
  $pages.each((i, page) => {
    if (page.name === 'a') {
      const $page = $(page);
      pages.push({
        number: $page.text(),
        href: $page.attr('href')
      });
    }
  });

  return {
    pages,
    nextLink
  };
}

const getList = ($, page = 1) => {
  const rows = $('.list_cafe > li');
  const posts = [];

  rows.each((index, el) => {
    const $li = $(el);

    if ($li.hasClass('notice')) return true;

    const relativeHref = $li.find('a').attr('href');
    const id = relativeHref.replace(config.cafeBoardUrl + '/', '');

    if (!id) throw new Error('Invalid id from url: ', relativeHref);
    if (id <= config.maxScrapeId) {
      console.log(`Page ${page}: id {${id}} is smaller than last post id {${config.maxScrapeId}}`);
      continueToSearch = false;
      return false;
    }

    const list = {};
    const date = $li.find('.created_at').text().split('.');

    // if post isn't created today
    if (date.length === 3) {
      // change short year to full year
      date[0] = Math.floor(moment().year() / 100) + date[0];
      const updatedDate = date.join('-');
      const momentTime = moment(updatedDate, 'YYYY-MM-DD');

      if (momentTime < config.searchDate.end) {
        console.log(`Page ${page}: List date ${momentTime.format('YYYY-MM-DD')}`);
        console.log(`Page ${page}: Search end date ${config.searchDate.end.format('YYYY-MM-DD')}`);
        continueToSearch = false;
        return false;
      }

      list.date = momentTime.unix();


    } else {
      // today date
      list.date = config.searchDate.start.unix();
    }

    list.id = parseInt(id);
    list.href = config.baseURL + relativeHref;
    list.title = $li.find('.txt_detail').text();
    list.writer = $li.find('.username').text();
    list.cmtLink = list.href + '/comments';
    list.cmtCount = parseInt($li.find('.num_cmt').text());

    posts.push(list);
  })

  if (posts.length > 0) {
    console.log(`Scraped page ${page}: id => ${posts[posts.length - 1].id} - ${posts[0].id}`);
  }

  return posts;
}

const getPage = async (url, page = 1, getOnlyList = false) => {
  console.log(`Scraping page ${page}`);

  try {
    const response = await axios.get(url);

    if (response.status !== 200) throw new Error('Failed to load page');

    const $ = cheerios.load(response.data);
    const res = getList($, page);

    if (getOnlyList) return res;

    const { pages, nextLink } = getPagination($);
    const getPagePromises = pages.map(page => getPage(config.baseURL + page.href, page.number, true));

    const responses = await Promise.all(getPagePromises);
    let posts = responses.reduce((list, data) => {
      return [...list, ...data];
    }, [...res]);

    if (continueToSearch && nextLink) {

      const nextPageNumber = parseInt(pages[pages.length - 1].number) + 1;
      console.log(`\n@Entering next link -> ${nextPageNumber}\n`);
      const nextPageData = await getPage(config.baseURL + nextLink, nextPageNumber);


      posts = [
        ...posts,
        ...nextPageData
      ]
    }

    return posts;
  } catch (error) {
    throw error;
  }
}

exports.scrape = async (cafeBoardUrl, scrapeDayRange = DEFAULT_SEARCH_DAYS, maxScrapeId = -1) => {

  if (!cafeBoardUrl) throw Error('Missing board url');
  if (isNaN(maxScrapeId)) throw Error('Wrong Id format');

  config.cafeBoardUrl = cafeBoardUrl.toString();
  config.maxScrapeId = parseInt(maxScrapeId);

  if (config.cafeBoardUrl.substring(0, 1) !== '/') config.cafeBoardUrl = '/' + config.cafeBoardUrl;

  const dayRange = parseInt(scrapeDayRange);

  if (isNaN(dayRange) || dayRange > MAX_SEARCH_DAYS) 
    dayRange = DEFAULT_SEARCH_DAYS;

  config.searchDate.end = config.searchDate.start.clone().subtract(dayRange, 'days');

  console.log(`\n----Search Date: ${config.searchDate.end.format('YYYY-MM-DD')} to ${config.searchDate.start.format('YYYY-MM-DD')} ----\n`);

  const data = await getPage(config.baseURL + config.cafeBoardUrl);
  data.sort((a, b) => a.id - b.id);

  return data;
}