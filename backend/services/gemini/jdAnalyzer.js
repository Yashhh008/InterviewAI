const { getModel, parseJSON } = require('./geminiClient');

const analyzeJD = async (rawText) => {
  const model = getModel();

  const prompt = `
You are an expert job description analyzer. Analyze the following job description and extract structured information.

Job Description:
"""
${rawText}
"""

Return a JSON object with this exact structure:
{
  "role": "exact job title",
  "company": "company name if mentioned, else empty string",
  "experienceLevel": "one of: Intern, Entry, Mid, Senior, Lead, Unknown",
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "interviewTopics": ["topic1", "topic2", ...]
}

For interviewTopics, identify the key technical areas a candidate must prepare for this role (e.g., "System Design", "SQL", "Machine Learning", "Data Structures").
Be comprehensive with skills - include all programming languages, frameworks, tools, databases mentioned.
Return only valid JSON.
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
    console.error('JD analyzer error:', error);
    throw new Error(`JD analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeJD };
