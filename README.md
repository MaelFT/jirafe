# Jirafe - Project Management System

A beautiful, production-ready Jira-like task management application built with Next.js, Supabase, and modern web technologies.

## Features

### Core Functionality
- **Board Management**: Create multiple boards with customizable columns
- **Card System**: Add, edit, and organize tasks with drag-and-drop
- **Priority Levels**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low) with color coding
- **User Assignment**: Assign cards to team members with visual avatars
- **Comments**: Add, edit (within 10 minutes), and delete comments on cards
- **Search & Filters**: Real-time search by title/ID, filter by assignee and priority
- **URL State**: Filters synchronized with browser URL for easy sharing

### User Experience
- **Drag & Drop**: Smooth card reordering within and across columns
- **Modal Details**: Full card details with inline editing
- **Welcome Screen**: Sample project creation for new users
- **Responsive Design**: Beautiful UI that works on all screen sizes
- **Dark Mode Ready**: Full dark mode support

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **State Management**: Zustand with persistence
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Database Schema

### Tables
- `users` - Team members with avatars
- `boards` - Project boards
- `columns` - Board columns (To Do, In Progress, Done, etc.)
- `cards` - Task cards with title, description, priority, assignee
- `comments` - Card comments with author and timestamps

### Security
- Row Level Security (RLS) enabled on all tables
- Public access policies for demo purposes
- Automatic timestamp management

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

## Usage

1. **Select User**: Choose your user identity from the dropdown in the header
2. **Create Board**: Click "New Board" or create a sample project
3. **Add Cards**: Click the + button in any column to create a card
4. **Drag Cards**: Click and drag cards to reorder or move between columns
5. **Edit Cards**: Click any card to view/edit details, add comments, change priority
6. **Search**: Use the search bar and filters to find specific cards

## Features in Detail

### Card Priorities
- **P0 - Critical**: Highest priority, red badge
- **P1 - High**: High priority, orange badge
- **P2 - Medium**: Medium priority, blue badge
- **P3 - Low**: Low priority, gray badge

### Comment Editing
- Comments can be edited within 10 minutes of creation
- Only the comment author can edit their own comments
- Visual indicator for edited comments

### Search & Filters
- Search by card title or ID
- Filter by assigned user
- Filter by priority level
- Clear all filters with one click
- Filters persist in URL for sharing

## Project Structure

```
/app
  layout.tsx          - Root layout with metadata
  page.tsx           - Main application page
/components
  board-column.tsx    - Column component with droppable area
  board-selector.tsx  - Board creation and selection
  board-view.tsx      - Main board view with DnD context
  card-detail-modal.tsx - Full card details modal
  search-filters.tsx  - Search and filter controls
  task-card.tsx       - Individual card component
  user-selector.tsx   - User selection dropdown
  welcome-screen.tsx  - Initial welcome screen
  /ui                - shadcn/ui components
/lib
  store.ts           - Zustand state management
  supabase.ts        - Supabase client and types
  utils.ts           - Utility functions
```

## Environment Variables

The following variables are automatically configured in Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Development

### Adding New Features
1. Create database tables/columns via migrations in Supabase
2. Update TypeScript types in `lib/supabase.ts`
3. Build components following existing patterns
4. Ensure RLS policies are properly configured

### Code Style
- Use TypeScript for all components
- Follow existing component structure
- Use Tailwind utility classes
- Leverage shadcn/ui components
- Keep components focused and reusable

## License

MIT
