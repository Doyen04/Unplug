const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL/POSTGRES_URL');
    process.exit(1);
}

const normalized = connectionString.includes('uselibpqcompat=true')
    ? connectionString
    : `${connectionString}${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`;

const client = new Client({
    connectionString: normalized,
    ssl: normalized.includes('localhost') ? false : { rejectUnauthorized: false },
});

(async () => {
    await client.connect();
    const result = await client.query(
        "select tablename from pg_tables where schemaname = 'public' and tablename in ('user','session','account','verification','rateLimit') order by tablename"
    );
    console.log(result.rows.map((row) => row.tablename).join(','));
    await client.end();
})();
