import Knex from 'knex';
import { Model } from 'objection';
import { env } from './env.js';

const knex = Knex({
  client: 'pg',
  connection: env.databaseUrl,
});

Model.knex(knex);

export default knex;
