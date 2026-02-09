# WhiskerBook API

WhiskerBook is an Express + MongoDB API with three collections (`cats`, `meows`, `purrs`) and a static client served from `public/`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Start MongoDB locally and run:

```bash
npm run seed
npm run dev
```

## Commands

- `npm run dev` - start server with nodemon
- `npm start` - start server with node
- `npm run seed` - clear and seed sample data

## API Routes

### Cats
- `GET /cats`
- `GET /cats/:id`
- `POST /cats`
- `PATCH /cats/:id`
- `DELETE /cats/:id`

### Meows
- `GET /meows`
- `GET /meows/:id`
- `GET /meows/search/by-cat-name?name=Luna`
- `POST /meows`
- `PATCH /meows/:id`
- `DELETE /meows/:id`

### Purrs
- `GET /purrs`
- `GET /purrs/:id`
- `GET /purrs/by-meow/:meowId`
- `POST /purrs`
- `PATCH /purrs/:id`
- `DELETE /purrs/:id`

### Validation test route
- `POST /debug/invalid-meow` intentionally tries invalid data to show validation errors are caught.

## Indexing Notes

- `cats.name` index improves name lookup and search patterns.
- `meows(catId, createdAt)` compound index improves feed queries filtered by cat and sorted by date.
- `purrs.meowId` index improves fetching purrs related to one meow.

## Validation Notes

Validation is enforced in two layers:
- Mongoose schema validation (`required`, type constraints, length checks)
- MongoDB collection validators via `collMod` / `createCollection` in `server.js`

`Purr.meowId` is additionally checked against existing meow documents before save.
