# Development Guide

This guide covers the development workflow for the SOLA Token project.

## Development Setup

1. Generate a new keypair:
```bash
solana-keygen grind --starts-with sola:1
```

2. Build the project:
```bash
npm run build
```

## Testing

Run the test suite:
```bash
npm test
```

## Development Best Practices

- Always work on feature branches
- Write tests for new features
- Update documentation as needed
- Follow the project's code style guidelines

## Local Development Environment

1. Start a local validator:
```bash
solana-test-validator
```

2. Run the development server:
```bash
npm run dev
``` 