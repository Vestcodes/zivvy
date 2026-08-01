const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('Zivvy triggers parsePayload', () => {
  for (const [key, trigger] of Object.entries(App.triggers)) {
    test(key + ' perform returns array with id', async () => {
      const bundle = {
        cleanedRequest: {
          event: 'test.event',
          resource: 'test',
          data: { name: 'DOC-1', status: 'Open', customer: 'C1' },
          timestamp: '2026-07-25T12:00:00Z',
        },
      };
      const results = await appTester(trigger.operation.perform, bundle);
      expect(Array.isArray(results)).toBe(true);
      expect(results[0].name).toBe('DOC-1');
      expect(results[0].id).toBeTruthy();
    });
  }
});
