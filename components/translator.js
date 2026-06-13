const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  constructor() {
    this.highlightStart = '<span class="highlight">';
    this.highlightEnd = '</span>';
    this.americanToBritish = {
      ...americanOnly,
      ...americanToBritishSpelling
    };
    this.britishToAmerican = {
      ...britishOnly,
      ...this.reverse(americanToBritishSpelling)
    };
    this.americanToBritishTitles = americanToBritishTitles;
    this.britishToAmericanTitles = this.reverse(americanToBritishTitles);
  }

  reverse(dictionary) {
    return Object.keys(dictionary).reduce((reversed, key) => {
      reversed[dictionary[key]] = key;
      return reversed;
    }, {});
  }

  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  highlight(text) {
    return `${this.highlightStart}${text}${this.highlightEnd}`;
  }

  matchCase(original, replacement) {
    if (!/[a-z]/i.test(original)) return replacement;

    if (
      original === original.toUpperCase() &&
      replacement.toLowerCase() === replacement
    ) {
      return replacement.toUpperCase();
    }

    const isCapitalized =
      original[0] === original[0].toUpperCase() &&
      original.slice(1) === original.slice(1).toLowerCase();

    if (isCapitalized && replacement.toLowerCase() === replacement) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }

    return replacement;
  }

  buildDictionaryRegex(dictionary) {
    const terms = Object.keys(dictionary)
      .sort((a, b) => b.length - a.length)
      .map((term) => this.escapeRegex(term));

    return new RegExp(`(^|[^A-Za-z0-9])(${terms.join('|')})(?=$|[^A-Za-z0-9])`, 'gi');
  }

  buildTitleRegex(dictionary) {
    const titles = Object.keys(dictionary)
      .sort((a, b) => b.length - a.length)
      .map((title) => this.escapeRegex(title));

    return new RegExp(`(^|[^A-Za-z0-9])(${titles.join('|')})(?=\\s+[A-Za-z])`, 'gi');
  }

  replaceWithTokens(text, regex, getReplacement, hasPrefix = false) {
    const highlights = [];
    const tokenized = text.replace(regex, (...args) => {
      const fullMatch = args[0];
      const prefix = hasPrefix ? args[1] : '';
      const matchedText = hasPrefix ? args[2] : fullMatch;
      const token = `\uE000${highlights.length}\uE001`;
      const replacement = getReplacement(matchedText, args);

      highlights.push(this.highlight(replacement));
      return `${prefix}${token}`;
    });

    return tokenized.replace(/\uE000(\d+)\uE001/g, (_, index) => highlights[index]);
  }

  translate(text, locale) {
    const isAmericanToBritish = locale === 'american-to-british';
    const dictionary = isAmericanToBritish ? this.americanToBritish : this.britishToAmerican;
    const timeRegex = isAmericanToBritish
      ? /\b([0-9]{1,2}):([0-9]{2})\b/g
      : /\b([0-9]{1,2})\.([0-9]{2})\b/g;

    let translation = this.replaceWithTokens(text, timeRegex, (_, args) => {
      const hour = args[1];
      const minutes = args[2];
      return isAmericanToBritish ? `${hour}.${minutes}` : `${hour}:${minutes}`;
    });

    const titles = isAmericanToBritish
      ? this.americanToBritishTitles
      : this.britishToAmericanTitles;

    translation = this.replaceWithTokens(
      translation,
      this.buildTitleRegex(titles),
      (matchedText) => this.matchCase(matchedText, titles[matchedText.toLowerCase()]),
      true
    );

    translation = this.replaceWithTokens(
      translation,
      this.buildDictionaryRegex(dictionary),
      (matchedText) => {
        const replacement = dictionary[matchedText.toLowerCase()];
        return this.matchCase(matchedText, replacement);
      },
      true
    );

    return translation === text ? 'Everything looks good to me!' : translation;
  }

}

module.exports = Translator;
