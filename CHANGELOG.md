# Change Log

All notable changes to the "n0n3br-paste-json-jsdoc" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.1.0] - 2026-08-24

### Fixed
- Nested objects and arrays of objects now emit their referenced typedefs (previously generated references to types that did not exist)
- Type names are sanitized, so invalid identifiers cannot break the output

### Changed
- Generator extracted to its own module; test suite now imports the real code (14 tests)

- Initial release