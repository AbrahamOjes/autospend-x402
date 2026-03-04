# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Autospend. If you discover a security vulnerability, please follow these steps:

### Do NOT

- ❌ Create a public GitHub issue
- ❌ Discuss the vulnerability publicly before it's fixed
- ❌ Exploit the vulnerability beyond what's necessary to demonstrate it

### Do

1. **Email us directly** at **security@autospend.ai**
2. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer anonymity)

## Security Best Practices

When contributing to this project, please follow these security guidelines:

### Code Security

- Never commit private keys, API keys, or secrets
- Validate all user inputs
- Sanitize data before display
- Use CSP-compliant code (no inline scripts)
- Follow the principle of least privilege

### Extension Security

- Request only necessary permissions
- Isolate content scripts from page context
- Use secure messaging between components
- Never access or store private keys

### Wallet Security

- Never request or handle private keys
- Always require user confirmation for transactions
- Verify network before processing payments
- Display clear transaction details to users

## Security Features

This extension implements the following security measures:

- ✅ **Manifest V3**: Latest Chrome extension security model
- ✅ **Content Security Policy**: No inline scripts allowed
- ✅ **Input Validation**: All inputs are validated and sanitized
- ✅ **Provider Isolation**: Wallet runs in separate context
- ✅ **User Confirmation**: All transactions require explicit approval
- ✅ **No Private Key Access**: Extension never handles private keys
- ✅ **Local Storage Only**: No external data transmission
- ✅ **Minimal Permissions**: Only required permissions requested

## Contact

For security concerns: **security@autospend.ai**

For general support: **support@autospend.ai**
