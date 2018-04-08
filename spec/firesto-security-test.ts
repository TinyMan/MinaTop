var testResourceObj = {
  source: {
    files: [{
      name: 'firestore.rules',
      content: `service cloud.firestore {
                match /databases/{database}/documents {match /{document=**} {
                  allow get: if request.auth.uid != '7QLCpgSZ5CdaVhj52GC50jhe1o02-INVALID';
                  allow list: if true;
                  allow write: if false
                  }
                }
              }`
    }]
  },
  testSuite: {
    testCases: [{
      expectation: 'ALLOW',
      request: {
        auth: {
          uid: '7QLCpgSZ5CdaVhj52GC50jhe1o02'
        },
        path: '/databases/(default)/documents/licenses/abcd',
        method: 'get'
      },
      functionMocks: [
        {
          function: 'get',
          args: [{ exact_value: '/databases/(default)/documents/users/123' }],
          result: { value: { data: { accountId: 'abcd' } } }
        }
      ]
    }, {
      expectation: 'ALLOW',
      request: {
        auth: {
          uid: '7QLCpgSZ5CdaVhj52GC50jhe1o02'
        },
        path: '/databases/(default)/documents/users',
        method: 'list'
      },
      functionMocks: []
    }, {
      expectation: 'ALLOW',
      request: {
        auth: {},
        path: '/databases/(default)/documents/groups/Groupe INNOV',
        method: 'get'

      }
    }]
  },
  keyCredentialsPath: 'credential.json',
};


// const result = await new Promise((res, rej) => testSecurityRules(res, testResourceObj, {
//   verbose: true
// }));
// console.log(result);
