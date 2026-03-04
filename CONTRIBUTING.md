# Contributing to Autospend X402

Thank you for your interest in contributing to the Autospend X402 Payment Extension! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- Chrome browser (latest version)
- Coinbase Wallet extension
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbrahamOjes/autospend-x402.git
   cd autospend-x402
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load extension in Chrome**
   - Open Chrome → Extensions → Developer mode
   - Click "Load unpacked"
   - Select the `autospend-x402` folder

4. **Start test server**
   ```bash
   npm run dev
   ```

## Project Structure

```
autospend-x402/
├── manifest.json           # Extension manifest
├── background.js           # Service worker
├── x402-content-improved.js # Main content script
├── wallet-bridge.js        # Wallet provider bridge
├── popup/
│   ├── x402-popup.html
│   ├── x402-popup.js
│   └── popup-connection-handler.js
├── utils/
│   ├── constants.js        # Centralized constants
│   ├── logger.js           # Logging utility
│   ├── validation.js       # Input validation
│   └── error-handler.js    # Error handling
├── tests/                  # Test files
├── test-pages/            # Test HTML pages
└── icons/                 # Extension icons
```

## Development Guidelines

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add JSDoc comments for functions
- Keep functions small and focused

### Naming Conventions

- **Files**: `kebab-case.js`
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`

### Logging

Use the centralized logger instead of `console.log`:

```javascript
const logger = createLogger('MyContext');
logger.info('Information message');
logger.error('Error message');
logger.debug('Debug message');
```

### Error Handling

Use the error handler utility for consistent error messages:

```javascript
const errorInfo = handleError(error, { balance, amount });
// Display errorInfo to user
```

### Constants

Add new constants to `constants.js`:

```javascript
export const MY_CONSTANT = {
  KEY: 'value'
};
```

## Making Changes

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Refactor: `refactor/description`

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(wallet): add balance checking before payment
fix(x402): resolve duplicate detection issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the code style guidelines
   - Add tests if applicable

3. **Test your changes**
   - Load the extension in Chrome
   - Test all affected functionality
   - Check console for errors

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots if UI changes

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested in Chrome
- [ ] Commit messages follow conventions

## Testing

### Manual Testing

1. **X402 Detection**
   - Navigate to `http://localhost:9000/test-pages/x402-test.html`
   - Verify X402 badge appears
   - Check console for detection logs

2. **Wallet Connection**
   - Open extension popup
   - Click "Connect Wallet"
   - Verify wallet connects successfully

3. **Payment Flow**
   - Navigate to X402-enabled page
   - Connect wallet
   - Make payment
   - Verify transaction completes

### Test Pages

- `test-pages/x402-test.html` - X402 detection
- `test-pages/x402-payment-test.html` - Payment flow
- `test-pages/wallet-detection-test.html` - Wallet detection

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser version
- Extension version
- Console errors

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (optional)
- Mockups or examples (optional)

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email security@autospend.ai with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Security Best Practices

- Never commit private keys or secrets
- Validate all user inputs
- Sanitize data before display
- Use CSP-compliant code
- Follow principle of least privilege
- Keep dependencies updated

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Coinbase Wallet SDK](https://docs.cloud.coinbase.com/wallet-sdk/docs)
- [X402 Protocol Specification](https://github.com/autospend/x402-spec)

## Questions?

- Open a discussion on GitHub
- Join our Discord community
- Email dev@autospend.ai

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
