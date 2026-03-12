import { GraphQLClient, gql } from 'graphql-request';
import { GRAPHQL_URL } from '../config.js';
import { setAuthToken } from './graphql.js';
import { getConfig } from '../utils/store.js';

interface LoginResponse {
  login: {
    jwt: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

interface RegisterResponse {
  register: {
    jwt: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

interface MeResponse {
  me: {
    id: string;
    username: string;
    email: string;
    role: {
      name: string;
    };
  };
}

const LOGIN_MUTATION = gql`
  mutation Login($input: UsersPermissionsLoginInput!) {
    login(input: $input) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: UsersPermissionsRegisterInput!) {
    register(input: $input) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role {
        name
      }
    }
  }
`;

export async function login(identifier: string, password: string) {
  const tempClient = new GraphQLClient(GRAPHQL_URL);
  const data = await tempClient.request<LoginResponse>(LOGIN_MUTATION, {
    input: { identifier, password },
  });
  setAuthToken(data.login.jwt);
  return { jwt: data.login.jwt, user: data.login.user };
}

export async function register(username: string, email: string, password: string) {
  const tempClient = new GraphQLClient(GRAPHQL_URL);
  const data = await tempClient.request<RegisterResponse>(REGISTER_MUTATION, {
    input: { username, email, password },
  });
  setAuthToken(data.register.jwt);
  return { jwt: data.register.jwt, user: data.register.user };
}

export async function getMe() {
  const { getClient } = await import('./graphql.js');
  const data = await getClient().request<MeResponse>(ME_QUERY);
  return data.me;
}

export function restoreSession() {
  const config = getConfig();
  const token = config.get('auth.jwt') as string | undefined;
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
}
