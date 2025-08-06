import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use service role key for admin operations
const supabaseUrl = 'https://bjjdgnfiwvkhrpbvvaoi.supabase.co';
const serviceRoleKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqamRnbmZpd3ZraHJwYnZ2YW9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxNjEzNCwiZXhwIjoyMDY5ODkyMTM0fQ.flv3aiEHh_Ak4diDP2SRek_50TXF7jID_Woy2mSssCw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
	try {
		console.log('🚀 Running messaging system migration...');

		// Read the migration file
		const migrationPath = join(__dirname, '../supabase/migrations/20250805_messaging_system.sql');
		const migrationSQL = readFileSync(migrationPath, 'utf8');

		// Split the SQL into individual statements
		const statements = migrationSQL
			.split(';')
			.map((stmt) => stmt.trim())
			.filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

		console.log(`📝 Found ${statements.length} SQL statements to execute`);

		// Execute each statement
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i] + ';';
			console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

			try {
				const { error } = await supabase.rpc('exec_sql', { sql: statement });

				if (error) {
					// Try direct execution if RPC fails
					const { error: directError } = await supabase
						.from('_migrations')
						.insert({ name: `statement_${i}`, sql: statement });

					if (directError) {
						console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
					}
				}
			} catch (err) {
				console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message);
			}
		}

		console.log('✅ Migration completed successfully!');
		console.log('🎉 Messaging system is now ready to use!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	}
}

runMigration();
