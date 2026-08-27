// Shared "brain" for the AI assistant - used by both api/chat.js (website
// widget) and api/whatsapp-webhook.js (WhatsApp bot), so the business
// knowledge and booking logic only exist in one place.

const { capStr, escapeHtml } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');
const servicesData = require('../src/data/services.json');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildSystemPrompt() {
    const serviceLines = servicesData.map(s => {
        const pkgs = s.packages.map(p => `${p.nameEn} (${p.paathCount})`).join('; ');
        return `- ${s.nameEn} [id: ${s.id}]: ${s.descriptionEn} Best time: ${s.bestTimeEn}. Packages: ${pkgs}.`;
    }).join('\n');

    return `You are the helpful assistant for Adhbhut Gyaan, a Vedic pooja and astrology consultation service run by Pt./Dr. Umang Nath Sharma and family in Kashi (Varanasi), India, continuing a 400+ year family tradition.

Your role is limited to: answering general questions about services/timing/process, and helping book appointments. You are NOT the source for pricing - Pandit ji personally confirms exact prices with each devotee.

Business facts (use only these - never invent prices, dates, or details not given here):
- Phone/WhatsApp: +91 92781 48269
- Address: J11/19, Nati Imli Rd, Ishwargangi, Varanasi, UP 221001
- Hours: 7 AM - 9 PM, every day
- Poojas can be performed online (live video) or offline (in Varanasi, at the devotee's location, at any temple, or in person)
- Astrology consultation with Dr. Umang Nath Sharma: in person at the Varanasi location 9 AM-12 PM, or online by appointment

Available poojas/services:
${serviceLines}

Your job:
1. Answer questions about services, what they're for, best timing, and what packages/options exist - using ONLY the facts above.
2. Do not state exact rupee prices (not provided here) - pricing is confirmed personally by Pandit ji on WhatsApp or call, so tell the person Pandit ji will share the exact price once they connect. Offer to help book an appointment or connect them on WhatsApp for that.
3. If the person wants to book, collect: their name, a phone number, which service/pooja, which package (if relevant), and preferred mode (online/offline/at their location/at a temple) and preferred date. Ask for whatever is still missing, one or two questions at a time - don't interrogate them all at once.
4. Once you have at least name + phone + service, call the create_booking tool. You do not need every field - a preferred date of "flexible" or a mode of "to be discussed" is fine if the person doesn't specify.
5. After booking is created, tell them the team will confirm within 24 hours on WhatsApp/call, and mention they can also reach +91 92781 48269 directly for anything urgent.
6. Keep replies short and warm (2-4 sentences) - this matters even more on WhatsApp, where long messages are awkward to read.
7. Reply in the same language the person writes in (Hindi, Hinglish, or English).
8. For anything you're unsure about or that isn't in the facts above (exact pricing, availability on a specific date, custom requests), say the team will confirm this directly and offer the WhatsApp number - never guess.`;
}

const CREATE_BOOKING_TOOL = {
    name: 'create_booking',
    description: 'Create a pooja booking enquiry once you have the visitor\'s name, phone number, and which service they want. Other fields are optional.',
    input_schema: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Visitor\'s full name' },
            phone: { type: 'string', description: 'Visitor\'s phone number' },
            email: { type: 'string', description: 'Visitor\'s email, if given' },
            serviceId: { type: 'string', description: 'The [id] of the matching service from the list, if identifiable' },
            serviceName: { type: 'string', description: 'Name of the pooja/service in English' },
            packageName: { type: 'string', description: 'Which package/option, if specified' },
            mode: { type: 'string', description: 'online / offline / at their location / at a temple / to be discussed' },
            preferredDate: { type: 'string', description: 'Preferred date, or "flexible" if not specified' },
            notes: { type: 'string', description: 'Any other relevant details the visitor mentioned' },
        },
        required: ['name', 'phone'],
    },
};

