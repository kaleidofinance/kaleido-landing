import { config } from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';

// Resolve project root reliably in both CJS and ESM contexts
const projectRoot = (typeof process !== 'undefined' && process.cwd()) || '.';
const envPath = resolve(projectRoot, '.env.local');
console.log('Loading environment variables from:', envPath);
config({ path: envPath });

// Utility: split SQL file into executable statements while supporting DELIMITER
function splitSqlStatements(sql: string): string[] {
  const lines = sql.split(/\r?\n/);
  const statements: string[] = [];
  let currentDelimiter = ';';
  let buffer = '';

  for (let rawLine of lines) {
    const line = rawLine.trim();

    // Handle DELIMITER directive (mysqldump style)
    const delimMatch = line.match(/^DELIMITER\s+(.+)$/i);
    if (delimMatch) {
      currentDelimiter = delimMatch[1];
      continue;
    }

    // Skip single-line comments
    if (line.startsWith('--') || line.startsWith('#')) continue;

    buffer += rawLine + '\n';

    // If the buffer ends with the current delimiter, split
    if (currentDelimiter === ';') {
      if (line.endsWith(';')) {
        statements.push(buffer.trim());
        buffer = '';
      }
    } else {
      if (line.endsWith(currentDelimiter)) {
        // strip the delimiter from the end
        const stmt = buffer.slice(0, -currentDelimiter.length).trim();
        statements.push(stmt);
        buffer = '';
      }
    }
  }

  if (buffer.trim()) {
    statements.push(buffer.trim());
  }

  // Remove empty statements
  return statements.map(s => s.trim()).filter(s => s.length > 0);
}

async function main() {
  try {
  const dumpPathArg = process.argv[2];
  const defaultPath = resolve(projectRoot, 'dump.sql');
  const dumpPath = dumpPathArg ? resolve(process.cwd(), dumpPathArg) : defaultPath;

    if (!fs.existsSync(dumpPath)) {
      console.error('Dump file not found:', dumpPath);
      process.exit(1);
    }

    console.log('Using dump file:', dumpPath);

    const rawSql = fs.readFileSync(dumpPath, 'utf8');
    console.log('Read dump.sql, size:', rawSql.length, 'bytes');

    const statements = splitSqlStatements(rawSql);
    console.log('Parsed', statements.length, 'statements to execute');

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || undefined,
      multipleStatements: false // we execute statements individually
    });

    console.log('Connected to MySQL:', { host: process.env.MYSQL_HOST, database: process.env.MYSQL_DATABASE });

    // Execute statements sequentially
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        const preview = stmt.replace(/\s+/g, ' ').substring(0, 160);
        console.log(`Executing statement ${i + 1}/${statements.length}:`, preview + (stmt.length > 160 ? '...' : ''));
        await connection.query(stmt);
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err && err.message ? err.message : err);
        // Continue executing remaining statements but log the error
      }
    }

    await connection.end();
    console.log('Finished applying dump.sql');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
