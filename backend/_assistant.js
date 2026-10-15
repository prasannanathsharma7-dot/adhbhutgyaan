// Shared "brain" for the AI assistant - used by both api/chat.js (website
// widget) and api/whatsapp-webhook.js (WhatsApp bot), so the business
// knowledge and booking logic only exist in one place.

const { capStr, escapeHtml } = require('./_db');
const { notifyAdmin } = require('./_notify');
const { createBookingEnquiry } = require('./utils/booking-service');
const servicesData = require('../src/data/services.json');
const priceData = require('../src/data/priceList.json');

// Published website rates, as text for the AI prompt. Only items the owner approved
// carry numbers in priceList.json, so nothing unreviewed can ever be quoted.
function formatRupees(n) {
    const half = Math.abs(n - Math.round(n)) > 1e-9;
    return '\u20B9' + n.toLocaleString('en-IN', { minimumFractionDigits: half ? 1 : 0, maximumFractionDigits: 1 });
}
const UNIT_EN = { paath: 'per paath', ritual: 'per ritual', day: 'per day', per1000: 'per 1,000 jaap', unclear: '' };
// Names (only) of every listed ritual that is NOT priced above, so the assistant can truthfully say
// "yes, we arrange that" without inventing a price or details. Source: src/data/priceList.json.
function buildOtherRitualLines() {
    return priceData.items.filter(it => it.status !== 'approved').map(it => `- ${it.nameEn} (${it.nameHi})`).join('\n');
}
function buildPriceLines() {
    const lines = [`- Astrology Consultation (personal session): ${formatRupees(priceData.consultation.price)} per session (final price)`];
    for (const it of priceData.items) {
        if (it.status !== 'approved') continue;
        const amount = it.min === it.max ? formatRupees(it.min) : `${formatRupees(it.min)} to ${formatRupees(it.max)}`;
        lines.push(`- ${it.nameEn} (${it.nameHi}): ${amount} ${UNIT_EN[it.unit] || ''}`.trim());
    }
    return lines.join('\n');
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildSystemPrompt(pageContext) {
    const serviceLines = servicesData.map(s => {
        const pkgs = s.packages.map(p => `${p.nameEn} (${p.paathCount})`).join('; ');
        return `- ${s.nameEn} [id: ${s.id}]: ${s.descriptionEn} Best time: ${s.bestTimeEn}. Packages: ${pkgs}.`;
    }).join('\n');

    const contextLine = pageContext
        ? `\nThe visitor is currently looking at the page for "${pageContext}" - if their first message is vague (e.g. just "hi" or a general question), assume they're likely interested in this service and offer to tell them more about it, but still let them redirect the conversation freely if they ask about something else.\n`
        : '';

    return `You are the helpful assistant for Adhbhut Gyaan, a Vedic pooja and astrology consultation service run by Pt./Dr. Umang Nath Sharma and family in Kashi (Varanasi), India, continuing a 400+ year family tradition.

Your role is limited to: answering general questions about services/timing/process, and helping book appointments. Pricing: you may quote only the published website rates listed below; Pandit ji personally confirms the final price for each devotee's exact requirement.

Business facts (use only these - never invent prices, dates, or details not given here):
- Phone/WhatsApp: +91 92781 48269
- Address: J11/19, Nati Imli Rd, Ishwargangi, Varanasi, UP 221001
- Hours: 7 AM - 9 PM, every day
- Poojas can be performed online (live video) or offline (in Varanasi, at the devotee's location, at any temple, or in person)
- Astrology consultation with Dr. Umang Nath Sharma: in person at the Varanasi location 9 AM-12 PM, or online by appointment

Available poojas/services:
${serviceLines}

Published price list (final website rates, INR):
${buildPriceLines()}

Other rituals we arrange - rate confirmed by Pandit ji on WhatsApp, never guess a price for these:
${buildOtherRitualLines()}
${contextLine}
Your job:
1. Answer questions about services, what they're for, best timing, and what packages/options exist - using ONLY the facts above.
2. Prices: quote ONLY the rates under "Published price list" below, exactly as written, and say they are per the unit shown and that Pandit ji confirms the final price for the person's exact requirement (number of Pandits, materials, location, online/offline) on WhatsApp before booking. You may multiply a per-paath or per-1,000-jaap rate by a count the person gives you - show the arithmetic and call it an estimate until Pandit ji confirms. For any service that is not in the published list, or any total you cannot derive from it, do NOT guess: say Pandit ji will share the price and offer the WhatsApp number.
3. If the person wants to book, collect: their name, a phone number, which service/pooja, which package (if relevant), and preferred mode (online/offline/at their location/at a temple) and preferred date. Ask for whatever is still missing, one or two questions at a time - don't interrogate them all at once.
4. Once you have at least name + phone + service, call the create_booking tool. You do not need every field - a preferred date of "flexible" or a mode of "to be discussed" is fine if the person doesn't specify.
5. After booking is created, tell them the team will confirm within 24 hours on WhatsApp/call, and mention they can also reach +91 92781 48269 directly for anything urgent.
6. Keep replies short and warm (2-4 sentences) - this matters even more on WhatsApp, where long messages are awkward to read.
7. Reply in the same language the person writes in (Hindi, Hinglish, or English).
8. For anything you're unsure about or that isn't in the facts above (pricing not in the published list, availability on a specific date, custom requests), say the team will confirm this directly and offer the WhatsApp number - never guess.`;
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

async function callAnthropic(messages, apiKey, pageContext) {
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
            system: buildSystemPrompt(pageContext),
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

// `source` distinguishes where the booking came from ('chatbot' = website widget, 'whatsapp' = the WhatsApp bot).
// Creation goes through the SAME service as the booking form (utils/booking-service.js): same validation, reference
// number, duplicate protection and notifications. A validation error is returned to the model as the tool result,
// so it asks the visitor to correct the detail instead of silently storing junk.
async function createBookingFromTool(db, input, source) {
    const r = await createBookingEnquiry(db, input, { source });
    if (!r.ok) {
        return { ok: false, error: `${r.error}. Ask the visitor to re-check that detail (a phone number is 10 digits for India, or starts with + and the country code).` };
    }
    return { ok: true, id: r.id, reference: r.reference, duplicate: r.duplicate };
}

// Runs one full turn: sends `messages` to Claude, and if it wants to call
// create_booking, executes that and asks Claude to continue with the result -
// so the caller always gets back plain final reply text.
async function runAssistantTurn(db, messages, apiKey, source, pageContext) {
    let response = await callAnthropic(messages, apiKey, pageContext);
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
        response = await callAnthropic(followupMessages, apiKey, pageContext);
    }

    const replyText = (response.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n')
        .trim() || 'Sorry, I had trouble responding - please WhatsApp us at +91 92781 48269.';

    return { replyText, bookingCreated: Boolean(bookingCreated) };
}

module.exports = { buildSystemPrompt, CREATE_BOOKING_TOOL, callAnthropic, createBookingFromTool, runAssistantTurn };
