const { getModel, parseJSON } = require('./geminiClient');

const generateReport = async ({ interview, questions }) => {
  const model = getModel();

  const answeredQuestions = questions.filter(q => !q.skipped && q.userAnswer);
  const avgScore = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum, q) => sum + (q.aiFeedback?.score || 0), 0) / answeredQuestions.length
    : 0;

  const technicalQs = answeredQuestions.filter(q =>
    ['technical', 'dsa', 'sql', 'dbms', 'oop', 'os', 'cn', 'system_design'].includes(q.category)
  );
  const hrQs = answeredQuestions.filter(q => ['hr', 'behavioral'].includes(q.category));

  const prompt = `
You are an expert interview coach generating a comprehensive post-interview report.

Interview Details:
- Role: ${interview.role}
- Company: ${interview.company}
- Mode: ${interview.mode}
- Total Questions: ${interview.totalQuestions}
- Answered: ${interview.answeredQuestions}
- Skipped: ${interview.skippedQuestions}
- Average Score: ${avgScore.toFixed(1)}/10

Question Performance Summary:
${answeredQuestions.map((q, i) =>
  `Q${i+1} [${q.category}/${q.difficulty}]: Score ${q.aiFeedback?.score || 0}/10 - "${q.question.substring(0, 100)}"`
).join('\n')}

Generate a comprehensive interview report. Return a JSON object with this exact structure:
{
  "overallScore": <number 0-10>,
  "technicalScore": <number 0-10>,
  "communicationScore": <number 0-10>,
  "hrScore": <number 0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weakAreas": ["weak area 1", "weak area 2"],
  "improvementPlan": "Detailed paragraph with specific improvement advice",
  "studyPlan": [
    { "day": "Monday", "topic": "SQL Optimization", "resources": ["LeetCode SQL", "W3Schools"] },
    { "day": "Tuesday", "topic": "System Design", "resources": ["System Design Primer", "Grokking the System Design Interview"] },
    { "day": "Wednesday", "topic": "DBMS Concepts", "resources": ["GeeksforGeeks DBMS", "NPTEL lectures"] },
    { "day": "Thursday", "topic": "Operating Systems", "resources": ["OS by Galvin", "Gate Smashers OS"] },
    { "day": "Friday", "topic": "Data Structures", "resources": ["LeetCode", "Striver's DSA sheet"] },
    { "day": "Saturday", "topic": "Mock Interview Practice", "resources": ["Pramp", "InterviewBit"] },
    { "day": "Sunday", "topic": "Review & Rest", "resources": [] }
  ]
}

Be specific and actionable in improvement suggestions. Return only valid JSON.
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
    console.error('Report generator error:', error);
    throw new Error(`Report generation failed: ${error.message}`);
  }
};

module.exports = { generateReport };
