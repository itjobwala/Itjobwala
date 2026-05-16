import Knex from 'knex';
import { Model } from 'objection';
import 'dotenv/config';

// Initialize knex
const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

// Give the knex instance to objection
Model.knex(knex);

export default knex;
