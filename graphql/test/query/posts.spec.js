const { startServer, stopServer, gqlRequest, nock, mock, _ } = global.testUtils;

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

    it('type Post should exist on schema', async () => {
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
    it(`type Post should contain fields ${expectedFields.join(', ')}`, () => {
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
      let postResponse;
      let body;
      beforeEach(async () => {
        nock.cleanAll();
        const fixture = [
          {
            id: 'post1',
            title: 'Hello world',
          },
        ];

        postResponse = jest.fn(() => [200, fixture]);
        mock('/posts', postResponse);

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

      it('returns a post array', async () => {
        expect(body).not.toHaveProperty('errors');
        expect(_.isArray(body.data.posts)).toBeTruthy();
      });

      it('calls rest service', async () => {
        expect(postResponse).toHaveBeenCalledTimes(1);

        expect(body.data.posts.length).toBe(1);
        expect(body.data.posts[0].id).toBe('post1');
        expect(body.data.posts[0].title).toBe('Hello world');
      });
    });
    describe('with `limit` argument', () => {
      it('queries `/posts/?_limit=x', async () => {
        nock.cleanAll();
        const fixture = [
          {
            id: 'post1',
            title: 'Hello world',
          },
        ];

        const postResponse = jest.fn(() => [200, fixture]);
        mock('/posts', postResponse, ({ q }) => {
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

        expect(postResponse).toHaveBeenCalledTimes(1);

        expect(body.data.posts.length).toBe(1);
        expect(body.data.posts[0].id).toBe('post1');
        expect(body.data.posts[0].title).toBe('Hello world');
      });
    });
  });
});
