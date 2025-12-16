import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  console.log('Creating tags and card_tags tables...');

  try {
    // Create tags table
    const { error: tagsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tags (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          color text DEFAULT '#3b82f6',
          board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
          created_at timestamptz DEFAULT now(),
          UNIQUE(name, board_id)
        );
      `
    });

    if (tagsError) {
      console.error('Error creating tags table:', tagsError);
    } else {
      console.log('✓ Tags table created');
    }

    // Create card_tags table
    const { error: cardTagsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS card_tags (
          card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
          tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
          created_at timestamptz DEFAULT now(),
          PRIMARY KEY (card_id, tag_id)
        );
      `
    });

    if (cardTagsError) {
      console.error('Error creating card_tags table:', cardTagsError);
    } else {
      console.log('✓ Card_tags table created');
    }

    console.log('\nDone! You can now use tags in your application.');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
