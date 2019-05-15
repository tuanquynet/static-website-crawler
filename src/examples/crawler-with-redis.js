/* globals console */
const supercrawler = require("../lib");
const url = require('url');
const fs = require('fs');
const path = require('path');
const imageLinkParser = require('../parsers/image-link-parser');
const cssLinkParser = require('../parsers/css-link-parser');
const jsLinkParser = require('../parsers/js-link-parser');
const cssContentParser = require('../parsers/css-content-parser');
const inlineImageParser = require('../parsers/inline-image-parser');
const mkdirp = require('mkdirp');

const siteUrl = 'google.com';
const destFolder = './public';

const crawler = new supercrawler.Crawler({
  interval: 100,
  concurrentRequestsLimit: 5,
  urlList: new supercrawler.RedisUrlList({
    redis: {
      port: 6379,
      host: '127.0.0.1'
    }
  })
});

/* 
crawler.on("crawlurl", function (url) {
  console.log("Crawling " + url);
});
 */

crawler.on("urllistempty", function () {
  console.warn("The URL queue is empty.");
});

crawler.on("handlersError", function (err) {
  console.error(err);
});

crawler.addHandler("text/html", supercrawler.handlers.htmlLinkParser({
  hostnames: [siteUrl]
}));

crawler.addHandler("text/html", imageLinkParser());
crawler.addHandler("text/html", cssLinkParser());
crawler.addHandler("text/html", jsLinkParser());
crawler.addHandler("text/html", inlineImageParser());
crawler.addHandler("text/css", cssContentParser());

const saveFileHandler = (context) => {
  const responseBuffer = context.body;
  
  const parsed = url.parse(context.url);
  const domain = parsed.hostname;

  const pathname = parsed && parsed.pathname || '';
  // Rename / to index.html
  if (pathname === "/" || pathname.lastIndexOf('/') === pathname.length - 1) {
    parsed.pathname += "index.html";
  }

  // Where to save downloaded data
  const outputDirectory = path.join(__dirname, destFolder, domain);

  // Get directory name in order to create any nested dirs
  const dirname = outputDirectory + parsed.pathname.replace(/\/[^/]+$/, "");

  // Path to save file
  const filepath = outputDirectory + parsed.pathname;

  // Check if DIR exists
  fs.exists(dirname, function(exists) {

      // If DIR exists, write file
      if (exists) {
          fs.writeFile(filepath, responseBuffer, function() {});
      } else {
          // Else, recursively create dir using node-fs, then write file
          /* fs.mkdir(dirname, 0755, function() {
              fs.writeFile(filepath, responseBuffer, function() {});
              console.log('File saved: ', filepath);
          }); */
          mkdirp(dirname, 0755, function() {
            fs.writeFile(filepath, responseBuffer, function() {});
            console.log('File saved: ', filepath);
        })
      }

  });

  console.log("I just received %s (%d bytes)", context.url, responseBuffer.length);
};

crawler.addHandler(["text/plain", "text/html"], saveFileHandler);

crawler.addHandler(["application/font-woff", "application/font-woff2", "font/woff2", "font/woff"], function (context) {
  saveFileHandler(context);
})

crawler.addHandler(['text/css', 'text/javascript', 'application/javascript'], function (context) {
  saveFileHandler(context);
})

crawler.addHandler(['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'], function (context) {
  saveFileHandler(context);
})

crawler.addHandler(function (context) {
  console.log("Processed " + context.url);
  console.log("\t contentType:" + context.contentType);
});

crawler.getUrlList().insertIfNotExists(new supercrawler.Url({
  url: `https://${siteUrl}`,
})).then(function () {
  crawler.start();
});
