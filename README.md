# gw Integration Tests
This repository provides a testing framework for market makers integrating with gw's platform. It allows users to validate their REST or WebSocket API responses against gw's integration standards and documentation.

Key features:
- Ensures that endpoints to be integrated adhere to gw's integration guide

For market makers preparing to integrate with gw, this repository helps streamline the integration process and reduce potential issues before going live.

## Getting started
1. Clone [gw-pmm-integration-tests](https://github.com/gw-org/gw-pmm-integration-tests) repository to your organization or personal account
2. Install the repository dependencies using: `npm i`

## Usage
If you're integrating via REST API, follow the instructions in the REST API Integration section. For WebSocket API integration, refer to the WebSocket API Integration section.

### REST API Integration
1. Follow the instructions in config template ([integration_tests/template/rest.config.ts](https://github.com/gw-gw/gw-pmm-integration-tests/blob/main/integration_tests/template/rest.config.ts)) and configure the necessary params accordingly
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
1. Follow the instructions in config template ([integration_tests/template/ws.config.ts](https://github.com/gw-gw/gw-pmm-integration-tests/blob/main/integration_tests/template/ws.config.ts)) and configure the necessary params accordingly
2. Do **NOT** change any code in any other files
3. Run all tests using: `npm run test:ws`

## Submission Process
After completing the integration:

1. Ensure all tests have passed
2. Take screenshots of the passed tests
3. Submit a support ticket on [Discord](https://discord.com/channels/1260408757314257056/1260411743482417165)
4. Attach the screenshots to your support ticket

We'll review your submission and get back to you as soon as possible.

## Disclaimer
gw uses its own internal testing suite to make sure data sent to your API endpoints are structured correctly. 
This repository only focuses on testing common, expected scenarios. 

You will be responsible for:
1. Ensuring your orderbook is accurate
2. Providing valid firm quotes
3. Generating correct signed quotes
4. Handling any errors appropriately

We trust you to handle unusual situations or errors on your end as you know your system best.
