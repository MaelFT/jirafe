// MIGRATION: Utilise maintenant PostgreSQL au lieu de Supabase
// ⚠️ NE PAS IMPORTER DIRECTEMENT database.ts côté client !
// Les composants doivent passer par les API routes

// Réexport des types seulement
export type { Pool } from 'pg';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  created_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  avatar: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
};

export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & { user: User })[];
  memberCount?: number;
  boardCount?: number;
};

export type Board = {
  id: string;
  name: string;
  owner_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
};

export type Column = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  board_id: string;
  created_at: string;
};

export type Subtask = {
  id: string;
  card_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
};

export type CardActivity = {
  id: string;
  card_id: string;
  user_id: string | null;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export type Card = {
  id: string;
  column_id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  position: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  card_id: string;
  author_id: string;
  text: string;
  created_at: string;
  updated_at: string;
};

export type CardWithDetails = Card & {
  assignee?: User | null;
  comments?: (Comment & { author: User })[];
  tags?: Tag[];
  subtasks?: Subtask[];
  activities?: (CardActivity & { user: User | null })[];
};

export type ColumnWithCards = Column & {
  cards: CardWithDetails[];
};

export type BoardWithColumns = Board & {
  columns: ColumnWithCards[];
};
