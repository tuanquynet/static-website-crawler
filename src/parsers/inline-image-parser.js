const cheerio = require('cheerio');
const urlMod = require('url');
const csstree = require('css-tree');

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
    const urls = [];

    $('[style*=background-image]').map(function mapCallback() {
      //  var $this, targetHref, absoluteTargetUrl, urlObj, protocol, hostname;
      const $this = $(this);
      const styleContent = $this.attr('style');
      const ast = csstree.parse(`image {${styleContent}}`);

      csstree.walk(ast, (node) => {
        if (this.declaration !== null && node.type === 'Url') {
          let url = '';
          const { value } = node;

          if (value.type === 'Raw') {
            url = value.value;
          } else {
            url = value.value.substr(1, value.value.length - 2);
          }

          const absoluteTargetUrl = urlMod.resolve(context.url, url);
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

          urls.push(
            urlMod.format({
              protocol: urlObj.protocol,
              auth: urlObj.auth,
              host: urlObj.host,
              pathname: urlObj.pathname,
              search: urlObj.search,
            }),
          );
        }

        return true;
      });

      return true;
    });

    return urls;
  };
};
