import ErrorMessage from './ErrorMessage';
import ReactMarkdown from 'react-markdown';

function PostView({ title, text }) {
  return (
    <article>
      <h1>{title}</h1>
      <ReactMarkdown source={text} />
    </article>
  );
}

export default PostView;
