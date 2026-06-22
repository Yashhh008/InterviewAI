const { getModel, parseJSON } = require('./geminiClient');

const generateQuestions = async ({ resumeData, jdData, company, role, mode, count = 10 }) => {
  const model = getModel();

  const categoryDistribution = mode === 'practice'
    ? { technical: 4, behavioral: 2, hr: 2, sql: 1, oop: 1 }
    : { technical: 3, dsa: 2, sql: 2, behavioral: 1, hr: 1, system_design: 1 };

  const prompt = `
You are an expert technical interviewer. Generate personalized interview questions based on the candidate's profile.

Candidate Profile:
- Skills: ${JSON.stringify(resumeData?.extractedSkills || [])}
- Projects: ${JSON.stringify(resumeData?.projects?.map(p => ({ name: p.name, tech: p.technologies })) || [])}
- Education: ${JSON.stringify(resumeData?.education || [])}

Target Role: ${role || jdData?.role || 'Software Engineer'}
Target Company: ${company || jdData?.company || 'General'}
Required Skills from JD: ${JSON.stringify(jdData?.requiredSkills || [])}
Interview Mode: ${mode}

Generate exactly ${count} interview questions. Mix these categories:
${JSON.stringify(categoryDistribution)}

Return a JSON array with this exact structure:
[
  {
    "category": "technical|dsa|sql|dbms|oop|os|cn|system_design|hr|behavioral",
    "question": "The full interview question",
    "difficulty": "Easy|Medium|Hard",
    "hint": "Key concepts to cover in the answer"
  }
]

Rules:
1. Make questions specific to the candidate's projects when relevant
   - Example: If they built "RSS Feed Ingestor", ask "How did you handle duplicate announcements in your RSS Feed Ingestor?"
2. Make HR/behavioral questions company-specific if company is known
3. Vary difficulty: 30% Easy, 50% Medium, 20% Hard
4. Questions should be realistic and commonly asked in actual interviews
5. Return only valid JSON array.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);

    if (!parsed || !Array.isArray(parsed)) {
      throw new Error('Failed to parse AI response as array');
    }

    return parsed;
  } catch (error) {
    console.error('Question generator error:', error);
    throw new Error(`Question generation failed: ${error.message}`);
  }
};

module.exports = { generateQuestions };
