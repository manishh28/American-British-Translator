'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;

      if (text === undefined || locale === undefined) {
        return res.json({ error: 'Required field(s) missing' });
      }

      if (text === '') {
        return res.json({ error: 'No text to translate' });
      }

      if (!['american-to-british', 'british-to-american'].includes(locale)) {
        return res.json({ error: 'Invalid value for locale field' });
      }

      return res.json({
        text,
        translation: translator.translate(text, locale)
      });
    });
};
