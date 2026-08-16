import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'ol',
  'ul',
  'li',
  'a',
  'blockquote',
];

export const sanitizeNewsletterContent = (content = '') =>
  sanitizeHtml(content, {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
    disallowedTagsMode: 'discard',
  }).trim();

export const getTextFromNewsletterContent = (content = '') =>
  sanitizeNewsletterContent(content)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
