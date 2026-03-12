import { GraphQLClient, gql } from 'graphql-request';
import { GRAPHQL_URL } from '../config.js';

let client = new GraphQLClient(GRAPHQL_URL);

export function setAuthToken(token: string) {
  client = new GraphQLClient(GRAPHQL_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getClient() {
  return client;
}

export { gql };
