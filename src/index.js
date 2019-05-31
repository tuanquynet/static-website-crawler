const request = require('request');
// const cheerio = require('cheerio');
// const fs = require('fs');

const siteUrl = 'https://goalify.plus/vi/blog/2018/02/23/okr-la%CC%80-gi%CC%80/';
// const outputFolder = 'public';

request(siteUrl, (err, res, body) => {
  if (err) {
    console.log(err, 'error occured while hitting URL');
    return;
  }

  console.log(body);
});
