# Custom Rounds Creation & Management - Requirements v2

## 1. Overview
Extend the existing quiz game with comprehensive round creation, editing, import/export capabilities. Users can create custom question sets using a built-in editor, save them locally, export for sharing, and import rounds from files or shared content.

## 2. Core Features

### 2.1 Round Creator Interface
- **Round Editor**: Full-featured UI for creating and editing question sets
- **Question Configuration**: Set question text with live preview
- **Answer Management**: Add, edit, remove, and reorder up to 10 answers per round
- **Answer Properties**:
  - Primary text (required)
  - Alternative text (comma-separated synonyms/variations) 
  - Custom clue text (replaces numbered slots 1-10)
  - Additional text (extra info displayed in parentheses)
- **Validation**: Real-time validation with error highlighting
- **Preview Mode**: Test the round before saving

### 2.2 Round Management
- **Local Storage**: Automatic saving of rounds in browser localStorage
- **Round Library**: Browse, edit, duplicate, and delete saved rounds
- **Metadata**: Track creation date, last modified, play count
- **Import/Export**: File-based sharing with validation
- **Backup/Restore**: Export all saved rounds as a single file

### 2.3 Game Integration
- **Round Selection**: Choose between default rounds and custom rounds at game start
- **Mixed Games**: Combine default and custom rounds in a single game
- **Round Preview**: Quick preview of selected rounds before starting

## 3. Data Model Extensions

### 3.1 Enhanced Round Structure
```typescript
interface CustomRound extends QuestionSet {
  metadata: {
    id: string;           // UUID for tracking
    title: string;        // User-friendly name
    description?: string; // Optional round description
    author?: string;      // Creator name (optional)
    createdAt: string;    // ISO timestamp
    lastModified: string; // ISO timestamp
    playCount: number;    // Usage tracking
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;    // User-defined category
    isCustom: boolean;    // Distinguishes from default rounds
    version: string;      // Format version for compatibility
  };
  settings: {
    shuffleAnswers?: boolean;    // Randomize answer order
    timeLimit?: number;          // Per-answer time limit (future)
    allowPartialCredit?: boolean; // Fuzzy matching tolerance
  };
}
```

### 3.2 Round Collection Structure
```typescript
interface RoundCollection {
  version: string;
  exportDate: string;
  rounds: CustomRound[];
  metadata: {
    title?: string;
    description?: string;
    author?: string;
  };
}
```

## 4. User Interface Components

### 4.1 Round Creator Screen
- **Header**: Round title input, save/cancel buttons, validation status
- **Question Section**: Large text area for question text with character counter
- **Answers Section**: 
  - Expandable list (1-10 answers)
  - Drag-and-drop reordering
  - Individual answer cards with all properties
  - Quick-add buttons for common answer types
- **Settings Panel**: Round configuration options
- **Preview Panel**: Live preview of how the round will appear in-game

### 4.2 Round Library Screen
- **Grid View**: Cards showing round title, question preview, metadata
- **List View**: Compact table with sortable columns
- **Search & Filter**: By title, category, difficulty, creation date
- **Bulk Actions**: Select multiple rounds for export/delete
- **Sort Options**: Name, date created, last played, play count

### 4.3 Import/Export Interface
- **Export Modal**: 
  - Select rounds to export
  - Choose format (single round vs collection)
  - Add collection metadata
  - Download options
- **Import Modal**:
  - Drag-and-drop file area
  - Format validation with detailed error reporting
  - Preview imported rounds before adding
  - Conflict resolution (duplicate handling)

### 4.4 Game Setup Extensions
- **Round Source Selection**: Radio buttons for "Default Rounds", "Custom Rounds", "Mixed"
- **Round Picker**: Multi-select interface with preview
- **Round Order**: Drag-and-drop to arrange selected rounds

## 5. Import/Export Formats