async function callAnthropic(messages, apiKey) {
    const res = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 1024,
            system: buildSystemPrompt(),
            tools: [CREATE_BOOKING_TOOL],
            messages,
        }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 300)}`);
    }
    return res.json();
}

// `source` distinguishes where the booking came from ('chatbot' = website
// widget, 'whatsapp' = the WhatsApp bot) so the admin panel/emails can tell
// them apart.
async function createBookingFromTool(db, input, source) {
    const doc = {
        name: capStr(input.name, 100),
        phone: capStr(input.phone, 30),
        email: capStr(input.email, 200),
        serviceId: capStr(input.serviceId, 100),
        serviceName: capStr(input.serviceName, 200),
        packageName: capStr(input.packageName, 200),
        mode: capStr(input.mode, 50),
        preferredDate: capStr(input.preferredDate, 50),
        address: '',
        notes: capStr(input.notes, 2000),
        language: '',
        status: 'new',
        source,
        createdAt: new Date(),
    };
    if (!doc.name || !doc.phone) {
        return { ok: false, error: 'name and phone are required' };
    }
    const result = await db.collection('bookings').insertOne(doc);

    const sourceLabel = source === 'whatsapp' ? 'WhatsApp Bot' : 'Website Chatbot';
    const sourceEmoji = source === 'whatsapp' ? '💬' : '🤖';

    notifyAdmin({
        emailSubject: `${sourceEmoji} New ${sourceLabel} Booking - ${doc.name}`,
        emailHtml: `
            <h2>New Booking via ${sourceLabel}</h2>
            <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
            <p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>
            ${doc.email ? `<p><b>Email:</b> ${escapeHtml(doc.email)}</p>` : ''}
            <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'}</p>
            <p><b>Package:</b> ${escapeHtml(doc.packageName) || '-'}</p>
            <p><b>Mode:</b> ${escapeHtml(doc.mode) || '-'}</p>
            <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided'}</p>
            ${doc.notes ? `<p><b>Notes:</b> ${escapeHtml(doc.notes)}</p>` : ''}
            <p style="color:#888;font-size:12px;">Booking ID: ${result.insertedId} (via ${source})</p>
        `,
        whatsappText: `${sourceEmoji} New ${sourceLabel} Booking\n\nName: ${doc.name}\nPhone: ${doc.phone}\nService: ${doc.serviceName || '-'}\nMode: ${doc.mode || '-'}\nDate: ${doc.preferredDate || 'To be decided'}`,
    });

    if (doc.email) {
        sendMail({
            to: doc.email,
            subject: 'We received your booking enquiry - Adhbhut Gyaan',
            html: `
                <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
                <p>We have received your booking enquiry for <b>${escapeHtml(doc.serviceName) || 'a pooja'}</b>.</p>
                <p>Our team will contact you on WhatsApp or phone at <b>${escapeHtml(doc.phone)}</b> within 24 hours to confirm the date, pricing, and further details.</p>
                <p>If you need to reach us urgently, WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
                <br/>
                <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
            `,
        });
    }

    return { ok: true, id: result.insertedId.toString() };
}

// Runs one full turn: sends `messages` to Claude, and if it wants to call
// create_booking, executes that and asks Claude to continue with the result -
// so the caller always gets back plain final reply text.
async function runAssistantTurn(db, messages, apiKey, source) {
    let response = await callAnthropic(messages, apiKey);
    let bookingCreated = null;

    if (response.stop_reason === 'tool_use') {
        const toolUseBlock = response.content.find(b => b.type === 'tool_use');
        const assistantContent = response.content;
        let toolResultContent;

        if (toolUseBlock && toolUseBlock.name === 'create_booking') {
            const result = await createBookingFromTool(db, toolUseBlock.input || {}, source);
            bookingCreated = result.ok ? result : null;
            toolResultContent = JSON.stringify(result);
        } else {
            toolResultContent = JSON.stringify({ ok: false, error: 'Unknown tool' });
        }

        const followupMessages = [
            ...messages,
            { role: 'assistant', content: assistantContent },
            {
                role: 'user',
                content: [{ type: 'tool_result', tool_use_id: toolUseBlock.id, content: toolResultContent }],
            },
        ];
        response = await callAnthropic(followupMessages, apiKey);
    }

    const replyText = (response.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n')
        .trim() || 'Sorry, I had trouble responding - please WhatsApp us at +91 92781 48269.';

    return { replyText, bookingCreated: Boolean(bookingCreated) };
}

module.exports = { buildSystemPrompt, CREATE_BOOKING_TOOL, callAnthropic, createBookingFromTool, runAssistantTurn };
