const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const siteUrl = 'https://www.thegioididong.com/';
const outputFolder = 'public';

request(siteUrl, function(err, res, body) {
  if (err) {
    console.log(err, 'error occured while hitting URL');
    return;
  }
  
  console.log(body);
});
