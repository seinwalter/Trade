# CLAUDE.md - AI Assistant Guide for Trade Repository

**Last Updated**: 2025-11-15
**Repository**: Trade
**Status**: New Repository - Initial Setup Phase

---

## Overview

This is a new repository for a project called "Trade". As this codebase grows, this document will serve as the primary reference for AI assistants to understand the project structure, development workflows, and key conventions.

---

## Current Repository State

### Project Structure
```
Trade/
├── .git/              # Git version control
├── README.md          # Project documentation (minimal)
└── CLAUDE.md          # This file - AI assistant guide
```

### Repository Information
- **Branch**: `claude/claude-md-mhzlgl2vrovn788r-01Rxjv3XVQQGWZVcX2sii1Fa`
- **Initial Commit**: b31119f - Initial commit
- **Status**: Clean working directory

---

## Development Workflows

### Git Workflow

#### Branching Strategy
- Development occurs on feature branches prefixed with `claude/`
- Branch naming pattern: `claude/claude-md-<session-id>`
- Always verify current branch before making changes

#### Commit Guidelines
- Write clear, descriptive commit messages
- Use conventional commit format when possible:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

#### Push Protocol
- **CRITICAL**: Always use `git push -u origin <branch-name>`
- Branch must start with 'claude/' and end with matching session ID
- If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Example:
  ```bash
  git push -u origin claude/claude-md-<session-id>
  ```

### Code Review Process
- Review changes before committing
- Ensure no sensitive data (API keys, credentials) are committed
- Verify all tests pass before pushing

---

## Key Conventions for AI Assistants

### Code Quality Standards

#### Security
- **Never** commit credentials, API keys, or sensitive data
- Check for common vulnerabilities:
  - SQL injection
  - XSS (Cross-Site Scripting)
  - Command injection
  - Path traversal
  - CSRF (Cross-Site Request Forgery)
- Review OWASP Top 10 vulnerabilities

#### Code Style
- Follow language-specific best practices
- Maintain consistent indentation and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

#### Testing
- Write tests for new features
- Ensure existing tests pass before committing
- Aim for meaningful test coverage
- Include edge cases and error scenarios

### File Operations Best Practices

#### When Creating New Files
1. Check if a similar file already exists
2. Follow existing naming conventions
3. Place files in appropriate directories
4. Update relevant documentation

#### When Modifying Existing Files
1. Always read the file first using the Read tool
2. Understand the context before making changes
3. Preserve existing code style and patterns
4. Test changes thoroughly

#### When Deleting Files
1. Verify the file is truly obsolete
2. Check for dependencies or references
3. Update documentation and imports

---

## Development Environment

### Prerequisites
*To be determined as project evolves*

### Setup Instructions
*To be added when project dependencies are established*

### Build Process
*To be documented when build tools are configured*

### Testing
*To be documented when test framework is established*

---

## Architecture and Design Patterns

### Project Type
*To be determined - Current state: Empty repository*

Potential project types to consider:
- Web application (Frontend/Backend)
- Trading bot or financial application
- API service
- Data analysis tool
- Mobile application

### Technology Stack
*To be documented as technologies are selected*

### Design Patterns
*To be documented as the codebase develops*

---

## Common Tasks and Workflows

### Adding a New Feature
1. Create a feature branch from main
2. Implement the feature with tests
3. Update documentation
4. Commit with descriptive message
5. Push to remote branch
6. Create pull request

### Fixing a Bug
1. Identify and reproduce the bug
2. Write a test that exposes the bug
3. Fix the issue
4. Verify the test passes
5. Commit and push changes

### Refactoring Code
1. Ensure comprehensive test coverage
2. Make incremental changes
3. Run tests after each change
4. Update documentation if APIs change
5. Commit with clear refactoring message

---

## Documentation Standards

### Code Documentation
- Add docstrings/comments for public APIs
- Document complex algorithms
- Include usage examples for utilities
- Keep documentation close to code

### README Updates
- Keep README.md current with project evolution
- Include setup instructions
- Document environment variables
- Provide usage examples

### CLAUDE.md Maintenance
**IMPORTANT**: Update this file when:
- Project structure changes significantly
- New technologies are adopted
- Development workflows are modified
- New conventions are established
- Major architectural decisions are made

---

## Error Handling and Debugging

### Error Handling Principles
- Fail fast and provide clear error messages
- Use appropriate error types/classes
- Log errors with sufficient context
- Handle edge cases gracefully
- Never swallow exceptions silently

### Debugging Workflow
1. Reproduce the issue consistently
2. Isolate the problem area
3. Use logging/debugging tools
4. Test potential fixes
5. Verify the fix resolves the issue
6. Add tests to prevent regression

---

## Dependencies and Package Management

### Adding Dependencies
*To be documented when package manager is established*

### Updating Dependencies
*To be documented when package manager is established*

### Security Audits
- Regularly check for vulnerable dependencies
- Keep dependencies up to date
- Review dependency licenses

---

## Performance Considerations

### General Guidelines
- Profile before optimizing
- Focus on algorithmic efficiency
- Consider memory usage
- Optimize database queries
- Cache appropriately
- Use async/parallel processing where beneficial

---

## AI Assistant Specific Guidelines

### Task Planning
- Use TodoWrite tool for multi-step tasks
- Break complex tasks into smaller steps
- Mark todos as completed immediately after finishing
- Keep only one task in_progress at a time

### Code References
- Reference code using `file_path:line_number` format
- Example: "The error occurs in src/main.py:42"

### Tool Usage
- Use specialized tools over bash commands when available
- Read files before editing them
- Make parallel tool calls when operations are independent
- Use Task tool with Explore subagent for codebase exploration

### Communication
- Be concise and technical
- Avoid unnecessary emojis unless requested
- Focus on facts and problem-solving
- Provide objective guidance

### Security Context
- Assist with authorized security testing
- Support defensive security and CTF challenges
- Refuse destructive techniques without authorization
- Require clear context for dual-use security tools

---

## Project-Specific Conventions

### Naming Conventions
*To be established as project develops*

### Directory Structure
*To be documented when structure is established*

### Configuration Management
*To be documented when configuration approach is determined*

---

## Resources and References

### Internal Documentation
- README.md - Project overview and setup
- CLAUDE.md - This file

### External Resources
*To be added as project dependencies are established*

---

## Changelog

### 2025-11-15
- Initial creation of CLAUDE.md
- Established basic structure and guidelines
- Set up framework for future updates

---

## Notes for Future Development

### Next Steps
1. Determine project type and purpose
2. Select technology stack
3. Establish project structure
4. Set up development environment
5. Configure build and test tools
6. Implement initial features

### Questions to Address
- What is the primary purpose of this "Trade" application?
- What technologies and frameworks will be used?
- What are the deployment targets?
- What are the performance requirements?
- What are the security requirements?

---

## Maintenance

This document should be reviewed and updated:
- After significant architectural changes
- When new development patterns emerge
- When team conventions are established
- At minimum, quarterly

**Maintainers**: AI assistants should proactively update this document when making structural changes to the repository.
