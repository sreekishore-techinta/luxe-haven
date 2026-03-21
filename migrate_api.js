const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            if (content.includes('http://localhost/luxe-haven/api')) {
                // If it already has the import, just replace the assignment
                if (content.includes('from "@/api_config"')) {
                    content = content.replace(/const API = "http:\/\/localhost\/luxe-haven\/api";/g, '');
                } else {
                    content = content.replace(/const API = "http:\/\/localhost\/luxe-haven\/api";/g, 'import { API_URL as API } from "@/api_config";');
                }
                changed = true;
            }

            if (content.includes('http://localhost/luxe-haven') && !content.includes('/api')) {
                 if (content.includes('from "@/api_config"')) {
                    content = content.replace(/const BASE_URL = "http:\/\/localhost\/luxe-haven";/g, '');
                    content = content.replace(/const API = "http:\/\/localhost\/luxe-haven";/g, '');
                } else {
                    content = content.replace(/const (?:BASE_URL|API) = "http:\/\/localhost\/luxe-haven";/g, 'import { BASE_URL } from "@/api_config";');
                }
                changed = true;
            }

            // Cleanup potential duplicate imports
            if (content.match(/import { (?:API_URL as API|BASE_URL) } from "@\/api_config";\s+import { (?:API_URL as API|BASE_URL) } from "@\/api_config";/)) {
                 content = content.replace(/import { API_URL as API } from "@\/api_config";\s+import { BASE_URL } from "@\/api_config";/, 'import { BASE_URL, API_URL as API } from "@/api_config";');
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

walk(srcDir);
