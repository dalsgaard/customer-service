import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import type { components, operations } from '../openapi/types';

type Customer = components['schemas']['Customer'];
type CreateCustomer = components['schemas']['CreateCustomer'];
type ListCustomersOk =
  operations['listCustomers']['responses'][200]['content']['application/json'];
type NotFound =
  components['responses']['NotFound']['content']['application/json'];
type BadRequest =
  components['responses']['BadRequest']['content']['application/json'];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

const app = new Hono();

app.get('/customers', async (c) => {
  const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
  return c.json<ListCustomersOk>({
    customers: (result.Items ?? []) as Customer[],
  });
});

app.get('/customers/:id', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return c.json<BadRequest>({ error: 'Invalid id' }, 400);
  const result = await client.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } }),
  );
  if (!result.Item) return c.json<NotFound>({ error: 'Not found' }, 404);
  return c.json<Customer>(result.Item as Customer);
});

app.post('/customers', async (c) => {
  const body = await c.req.json<CreateCustomer>();
  const customer: Customer = { id: randomUUID(), ...body };
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item: customer }));
  return c.json<Customer>(customer, 201);
});

app.delete('/customers/:id', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return c.json<BadRequest>({ error: 'Invalid id' }, 400);
  await client.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }),
  );
  return c.body(null, 204);
});

export const handler = handle(app);
