import { ai } from '../config/gemini.config';

export class AIService {
  static async scanPrescription(imageBuffer: Buffer, mimeType: string) {
    const base64Data = imageBuffer.toString('base64');

    const prompt = `
You are an expert medical AI assistant.
Extract the medication details from the attached prescription image.
Return the result strictly as a JSON object matching this schema:
{
  "extracted": [
    {
      "name": "string (name of the medicine)",
      "dosage": "string (e.g., 1 viên, 500mg)",
      "frequency": "string (e.g., 3 lần/ngày)",
      "bin": "string (a 4-bit binary string where each bit represents morning, noon, afternoon, evening. e.g., '1010' for morning and afternoon. If it cannot be determined, return null)",
      "days": "number (number of days to take this medication. If not explicitly written, calculate it by dividing the total prescribed amount by the total amount taken per day. If it cannot be determined, return null)"
    }
  ],
  "confidence": number, // between 0 and 1, your confidence level of the recognition
  "isPrescription": boolean // true if the image is a valid prescription and you could extract, false otherwise
}
Return only the raw JSON. Do not use Markdown backticks.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('Error calling Gemini for OCR:', error);
      throw new Error('Failed to process prescription image');
    }
  }

  static async generateReminder(age: number, name: string): Promise<string> {
    let toneInstruction = '';
    if (age >= 60) {
      toneInstruction = 'Lễ phép, ân cần, từ tốn';
    } else if (age >= 18) {
      toneInstruction = 'Thân thiện, ngắn gọn';
    } else {
      toneInstruction = 'Vui tươi, khích lệ';
    }

    const prompt = `
Bạn là trợ lý nhắc nhở uống thuốc. Đối tượng người dùng: độ tuổi ${age}, tên là ${name}.
Hãy viết MỘT câu nhắc nhở uống thuốc bằng tiếng Việt, dựa trên giọng điệu mục tiêu là: ${toneInstruction}.
Trả về duy nhất nội dung câu nhắc, không cần giải thích hay thêm bớt.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt
      });

      return response.text?.trim() || `Đã đến giờ uống thuốc rồi!`;
    } catch (error) {
      console.error('Error generating reminder via Gemini:', error);
      return 'Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!';
    }
  }
}
