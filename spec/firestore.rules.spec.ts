import 'babel-polyfill';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as firestore from 'expect-firestore';
import DATA from './data.fixture'
import { testSecurityRules } from 'firestore-security-tests';
import { FirestoreTestInput, FirestoreMethod, FirestoreAuth, FirestoreTestResult } from './types';

const CREDENTIAL = require(join(__dirname, '..', 'credential.json'));
const RULES = readFileSync(join(__dirname, '..', 'firestore.rules'), { encoding: 'utf8' });

function createDocumentPath(path: string): string {
  return `/databases/(default)/documents/${path}`;
}

function createTest({
  allow = true,
  auth = {},
  path,
  data = {},
  method
}: {
    allow?: boolean,
    auth?: FirestoreAuth,
    path: string,
    data?: object,
    method: FirestoreMethod,
  }
): FirestoreTestInput {
  const request = {
    auth,
    path: createDocumentPath(path),
    method,
  };
  const resource = {
    data
  };
  return {
    expectation: allow ? 'ALLOW' : 'DENY',
    request,
    resource
  };
}

async function runTest(test: FirestoreTestInput) {
  const result = await firestore.assertDatabase().testRules(test) as FirestoreTestResult;
  console.log(result);
  console.log(`${test.request.method} ${test.request.path} with auth: ${test.request.auth.uid}
   => ${(result.state === 'SUCCESS' ? test.expectation : ('NOT ' + test.expectation))}`);

  expect(result.state).toBe('SUCCESS');
}

describe("firestore rules", () => {
  beforeAll(async () => {

    await firestore.authorize(CREDENTIAL);

    // setData and setRules can be called as many time as wanted
    firestore.setRules(RULES);

    firestore.setData(DATA);
  });


  it("should forbid list groups", async () => {
    // expect(await firestore.cannotGet({ auth: "TinyMan" }, 'groups/')).toBe(true);

    await runTest(createTest({
      allow: false,
      method: 'list',
      path: 'groups',
    }));
    await runTest(createTest({
      allow: false,
      auth: { uid: 'TinyMan' },
      method: 'list',
      path: 'groups',
    }));
  })

  it("should forbid write of group", async () => {
    await runTest(createTest({
      allow: false,
      method: 'create',
      path: 'groups/TEST',
      data: {},
    }))
  })
  it("should allow get of group by id for auth user", async () => {
    await runTest(createTest({
      path: 'groups/Groupe INNOV',
      method: 'get',
      auth: { uid: 'TinyMan' }
    }))
  })
  it("should forbid get of group by id for anonymous", async () => {
    await runTest(createTest({
      allow: false,
      path: 'groups/Groupe INNOV',
      method: 'get',
    }))
  })

  it("should forbid list of oders", async () => {
    await runTest(createTest({
      allow: false,
      path: 'groups/Groupe INNOV/orders',
      method: 'list'
    }))
  })

})
