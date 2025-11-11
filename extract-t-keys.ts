import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// Cấu hình
const SRC_DIR = './src';
const OUTPUT_FILE = './src/i18n/locales/en.json';

async function extractTKeys() {
    const files = await glob(`${SRC_DIR}/**/*.tsx`, {
        ignore: ['node_modules/**', '**/*.d.ts'],
    });

    const keys = new Set<string>();

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        let ast;
        try {
            ast = parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'decorators-legacy'],
            });
        } catch (err) {
            console.warn(`⚠️ Không parse được file: ${file}`);
            continue;
        }

        traverse(ast, {
            CallExpression(path) {
                const callee = path.get('callee');

                // Chỉ chấp nhận đúng Identifier tên 't'
                if (
                    callee.isIdentifier() &&
                    callee.node.name === 't' &&
                    path.node.arguments.length > 0
                ) {
                    const firstArg = path.node.arguments[0];

                    // Chỉ lấy StringLiteral (chuỗi cứng)
                    if (firstArg.type === 'StringLiteral') {
                        const key = firstArg.value.trim();
                        if (key) {
                            keys.add(key);
                        }
                    }
                    // (Tùy chọn) Hỗ trợ TemplateLiteral đơn giản: `t(`hello`)
                    else if (firstArg.type === 'TemplateLiteral' && firstArg.quasis.length === 1) {
                        const key = firstArg.quasis[0].value.raw.trim();
                        if (key) {
                            keys.add(key);
                        }
                    }
                }
            },
        });
    }

    // Xuất JSON: { "key": "key" }
    const jsonOutput = Object.fromEntries(
        Array.from(keys).sort().map((key) => [key, key])
    );

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonOutput, null, 2), 'utf-8');

    console.log(`✅ Đã trích xuất ${keys.size} key từ hàm t(...) → ${OUTPUT_FILE}`);
}

extractTKeys().catch((err) => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
});