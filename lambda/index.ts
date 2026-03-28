import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';

const app = new Hono();

app.get('/customers', (c) => c.json({ customers: [] }));
app.get('/customers/:id', (c) => c.json({ id: c.req.param('id') }));

export const handler = handle(app);
