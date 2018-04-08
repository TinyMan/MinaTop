
export interface GoogleCredential {
  project_id: string,
  client_email: string,
  private_key: string
};

export interface FirestoreDocument {
  key: string,
  fields: {
    [id: string]: any
  },
  collections: FirestoreCollections
};

export type FirestoreCollection = FirestoreDocument[];

export interface FirestoreCollections {
  [id: string]: FirestoreCollection
};

// Parameters to define the Firebase authentication being used
export interface FirestoreAuth {
  uid?: string
};

export type FirestoreMethod = 'get' | 'list' | 'create' | 'update' | 'delete' | 'read' | 'write';

// Request in a test (for GETs)
export interface FirestoreRequest {
  auth: FirestoreAuth,
  path: string,
  method: FirestoreMethod,
};

// Resource for a test (for write)
export interface FirestoreResource {
  data: object
};

// Input for a test
export interface FirestoreTestInput {
  expectation: 'ALLOW' | 'DENY',
  request: FirestoreRequest,
  resource?: FirestoreResource
};

// Result of a test.
export interface FirestoreTestResult {
  state: 'SUCCESS' | 'FAILURE'
};
