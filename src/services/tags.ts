import { getClient, gql } from './graphql.js';

export interface Tag {
  id: string;
  attributes: {
    name: string;
  };
}

interface TagsResponse {
  tags: {
    data: Tag[];
  };
}

const TAGS_QUERY = gql`
  query Tags {
    tags(pagination: { pageSize: 100 }, sort: ["name:asc"]) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

export async function getTags() {
  const data = await getClient().request<TagsResponse>(TAGS_QUERY);
  return data.tags.data;
}
