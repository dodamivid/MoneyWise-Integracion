import { afterAll, beforeAll } from '@jest/globals';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
});

afterAll(() => {
});