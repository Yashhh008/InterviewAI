const { getModel, parseJSON } = require('./geminiClient');

const analyzeResume = async (rawText) => {
  const model = getModel();

  const prompt = `
You are an expert ATS resume parser. Analyze the following resume text and extract structured information.

Resume Text:
"""
${rawText}
"""

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence professional summary",
  "extractedSkills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "college/university name",
      "year": "graduation year",
      "field": "field of study"
    }
  ],
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "duration (e.g., Jan 2023 - Dec 2023)",
      "description": "key responsibilities"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "missingInfo": ["contact info missing", "github link missing", etc.],
  "improvementSuggestions": ["suggestion1", "suggestion2", ...]
}

Be thorough and extract all skills including programming languages, frameworks, databases, tools, and soft skills. Return only valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);

    if (!parsed) {
      throw new Error('Failed to parse AI response');
    }

    return parsed;
  } catch (error) {
    console.error('Resume analyzer error:', error);
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeResume };
