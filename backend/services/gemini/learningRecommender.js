const { getModel, parseJSON } = require('./geminiClient');

const generateLearningPlan = async ({ weakAreas, missingSkills, role }) => {
  const model = getModel();

  const prompt = `
You are an expert learning coach. Generate a personalized weekly study plan for a candidate preparing for ${role} interviews.

Weak Areas from Interview: ${JSON.stringify(weakAreas)}
Missing Skills: ${JSON.stringify(missingSkills)}

Create a 7-day detailed study plan. Return a JSON array:
[
  {
    "day": "Monday",
    "topic": "SQL & Database Optimization",
    "focus": "Indexing, query optimization, joins",
    "tasks": ["Solve 5 LeetCode SQL problems", "Read about B-Tree indexes", "Practice window functions"],
    "resources": ["LeetCode SQL 50", "Use The Index Luke"],
    "estimatedHours": 3
  },
  ...7 days total
]

Make the plan progressive (easy to hard), realistic, and specific to the identified gaps.
Return only valid JSON array.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);

    if (!parsed || !Array.isArray(parsed)) {
      throw new Error('Failed to parse AI response');
    }

    return parsed;
  } catch (error) {
    console.error('Learning recommender error:', error);
    throw new Error(`Learning plan generation failed: ${error.message}`);
  }
};

module.exports = { generateLearningPlan };
