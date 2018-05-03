const { startServer, stopServer, gqlRequest, uri } = global.testUtils;
describe('query.hello', () => {
  beforeEach(startServer);
  afterEach(stopServer);

  it('returns greeting', async () => {
    const query = `
      query {
          hello(name: "KATT")
      }
    `;
    const body = await gqlRequest({ query });

    expect(body).toEqual({
      data: {
        hello: 'Hello KATT',
      },
    });
  });
});
