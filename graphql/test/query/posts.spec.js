const { startServer, stopServer, gqlRequest, nock, mock, _ } = global.testUtils;

const usersFixture = [
  {
    id: 'user0',
    handle: 'user0-handle',
    firstName: 'user0-firstName',
    lastName: 'user0-lastName',
  },
  {
    id: 'user1',
    handle: 'user1-handle',
    firstName: 'user1-firstName',
    lastName: 'user1-lastName',
  },
];
const postsFixture = [
  {
    id: 'post0',
    title: 'Hello world',
    user: _.pick(usersFixture[0], ['id', 'handle']),
  },
  {
    id: 'post1',
    title: 'Hello world again',
    user: _.pick(usersFixture[1], ['id', 'handle']),
  },
];

describe('query.posts', () => {
  beforeEach(startServer);
  afterEach(stopServer);

  describe('definition', () => {
    let types;
    beforeEach(async () => {
      const query = `
        {
          __schema {
            types {
              name
              description
              fields {
                name
              }
            }
          }
        }
      `;
      const res = await gqlRequest({ query });

      types = res.body.data.__schema.types;
    });

    it.skip('type Post should exist on schema', async () => {
      const typeNames = _.map(types, 'name');
      expect(typeNames).toContain('Post');
    });

    const expectedFields = [
      'id',
      'title',
      'slug',
      'text',
      // 'user',
    ];
    it.skip(`type Post should contain fields ${expectedFields.join(
      ', ',
    )}`, () => {
      const fields = _.find(types, { name: 'Post' }).fields;
      const fieldNames = _.map(fields, 'name');
      for (const name of expectedFields) {
        expect(fieldNames).toContain(name);
      }
    });

    it.skip('Query.posts should be defined', () => {
      const fields = _.find(types, { name: 'Query' }).fields;
      const fieldNames = _.map(fields, 'name');

      expect(fieldNames).toContain('posts');
    });
  });

  describe('querying posts', () => {
    describe('without params', () => {
      let postsResponse;
      let body;
      beforeEach(async () => {
        nock.cleanAll();

        postsResponse = jest.fn(() => [200, postsFixture]);
        mock('/posts', postsResponse);

        const query = `
          query {
              posts { 
                id
                title
              }
          }
        `;
        const res = await gqlRequest({ query });
        body = res.body;
      });

      it.skip('returns a post array', async () => {
        expect(body).not.toHaveProperty('errors');
        expect(_.isArray(body.data.posts)).toBeTruthy();
      });

      it.skip('calls rest service', async () => {
        expect(postsResponse).toHaveBeenCalledTimes(1);

        expect(body.data.posts.length).toBe(2);
        expect(body.data.posts[0].id).toBe('post0');
        expect(body.data.posts[0].title).toBe('Hello world');
      });
    });

    describe('with `limit` argument', () => {
      it.skip('queries `/posts/?_limit=x', async () => {
        nock.cleanAll();

        const postsResponse = jest.fn(() => [200, postsFixture.slice(0, 1)]);
        mock('/posts', postsResponse, ({ q }) => {
          return q._limit === '1';
        });
        const query = `
          query {
              posts(limit: 1) { 
                id
                title
              }
          }
        `;
        const res = await gqlRequest({ query });
        const body = res.body;
        expect(postsResponse).toHaveBeenCalledTimes(1);

        expect(body.data.posts.length).toBe(1);
        expect(body.data.posts[0].id).toBe('post0');
        expect(body.data.posts[0].title).toBe('Hello world');
      });
    });

    describe('when getting related users', () => {
      let postsResponse;
      beforeEach(async () => {
        postsResponse = jest.fn(() => [200, postsFixture]);
        mock('/posts', postsResponse);
        mock('/users', usersFixture[0], ({ q }) => q.id === 'user0');
        mock('/users', usersFixture[1], ({ q }) => q.id === 'user1');
      });

      it.skip("can return the users' handle", async () => {
        const query = `
          query {
              posts { 
                id
                user {
                  handle
                }
              }
          }
        `;
        const res = await gqlRequest({ query });
        const body = res.body;

        expect(postsResponse).toHaveBeenCalledTimes(1);

        expect(body.data.posts.length).toBe(2);
        expect(body.data.posts[0].user.handle).toBe('user0-handle');
        expect(body.data.posts[1].user.handle).toBe('user1-handle');
      });

      it.skip("can return the users' firstName", async () => {
        const query = `
          query {
              posts { 
                id
                user {
                  firstName
                }
              }
          }
        `;
        const { body } = await gqlRequest({ query });

        expect(postsResponse).toHaveBeenCalledTimes(1);
        expect(body).not.toHaveProperty('errors');

        expect(body.data.posts.length).toBe(2);
        expect(body.data.posts[0].user.firstName).toBe('user0-firstName');
        expect(body.data.posts[1].user.firstName).toBe('user1-firstName');
      });
    });
  });
});
