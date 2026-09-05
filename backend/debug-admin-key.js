// TEMPORARY DIAGNOSTIC ENDPOINT - delete this file once the admin-login
// issue is resolved. It never reveals the actual ADMIN_KEY value (or the
// value you provide) - only lengths and the first/last character of
// each, which is enough to spot a mismatch (extra whitespace, wrong
// case, a leftover old value, etc.) without exposing the secret itself.
const { withCors } = require('./_db');

function safeSample(str) {
    if (!str) return { length: 0, first: null, last: null };
    return {
        length: str.length,
        first: JSON.stringify(str[0]),
        last: JSON.stringify(str[str.length - 1]),
    };
}

module.exports = async (req, res) => {
    withCors(req, res);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const envKeyRaw = process.env.ADMIN_KEY || '';
    const providedRaw = (req.query.key || '').toString();

    res.status(200).json({
        ok: true,
        note: 'TEMPORARY diagnostic - delete backend/debug-admin-key.js once resolved. No secret values are exposed, only lengths/edge-characters.',
        env_admin_key: {
            is_set: Boolean(process.env.ADMIN_KEY),
            raw: safeSample(envKeyRaw),
            trimmed: safeSample(envKeyRaw.trim()),
        },
        provided_key: {
            was_given: Boolean(req.query.key),
            raw: safeSample(providedRaw),
            trimmed: safeSample(providedRaw.trim()),
        },
        would_match_raw: providedRaw === envKeyRaw,
        would_match_trimmed: providedRaw.trim() === envKeyRaw.trim(),
    });
};
