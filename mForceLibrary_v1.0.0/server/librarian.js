const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DOCS_ROOT = path.join(__dirname, '../docs');
const SEARCH_INDEX_PATH = path.join(DOCS_ROOT, 'public/searchIndex.json');

app.use(cors());
app.use(bodyParser.json());

// --- Helper: Read Directory Recursively ---
function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== '.vitepress' && file !== 'public' && file !== 'node_modules') {
                getFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file) === '.md') {
                fileList.push(path.relative(DOCS_ROOT, filePath));
            }
        }
    });
    return fileList;
}

// 1. GET Search Index
app.get('/api/index', (req, res) => {
    if (fs.existsSync(SEARCH_INDEX_PATH)) {
        const data = fs.readFileSync(SEARCH_INDEX_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

// 2. SAVE Search Index
app.post('/api/index', (req, res) => {
    const newIndex = req.body;
    try {
        fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(newIndex, null, 4));
        res.json({ success: true, message: 'Index updated successfully.' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 3. GET List of Pages (The Stacks)
app.get('/api/pages', (req, res) => {
    try {
        const files = getFiles(DOCS_ROOT);
        res.json(files);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 4. GET Page Content
app.post('/api/page/read', (req, res) => {
    const { filepath } = req.body;
    const fullPath = path.join(DOCS_ROOT, filepath);
    
    // Security check to prevent directory traversal
    if (!fullPath.startsWith(DOCS_ROOT)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content });
    } else {
        res.status(404).json({ success: false, message: 'File not found.' });
    }
});

// 5. SAVE Page Content
app.post('/api/page/write', (req, res) => {
    const { filepath, content } = req.body;
    const fullPath = path.join(DOCS_ROOT, filepath);

    if (!fullPath.startsWith(DOCS_ROOT)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    try {
        fs.writeFileSync(fullPath, content);
        res.json({ success: true, message: 'File saved.' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`[LIBRARIAN SERVER] Online at http://localhost:${PORT}`);
    console.log(`[LIBRARIAN SERVER] Managing Stacks at: ${DOCS_ROOT}`);
});
