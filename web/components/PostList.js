import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Link } from '../routes';

const POSTS_PER_PAGE = 10;

function PostList({ data: { loading, error, posts }, loadMorePosts }) {
  if (error) return <ErrorMessage message="Error loading posts." />;
  if (!posts) {
    return <div>Loading..</div>;
  }
  return (
    <section>
      <ul>
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link route="post" params={{ slug: post.slug }}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        section {
          padding-bottom: 20px;
        }
        li {
          display: block;
          margin-bottom: 10px;
        }
        div {
          align-items: center;
          display: flex;
        }
        a {
          font-size: 14px;
          margin-right: 10px;
          text-decoration: none;
          padding-bottom: 0;
          border: 0;
        }
        span {
          font-size: 14px;
          margin-right: 5px;
        }
        ul {
          margin: 0;
          padding: 0;
        }
        button:before {
          align-self: center;
          border-style: solid;
          border-width: 6px 4px 0 4px;
          border-color: #ffffff transparent transparent transparent;
          content: '';
          height: 0;
          margin-right: 5px;
          width: 0;
        }
      `}</style>
    </section>
  );
}

export const posts = gql`
  query posts($limit: Int!, $skip: Int!) {
    posts(limit: $limit, skip: $skip) {
      id
      title
      slug
    }
  }
`;
export const postsQueryVars = {
  skip: 0,
  limit: POSTS_PER_PAGE,
};

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
export default graphql(posts, {
  options: {
    variables: postsQueryVars,
  },
  props: ({ data }) => {
    return {
      data,
    };
  },
})(PostList);
