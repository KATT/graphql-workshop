import App from '../components/App';
import Header from '../components/Header';
import PostView from '../components/PostView';
import gql from 'graphql-tag';
import Error from 'next/error';
import { Query } from 'react-apollo';
import ErrorMessage from '../components/ErrorMessage';

export const postBySlug = gql`
  query postBySlug($slug: String!) {
    post(slug: $slug) {
      id
      title
      slug
      text
    }
  }
`;

export default class PostPage extends React.Component {
  static getInitialProps({ query, res }) {
    const { slug } = query;
    return { slug };
  }
  render() {
    return (
      <App>
        <Header />
        <Query query={postBySlug} variables={{ slug: this.props.slug }}>
          {({ loading, error, data }) => {
            if (loading) {
              return <div>Loading</div>;
            }
            if (error) {
              return <ErrorMessage message="Error loading post." />;
            }
            const { post } = data;
            if (!post) {
              // TODO: fix so statusCode is 404
              return <ErrorMessage message="Post could not be found." />;
            }

            return <PostView {...post} />;
          }}
        </Query>
      </App>
    );
  }
}
