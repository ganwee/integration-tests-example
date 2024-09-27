# Integration Tests Example
This repository is a PoC to test external REST or WebSocket API responses using NestJS in a Web3 context. 

Key features:
- Asserts external endpoint responses are validated against a set of defined params accepted locally

## Getting started
1. Clone [integration-tests-example](https://github.com/ganwee/integration-tests-example) repository to your organization or personal account
2. Install the repository dependencies using: `npm i`

## Usage
This is an example repository to demonstrate how validation can be done using REST or WebSocket APIs

### REST API Integration
1. Follow the instructions in config template ([integration_tests/template/rest.config.ts](https://github.com/ganwee/integration-tests-example/blob/main/integration_tests/template/rest.config.ts)) and configure the necessary params accordingly
2. Do **NOT** change any code in any other files
3. Run all tests using: `npm run test:rest`

### WebSocket API Integration
In this testing environment, the typical client-server WebSocket connection is modified:

1. The testing repository acts as an intermediary
2. It emits events and validates responses for both the testing server and your client

To ensure successful test execution:

1. Configure your WebSocket endpoint
2. Whitelist the testing repository to allow handshake establishment

These steps are crucial for the tests to function correctly.
1. Follow the instructions in config template ([integration_tests/template/ws.config.ts](https://github.com/ganwee/integration-tests-example/blob/main/integration_tests/template/ws.config.ts)) and configure the necessary params accordingly
2. Do **NOT** change any code in any other files
3. Run all tests using: `npm run test:ws`
