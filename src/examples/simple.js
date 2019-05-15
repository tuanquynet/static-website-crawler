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

  const $ = cheerio.load(body);
  const listOfImages = [];
  $('img[src]').map(function () {
    const $this = $(this);
    const imageSrc = $this.attr('src');
    console.log(imageSrc);
    listOfImages.push(imageSrc);
  });

  const filePath = `${__dirname}/${outputFolder}/index.html`;
  fs.writeFileSync(filePath, body);

  // save listOfImages
  fs.writeFileSync(`${__dirname}/${outputFolder}/list-of-image.txt`, listOfImages.join('\n'));

});
