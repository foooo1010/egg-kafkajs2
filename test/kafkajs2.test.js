'use strict';

const mock = require('egg-mock');
mock.consoleLevel('DEBUG');
describe('test/kafkajs2.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/kafkajs2-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, kafkajs2')
      .expect(200);
  });
});