### 5.1 Primary Format (JSON)
- **File Extension**: `.tenable` (custom extension for branding)
- **MIME Type**: `application/json`
- **Structure**: RoundCollection format with full metadata
- **Validation**: JSON schema validation with descriptive error messages

### 5.2 Compatibility Formats
- **Legacy JSON**: Support import of basic `rounds.json` format
- **CSV**: Simple format for bulk answer import (question + 10 answer columns)
- **Text**: Plain text format for quick round creation

### 5.3 Export Options
- **Single Round**: Individual `.tenable` file
- **Round Collection**: Multiple rounds in one file
- **Backup**: All user rounds with metadata
- **Sharing Format**: Optimized for sharing (reduced metadata)

## 6. Validation & Error Handling

### 6.1 Input Validation
- **Required Fields**: Question text, at least 1 answer with primary text
- **Length Limits**: Question (500 chars), answer text (100 chars each)
- **Duplicate Detection**: Warn about similar answers within a round
- **Format Validation**: JSON structure, required fields, data types

### 6.2 Import Validation
- **File Size Limits**: Maximum 1MB per import file
- **Format Verification**: Valid JSON, required fields present
- **Content Validation**: Answer count, text length, duplicate questions
- **Version Compatibility**: Handle format version differences gracefully

### 6.3 Error Messages
- **Real-time Feedback**: Inline validation with clear error descriptions
- **Import Errors**: Detailed report of what failed and how to fix
- **Recovery Options**: Partial import with error skipping

## 7. User Experience Flow

### 7.1 Creating a New Round
1. Click "Create Round" from main menu or round library
2. Enter round title and question text
3. Add answers one by one with auto-save drafts
4. Preview round in game format
5. Save to library with metadata

### 7.2 Editing Existing Round
1. Select round from library
2. Edit in same interface as creation
3. Track changes with "unsaved changes" indicator
4. Save changes or revert to last saved version

### 7.3 Sharing Rounds
1. Export individual round or collection
2. Share `.tenable` file via email/messaging/cloud storage
3. Recipient imports file through game interface
4. Preview and add to their library

### 7.4 Mixed Game Setup
1. Choose "Mixed" round source at game setup
2. Select from combined list of default and custom rounds
3. Arrange round order
4. Start game with customized round sequence

## 8. Technical Implementation Notes

### 8.1 Storage Strategy
- **localStorage**: Primary storage for user rounds
- **IndexedDB**: Future upgrade for larger datasets
- **Sync Prevention**: Clear data ownership (no cloud sync in MVP)

### 8.2 Performance Considerations
- **Lazy Loading**: Load round content only when needed
- **Efficient Updates**: Minimize re-renders during editing
- **File Size**: Keep export files reasonably sized

### 8.3 Accessibility
- **Keyboard Navigation**: Full keyboard access to all creation features
- **Screen Reader Support**: Proper labeling and descriptions
- **Focus Management**: Logical tab order in complex forms

## 9. Future Enhancements (Out of Scope)
- **Cloud Sync**: Online round sharing and sync across devices
- **Community Rounds**: Public round sharing platform
- **Advanced Import**: Import from external quiz platforms
- **Round Templates**: Quick-start templates for common categories
- **Collaborative Editing**: Multiple users editing the same round
- **Version History**: Track and restore previous versions of rounds

## 10. Acceptance Criteria
- [ ] Can create a new round with question and 10 answers
- [ ] Can edit all answer properties (text, alternatives, clue, additional)
- [ ] Can save rounds to local storage with auto-save drafts
- [ ] Can export individual rounds and collections to `.tenable` files
- [ ] Can import valid `.tenable` files with error handling
- [ ] Can browse and manage saved rounds in library interface
- [ ] Can select custom rounds for gameplay alongside default rounds
- [ ] All validation errors provide clear, actionable feedback
- [ ] Export/import maintains data integrity with no information loss
- [ ] Interface is responsive and accessible across screen sizes

---
This specification provides a comprehensive foundation for implementing user-generated content while maintaining the simplicity and quality of the existing game experience.