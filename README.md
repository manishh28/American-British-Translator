# American British Translator

A full-stack JavaScript solution for the freeCodeCamp American/British English Translator project.

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Run Tests

```bash
npm run test
```

For the freeCodeCamp automatic test UI, copy `sample.env` to `.env` and set:

```bash
NODE_ENV=test
```

## Render Deployment

Use these settings when creating a Render Web Service:

- Runtime: `Node`
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: leave `NODE_ENV` unset, or set it to `production`
