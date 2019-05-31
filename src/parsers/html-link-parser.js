const cheerio = require('cheerio');
const urlMod = require('url');

module.exports = (opts) => {
  if (!opts) {
    opts = {};
  }

  if (!opts.urlFilter) {
    opts.urlFilter = () => true;
  }

  return (context) => {
    const $ = context.$ || cheerio.load(context.body);
    context.$ = $;

    return $('a[href], link[href][rel=alternate], area[href]').map(function mapCallback() {
      const $this = $(this);
      const targetHref = encodeURI($this.attr('href').trim());
      const absoluteTargetUrl = urlMod.resolve(context.url, targetHref);
      const urlObj = urlMod.parse(absoluteTargetUrl);
      const { protocol, hostname } = urlObj;

      if (protocol !== 'http:' && protocol !== 'https:') {
        return null;
      }

      // Restrict links to a particular group of hostnames.
      if (typeof opts.hostnames !== 'undefined') {
        if (opts.hostnames.indexOf(hostname) === -1) {
          return null;
        }
      }

      return urlMod.format({
        protocol: urlObj.protocol,
        auth: urlObj.auth,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search,
      });
    }).get().filter(url => opts.urlFilter(url, context.url));
  };
};
