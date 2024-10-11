import fs from 'fs';

const copyDir = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = `${src}/${entry.name}`;
        const destPath = `${dest}/${entry.name}`;
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

fs.rmSync('./packages/canyon-backend/public', { recursive: true, force: true })

copyDir('./packages/canyon-admin/dist', './packages/canyon-backend/public/admin');

copyDir('./packages/canyon-platform/dist', './packages/canyon-backend/public');
