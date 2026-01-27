# Security

## API Key Security

**Never expose your Runway API secret (`RUNWAYML_API_SECRET`) to the client.**

This SDK is designed with a server-client architecture:

1. Your **server** holds the API secret and creates sessions via `@runwayml/sdk`
2. Your **client** receives only the session credentials (token, URL) needed for WebRTC connection

The session token is short-lived and scoped to a single session, making it safe to send to the client.

## Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email [security@runwayml.com](mailto:security@runwayml.com) with details
