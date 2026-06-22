const { getModel, parseJSON } = require('./geminiClient');

const researchCompany = async (companyName) => {
  const model = getModel();

  const prompt = `
You are a company research expert helping job candidates prepare for interviews.
Research the company "${companyName}" and provide comprehensive interview preparation information.

Return a JSON object with this exact structure:
{
  "name": "${companyName}",
  "overview": "2-3 sentence company overview",
  "businessModel": "How the company makes money",
  "products": ["main product 1", "main product 2", ...],
  "techStack": ["technology1", "technology2", ...],
  "interviewPattern": "Description of their typical interview process (rounds, format, etc.)",
  "frequentTopics": ["topic frequently asked in interviews", ...],
  "importantConcepts": ["concept to study", ...],
  "hrQuestions": ["common HR question at this company", ...],
  "difficulty": "Easy|Medium|Hard|Very Hard"
}

Focus on accurate, actionable information that will help a candidate prepare for interviews at ${companyName}.
Include company-specific technical topics and what they value in candidates.
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
    console.error('Company researcher error:', error);
    throw new Error(`Company research failed: ${error.message}`);
  }
};

module.exports = { researchCompany };
