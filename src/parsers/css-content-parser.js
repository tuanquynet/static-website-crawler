var cheerio = require("cheerio"),
    urlMod = require("url");
const csstree = require('css-tree');

module.exports = function (opts) {
  if (!opts) {
    opts = {};
  }

  if (!opts.urlFilter) {
    opts.urlFilter = function () {
      return true;
    };
  }

  return function (context) {
		var $;
		const ast = csstree.parse(context.body);
		const urls = [];
		csstree.walk(ast, function(node) {
				if (this.declaration !== null && node.type === 'Url') {
					let url = '';
					const value = node.value;
	
					if (value.type === 'Raw') {
						url = value.value;
					} else {
						url = value.value.substr(1, value.value.length - 2);
					}

					console.log('url');
					console.log(url);

					absoluteTargetUrl = urlMod.resolve(context.url, url);
				  urlObj = urlMod.parse(absoluteTargetUrl);
				  protocol = urlObj.protocol;
				  hostname = urlObj.hostname;

		      if (protocol !== "http:" && protocol !== "https:") {
		        return null;
		      }

		      // Restrict links to a particular group of hostnames.
		      if (typeof opts.hostnames !== "undefined") {
		        if (opts.hostnames.indexOf(hostname) === -1) {
		          return null;
		        }
		      }

		      urls.push(urlMod.format({
		        protocol: urlObj.protocol,
		        auth: urlObj.auth,
		        host: urlObj.host,
		        pathname: urlObj.pathname,
		        search: urlObj.search
		      }));
				}
		});
	
		return urls;
/* 
    $ = context.$ || cheerio.load(context.body);
    context.$ = $;

    return $("link[href]").map(function () {
      var $this,
          targetHref,
          absoluteTargetUrl,
          urlObj,
          protocol,
          hostname;

      $this = $(this);
      targetHref = $this.attr("href");
      absoluteTargetUrl = urlMod.resolve(context.url, targetHref);
      urlObj = urlMod.parse(absoluteTargetUrl);
      protocol = urlObj.protocol;
      hostname = urlObj.hostname;

      if (protocol !== "http:" && protocol !== "https:") {
        return null;
      }

      // Restrict links to a particular group of hostnames.
      if (typeof opts.hostnames !== "undefined") {
        if (opts.hostnames.indexOf(hostname) === -1) {
          return null;
        }
      }

      return urlMod.format({
        protocol: urlObj.protocol,
        auth: urlObj.auth,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search
      });
    }).get().filter(function (url) {
      return opts.urlFilter(url, context.url);
    }); */
  };
};
