# Contributing to SwiftPlay

Thank you for your interest in contributing to SwiftPlay! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Video-Speed-Controls.git
   ```
3. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Extension Development

### Local Testing
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension directory
4. Make changes to the code
5. Click the refresh icon in `chrome://extensions/` to test changes

### Code Style Guidelines

#### JavaScript
- Use ES6+ features when appropriate
- Follow camelCase naming convention
- Add comments for complex logic
- Use meaningful variable and function names

#### Chrome Extension Best Practices
- Minimize permissions in manifest.json
- Use event listeners instead of inline scripts
- Implement proper error handling
- Clean up event listeners and observers when not needed

### Testing Your Changes

1. **Basic Testing**
   - Test on different video platforms
   - Verify speed changes work correctly
   - Check settings persistence
   - Test disabled sites functionality

2. **Edge Cases**
   - Test with multiple video players on one page
   - Verify memory usage with long-running sessions
   - Check behavior with dynamically loaded videos

3. **Performance Testing**
   - Monitor CPU usage during speed changes
   - Check memory leaks
   - Test with various video qualities and lengths

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version number in manifest.json following [SemVer](https://semver.org/)
3. Ensure your code follows the existing style
4. Create a Pull Request with a clear title and description

### PR Title Format
- feat: Add new feature
- fix: Fix a bug
- docs: Change documentation
- style: Format code
- refactor: Restructure code without behavior changes
- test: Add or update tests

## Bug Reports

When filing an issue, please include:

1. Chrome version
2. Extension version
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Any relevant console errors
7. Website where the issue occurs

## Feature Requests

Feature requests are welcome! Please provide:

1. Clear description of the feature
2. Use case and benefits
3. Possible implementation approach
4. Any potential concerns or challenges

## Code Review Process

1. At least one maintainer will review your PR
2. Address any comments or requested changes
3. Once approved, a maintainer will merge your PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
