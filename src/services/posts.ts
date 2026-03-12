import { getClient, gql } from './graphql.js';

export interface Post {
  id: string;
  attributes: {
    title: string;
    body: string;
    views: number;
    readingTime: number;
    comments: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    author?: {
      data: {
        id: string;
        attributes: {
          username: string;
        };
      };
    };
    tags?: {
      data: Array<{
        id: string;
        attributes: {
          name: string;
        };
      }>;
    };
    banner?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface PostsResponse {
  posts: {
    data: Post[];
    meta: {
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
      };
    };
  };
}

interface PostResponse {
  post: {
    data: Post;
  };
}

const POSTS_QUERY = gql`
  query Posts($pagination: PaginationArg, $sort: [String]) {
    posts(pagination: $pagination, sort: $sort) {
      data {
        id
        attributes {
          title
          body
          views
          readingTime
          comments
          likes
          createdAt
          publishedAt
          author {
            data {
              id
              attributes {
                username
              }
            }
          }
          tags {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
      meta {
        pagination {
          total
          page
          pageSize
          pageCount
        }
      }
    }
  }
`;

const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      data {
        id
        attributes {
          title
          body
          views
          readingTime
          comments
          likes
          createdAt
          publishedAt
          author {
            data {
              id
              attributes {
                username
              }
            }
          }
          tags {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_POSTS_QUERY = gql`
  query SearchPosts($filters: PostFiltersInput, $pagination: PaginationArg, $sort: [String]) {
    posts(filters: $filters, pagination: $pagination, sort: $sort) {
      data {
        id
        attributes {
          title
          body
          views
          readingTime
          comments
          likes
          createdAt
          publishedAt
          author {
            data {
              id
              attributes {
                username
              }
            }
          }
          tags {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
      meta {
        pagination {
          total
          page
          pageSize
          pageCount
        }
      }
    }
  }
`;

export async function getPosts(page = 1, pageSize = 10, sort = ['publishedAt:desc']) {
  const data = await getClient().request<PostsResponse>(POSTS_QUERY, {
    pagination: { page, pageSize },
    sort,
  });
  return data.posts;
}

export async function getPost(id: string) {
  const data = await getClient().request<PostResponse>(POST_QUERY, { id });
  return data.post.data;
}

export async function searchPosts(query: string, page = 1, pageSize = 10) {
  const data = await getClient().request<PostsResponse>(SEARCH_POSTS_QUERY, {
    filters: {
      title: { containsi: query },
    },
    pagination: { page, pageSize },
    sort: ['publishedAt:desc'],
  });
  return data.posts;
}

export async function getPostsByTag(tagName: string, page = 1, pageSize = 10) {
  const data = await getClient().request<PostsResponse>(SEARCH_POSTS_QUERY, {
    filters: {
      tags: { name: { eqi: tagName } },
    },
    pagination: { page, pageSize },
    sort: ['publishedAt:desc'],
  });
  return data.posts;
}
