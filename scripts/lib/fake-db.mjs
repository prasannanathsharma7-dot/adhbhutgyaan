// Small in-memory stand-in for the MongoDB driver (the subset our backend uses), shared by the test suites.
// Supports insertOne / findOne / find().toArray() / updateOne / deleteMany / createIndex, filters with equality,
// $ne $lt $lte $in $or, and updates with $set $inc $unset. A duplicate `messageId` raises code 11000 like a unique index.
export function matches(doc, filter) {
    return Object.entries(filter).every(([k, v]) => {
        if (k === '$or') return v.some(f => matches(doc, f));
        const val = doc[k];
        if (v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v)) {
            return Object.entries(v).every(([op, x]) => {
                if (op === '$ne') return val !== x;
                if (op === '$gte') return val !== undefined && val >= x;
                if (op === '$gt') return val !== undefined && val > x;
                if (op === '$lt') return val !== undefined && val < x;
                if (op === '$lte') return val !== undefined && val <= x;
                if (op === '$in') return x.includes(val);
                throw new Error('unsupported operator ' + op);
            });
        }
        return val === v;
    });
}
export function makeCol() {
    const docs = []; let seq = 0;
    return {
        docs,
        async insertOne(d) {
            if (d.messageId !== undefined && docs.some(x => x.messageId === d.messageId)) { const e = new Error('E11000 duplicate key'); e.code = 11000; throw e; }
            const doc = { _id: d._id ?? `id${++seq}`, ...d }; docs.push(doc); return { insertedId: doc._id };
        },
        async findOne(f) { return docs.find(d => matches(d, f)) || null; },
        find(f = {}) {
            let rows = docs.filter(d => matches(d, f));
            const chain = {
                sort(spec) { const [k, dir] = Object.entries(spec)[0]; rows = [...rows].sort((a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * dir); return chain; },
                limit(n) { rows = rows.slice(0, n); return chain; },
                toArray: async () => rows,
            };
            return chain;
        },
        async countDocuments(f = {}) { return docs.filter(d => matches(d, f)).length; },
        async updateOne(f, u) {
            const d = docs.find(x => matches(x, f)); if (!d) return { matchedCount: 0, modifiedCount: 0 };
            for (const [k, v] of Object.entries(u.$set || {})) d[k] = v;
            for (const [k, v] of Object.entries(u.$inc || {})) d[k] = (d[k] || 0) + v;
            for (const k of Object.keys(u.$unset || {})) delete d[k];
            return { matchedCount: 1, modifiedCount: 1 };
        },
        async deleteMany(f) { let n = 0; for (let i = docs.length - 1; i >= 0; i--) if (matches(docs[i], f)) { docs.splice(i, 1); n++; } return { deletedCount: n }; },
        async createIndex() {},
    };
}
export const makeDb = () => { const m = new Map(); return { collection: n => { if (!m.has(n)) m.set(n, makeCol()); return m.get(n); } }; };
