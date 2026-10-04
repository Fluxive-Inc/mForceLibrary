// ── FLT-BUILD-1 boot breadcrumbs, 2026-10-04 ────────────────────────────────
// This revision produced ZERO stdout and ZERO stderr across 21 instance starts,
// with no "Container called exit(1)" and no startup-probe line, and Cloud Run
// reported only "the user-provided container failed to start and listen on
// PORT=8080" — a sentence that names no cause. Every hypothesis (missing module,
// perimeter-guard exiting at module scope, a hang in db.js, memory) was checked
// and none of them fits a container that says nothing AND never exits: both
// secrets were bound, errlog-console calls the original console synchronously,
// `new Pool()` in pg does not connect, and Bridge ships the same heavy deps on
// the same default memory and is green.
//
// So the next build is made to answer the question instead of re-posing it.
// These three lines cost nothing and split the remaining space in half: if the
// next revision logs NOTHING AGAIN, then `node server.js` never executed and the
// fault is the image or the platform, not this file. If it logs the first line
// and stops, the failure is in a require below and the handler names it.
//
// fs.writeSync(2, ...) rather than console.error on purpose: stderr is a PIPE
// under Cloud Run, where Node's writes are asynchronous and can be lost if the
// process dies immediately after. A breadcrumb that can vanish is not a
// breadcrumb.
const _fsBoot = require('fs');
const _crumb = (m) => { try { _fsBoot.writeSync(2, '[mForceLibrary] ' + m + '\n'); } catch (_) {} };
_crumb('boot: node ' + process.version + ' pid ' + process.pid + ' NODE_ENV=' + (process.env.NODE_ENV || '(unset)') + ' PORT=' + (process.env.PORT || '(unset)'));
process.on('uncaughtException', (e) => {
    _crumb('FATAL uncaughtException at boot: ' + (e && e.stack ? e.stack : e));
    process.exit(1);
});
process.on('unhandledRejection', (e) => {
    _crumb('FATAL unhandledRejection at boot: ' + (e && e.stack ? e.stack : e));
    process.exit(1);
});

try { require('./errlog-console'); } catch (_) {}   // C4: console.error/warn -> errlog
require('dotenv').config();
const express = require('express');
const db = require('./db');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sessionLogin, requireAuth } = require('./perimeter-guard');

const app = express();
app.use(cookieParser());
// Shared perimeter telemetry. telemetry() is non-blocking by design — it records
// and emits, it never denies. armAuth() (rate limit / lockout / Turnstile) is NOT
// mounted here: it belongs on this service's own auth routes.
const _sec = require('./mforce-security')({ system: 'mForceLibrary' });
app.use(_sec.telemetry());
// FLT-SCOPE-3 — fleet scoping is not optional and its absence must not be silent.
// A missing or throwing fleet-scope.js used to leave req.fleetScope undefined, and
// every scoped query then ran UNSCOPED. Refuse to start instead.
try { app.use(require('./fleet-scope')); }
catch (e) { console.error('[fleet-scope] FATAL: org scoping could not load — refusing to start unscoped:', e.message); process.exit(1); }
app.use(express.json());

app.get('/api/v1/health', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'success', db_time: result.rows[0].now });
    } catch (err) {
        console.error('DB Connection Error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});


const PORT = process.env.PORT || 8080;
// Note: In an Angular app, the built files are in dist/browser or dist/[app-name]
// We will assume 'dist' for simplicity, modify per app if needed
const DIST_DIR = path.join(__dirname, 'dist'); 

// 1. Unauthenticated Perimeter
app.get('/', (req, res) => {
    if (req.cookies.__session) {
        return res.redirect('/app');
    }
    res.sendFile(path.join(__dirname, 'perimeter.html'));
});

// 2. Auth Handshake
app.post('/sessionLogin', sessionLogin);

// 3. Authenticated App Entry
app.get('/app', requireAuth, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// 4. Static Assets & Catch-All
app.use(express.static(DIST_DIR, { index: false }));

app.get('*', requireAuth, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

_crumb('requires complete; calling listen on ' + PORT);
app.listen(PORT, async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, body_text TEXT, author VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database schema initialized for documents.');
    } catch (err) {
        console.error('Failed to initialize database schema:', err);
    }
    console.log(`mForce Perimeter active on port ${PORT}`);
});

app.get('/api/v1/documents', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM documents ORDER BY 1 DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

app.post('/api/v1/documents', requireAuth, async (req, res) => {
    try {
        const { title, body_text, author } = req.body;
        const result = await db.query(
            'INSERT INTO documents (title, body_text, author) VALUES ($1, $2, $3) RETURNING *',
            [title, body_text, author]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create documents' });
    }
});

app.put('/api/v1/documents/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body_text, author } = req.body;
        const result = await db.query(
            'UPDATE documents SET title = COALESCE($1, title), body_text = COALESCE($2, body_text), author = COALESCE($3, author) WHERE id = $4 RETURNING *',
            [title, body_text, author, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update documents' });
    }
});

app.delete('/api/v1/documents/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ status: 'success', deleted: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete documents' });
    }
});
