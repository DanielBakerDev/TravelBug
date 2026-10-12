/*
 * Builds the site into _site/.
 *
 *   content/   what Amanda edits in Pages CMS (YAML)
 *   src/       page templates (Nunjucks)
 *   assets/    CSS, JS, video and photos, copied across
 *   lib/       the helpers below
 *
 * Every page is written flat at the root (about.html, not about/index.html)
 * so relative links to assets/ work the same on the live domain and on the
 * GitHub Pages preview, which lives under /TravelBug/.
 */
import markdownIt from 'markdown-it';
import { loadPages, loadTrips, departurePages, enquiryOptions, fillTokens, countWord } from './lib/content.js';
import { processImages, imageSizes } from './lib/images.js';

// No raw HTML: what Amanda types is text, bold, italics, links and lists.
const markdown = markdownIt({ html: false, linkify: false, typographer: false });

export default function (eleventyConfig) {
  // Functions rather than values, so `npm run dev` picks up edits to content/.
  for (const name of Object.keys(loadPages())) {
    eleventyConfig.addGlobalData(name, () => loadPages()[name]);
  }
  // The GitHub Pages copy (preview.yml sets this): kept out of search engines
  // and labelled, so nobody mistakes it for the live site.
  eleventyConfig.addGlobalData('isPreview', process.env.SITE_PREVIEW === '1');

  eleventyConfig.addGlobalData('trips', () => loadTrips());
  eleventyConfig.addGlobalData('departurePages', () => departurePages(loadTrips()));
  eleventyConfig.addGlobalData('combinedTrips', () => loadTrips().filter((t) => t.kind === 'combined'));
  eleventyConfig.addGlobalData('enquiryOptions', () => enquiryOptions(loadTrips()));

  eleventyConfig.addWatchTarget('content/');
  eleventyConfig.addWatchTarget('assets/img/');

  eleventyConfig.addPassthroughCopy('assets/css');
  eleventyConfig.addPassthroughCopy('assets/js');
  eleventyConfig.addPassthroughCopy('assets/video');
  eleventyConfig.addPassthroughCopy({ 'src/static': '.' });

  eleventyConfig.on('eleventy.before', ({ directories }) => processImages(directories.output));

  // Pages CMS stores "/assets/img/x.jpg". Pages are all at the root, so drop
  // the slash and the same path works under the /TravelBug/ preview too.
  const relative = (src) => String(src ?? '').replace(/^\/+/, '');

  // src, width and height for an <img>, with the size read from the file.
  // An empty field, or a photo deleted from the media library while still in
  // use, gives '' and the photo is left off the page. Failing the build
  // instead would stop the preview updating with no sign to Amanda why.
  eleventyConfig.addFilter('img', (src) => {
    if (!src) return '';
    const file = relative(src);
    const size = imageSizes.get(file);
    if (!size) {
      console.warn(`[images] "${src}" is not in assets/img; left off the page.`);
      return '';
    }
    return `src="${file}" width="${size.width}" height="${size.height}"`;
  });

  eleventyConfig.addFilter('md', (text) => markdown.render(String(text ?? '')).trim());
  eleventyConfig.addFilter('mdInline', (text) => markdown.renderInline(String(text ?? '').trim()));
  eleventyConfig.addFilter('tokens', fillTokens);
  eleventyConfig.addFilter('urlencode', (text) => encodeURIComponent(String(text ?? '')));
  eleventyConfig.addFilter('countWord', countWord);

  return {
    dir: { input: 'src', includes: '_includes', output: '_site' },
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
  };
}
