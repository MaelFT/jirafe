import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL
// ⚠️ CE MODULE NE DOIT ÊTRE UTILISÉ QUE CÔTÉ SERVEUR (API routes, Server Components)
const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433'),  // Port 5433 pour éviter conflit avec PostgreSQL local
  database: process.env.PGDATABASE || 'jirafe_db',
  user: process.env.PGUSER || 'jirafe',
  password: process.env.PGPASSWORD || 'jirafe_dev_2024',
  max: 10, // Nombre maximum de connexions dans le pool
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
};

// Pool de connexions PostgreSQL
export const pool = new Pool(config);

// Helper pour les requêtes simples
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Types exportés (identiques à supabase.ts)
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

// Exports pour usage dans les API routes
export const db = pool;
export const sql = pool;

