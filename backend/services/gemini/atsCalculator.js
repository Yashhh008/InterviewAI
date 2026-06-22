const { getModel, parseJSON } = require('./geminiClient');

const calculateATS = async (resumeData, jdData) => {
  const model = getModel();

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Compare this resume against a job description and generate a detailed ATS report.

Resume Skills: ${JSON.stringify(resumeData.extractedSkills)}
Resume Projects: ${JSON.stringify(resumeData.projects?.map(p => p.name + ': ' + p.technologies?.join(', ')))}
Resume Summary: ${resumeData.summary}

Job Required Skills: ${JSON.stringify(jdData.requiredSkills)}
Job Preferred Skills: ${JSON.stringify(jdData.preferredSkills)}
Job Role: ${jdData.role}
Job Level: ${jdData.experienceLevel}

Return a JSON object with this exact structure:
{
  "atsScore": <number 0-100>,
  "matchingSkills": ["matched skill1", "matched skill2", ...],
  "missingSkills": ["missing skill1", "missing skill2", ...],
  "recommendations": [
    "Add AWS project to demonstrate cloud experience",
    "Include SQL optimization examples",
    ...
  ],
  "keywordAnalysis": {
    "totalKeywords": <number>,
    "matchedKeywords": <number>,
    "matchPercentage": <number 0-100>
  }
}

ATS Score calculation:
- 80-100: Excellent match
- 60-79: Good match, minor gaps
- 40-59: Moderate match, significant gaps
- 0-39: Poor match

Be realistic and strict. Return only valid JSON.
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
    console.error('ATS calculator error:', error);
    throw new Error(`ATS calculation failed: ${error.message}`);
  }
};

module.exports = { calculateATS };
