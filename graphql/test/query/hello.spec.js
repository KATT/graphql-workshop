const { startServer, stopServer, request, uri } = global.testUtils;
describe('query.hello', () => {
  beforeEach(startServer);
  afterEach(stopServer);

  it('can return hello', async () => {
    const query = `
      query {
          hello(name: "KATT")
      }
    `;
    const opts = {
      uri: uri(),
      method: 'POST',
      json: true,
      body: { query },
    };
    const body = await request(opts);

    expect(body).toEqual({
      data: {
        hello: 'Hello KATT',
      },
    });
  });
});
