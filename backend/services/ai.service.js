const axios = require('axios');
const { log } = require('../configs/logger');

const MODEL = 'gemini-3-flash-preview';

const PROMPT = `วิเคราะห์บิล/ใบเสร็จในภาพ แล้วคืนค่าเฉพาะ JSON เท่านั้น ห้ามมีข้อความอื่นนอกจาก JSON:
{
  "name": "ชื่อรายการหรือสินค้าหลัก (string)",
  "base_amount": ยอดเงินก่อน VAT (number, ถ้าไม่มี VAT ให้ใส่ยอดรวม),
  "includes_vat": true หรือ false,
  "vat_amount": ยอด VAT (number, 0 ถ้าไม่มี),
  "total_amount": ยอดรวมสุทธิ (number)
}
ถ้าอ่านค่าไม่ได้ให้ใส่ null`;

async function callGemini(model, base64Image, mimeType) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await axios.post(url, {
        contents: [{
            parts: [
                { inline_data: { mime_type: mimeType, data: base64Image } },
                { text: PROMPT },
            ],
        }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
        },
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
    });
    console.log('[AI] response:', JSON.stringify(res.data.candidates, null, 2));
    return res.data.candidates[0].content.parts[0].text;
}

function extractJson(text) {
    // Strip markdown code fences
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find first { ... } block
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('ไม่พบ JSON ในคำตอบ');
    return JSON.parse(clean.slice(start, end + 1));
}

async function analyzeBill(base64Image, mimeType = 'image/jpeg') {
    const rawText = await callGemini(MODEL, base64Image, mimeType);
    console.log('[AI] raw response:', rawText);
    return extractJson(rawText);
}

module.exports = { analyzeBill };
