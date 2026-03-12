import { getClient, gql } from './graphql.js';

export interface Comment {
  id: string;
  attributes: {
    body: string;
    name: string;
    email: string;
    createdAt: string;
    user?: {
      data: {
        id: string;
        attributes: {
          username: string;
        };
      };
    };
  };
}

interface CommentsResponse {
  comments: {
    data: Comment[];
    meta: {
      pagination: {
        total: number;
      };
    };
  };
}

const COMMENTS_QUERY = gql`
  query Comments($filters: CommentFiltersInput, $pagination: PaginationArg) {
    comments(filters: $filters, pagination: $pagination, sort: ["createdAt:desc"]) {
      data {
        id
        attributes {
          body
          name
          createdAt
          user {
            data {
              id
              attributes {
                username
              }
            }
          }
        }
      }
      meta {
        pagination {
          total
        }
      }
    }
  }
`;

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($data: CommentInput!) {
    createComment(data: $data) {
      data {
        id
        attributes {
          body
          createdAt
        }
      }
    }
  }
`;

export async function getComments(postId: string, page = 1, pageSize = 20) {
  const data = await getClient().request<CommentsResponse>(COMMENTS_QUERY, {
    filters: { post: { id: { eq: postId } } },
    pagination: { page, pageSize },
  });
  return data.comments;
}

export async function createComment(postId: string, body: string, name: string, email: string) {
  const data = await getClient().request(CREATE_COMMENT_MUTATION, {
    data: { body, name, email, post: postId },
  });
  return data;
}
