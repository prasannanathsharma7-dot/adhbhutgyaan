# WhatsApp messages to customers - what to create in Meta, and how to switch it on

The site can send four automatic WhatsApp updates to a customer about THEIR OWN booking (`backend/utils/customer-messages.js`).
They are **off** until you switch them on. WhatsApp only lets a business message a customer first, outside a 24-hour window,
with a **pre-approved template**, so these four must exist in Meta first.

## 1. Create the templates (Meta Business Manager -> WhatsApp Manager -> Message templates)
Category: **Utility**. Create each one in **English (`en`)** and **Hindi (`hi`)** under the *same name*. Variables are numbered
exactly as below; give Meta the example values shown. Approval usually takes minutes to a day.

| Name | When it is sent | English body | Hindi body |
|---|---|---|---|
| `booking_received` | right after a booking enquiry | Namaste {{1}}, we have received your enquiry for {{2}}. Your reference is {{3}}. You can follow it any time at www.adhbhutgyaan.com/track - our team will contact you within 24 hours. - Adhbhut Gyaan | नमस्ते {{1}}, {{2}} के लिए आपकी पूछताछ हमें मिल गई है। आपकी संदर्भ संख्या {{3}} है। आप कभी भी www.adhbhutgyaan.com/track पर स्थिति देख सकते हैं — हमारी टीम 24 घंटे में संपर्क करेगी। - अद्भुत ज्ञान |
| `booking_confirmed` | the team marks the booking *confirmed* | Namaste {{1}}, your {{2}} is confirmed for {{3}}. We will share photo / video proof here after the ritual. - Adhbhut Gyaan | नमस्ते {{1}}, आपका {{2}} {{3}} के लिए पक्का हो गया है। अनुष्ठान के बाद फोटो/वीडियो प्रमाण यहीं भेजा जाएगा। - अद्भुत ज्ञान |
| `pooja_completed` | the team marks it *completed* | Namaste {{1}}, your {{2}} has been performed. Proof will be shared here. If you would like to share feedback: www.adhbhutgyaan.com/leave-a-review - Adhbhut Gyaan | नमस्ते {{1}}, आपका {{2}} सम्पन्न हो गया है। प्रमाण यहीं भेजा जाएगा। अपनी राय देने हेतु: www.adhbhutgyaan.com/leave-a-review - अद्भुत ज्ञान |
| `pooja_reminder` | the morning before the confirmed date | Namaste {{1}}, a reminder that your {{2}} is scheduled for {{3}}. For any change, reply here. - Adhbhut Gyaan | नमस्ते {{1}}, स्मरण: आपका {{2}} {{3}} को निर्धारित है। कोई बदलाव हो तो यहीं उत्तर दें। - अद्भुत ज्ञान |

Example values for Meta's form: {{1}} = Ravi, {{2}} = Rudrabhishek, {{3}} = AG-2026-1A2B3C (for `booking_received`) or 2 Nov 2026 (for the other two).
The first name only is ever sent (never the surname); the language follows the language the customer used on the site.

## 2. Switch it on
1. Meta WhatsApp Cloud API must already be live for the bot (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`).
2. In Cloud Run set `WHATSAPP_TEMPLATES_ENABLED=1` (new revision).
3. Test with your own number: make a test booking -> you should get `booking_received`; mark it *confirmed* in the admin panel -> `booking_confirmed`.
4. If a template is missing / not approved, Meta rejects the send; the log shows `CUSTOMER_MESSAGE_FAILED` with Meta's reason (no phone number or name in the log), and the booking itself is unaffected.

## 3. Good practice
- These are transactional (about a request the customer made). Do **not** add marketing text; marketing needs a separate opt-in and template category.
- To stop messages to one person, set `whatsappOptOut: true` on their booking document (the sender honours it). Reply "STOP" requests should be actioned by hand for now.
- Meta bills business-initiated conversations; utility messages are cheap but not free - check the current price list in WhatsApp Manager.
- The e-mail confirmation and the e-mail reminder are unchanged; WhatsApp is in addition.
