const { getModel, parseJSON } = require('./geminiClient');

const evaluateAnswer = async ({ question, userAnswer, category, difficulty }) => {
  const model = getModel();

  if (!userAnswer || userAnswer.trim().length < 5) {
    return {
      score: 0,
      accuracy: 0,
      communication: 0,
      completeness: 0,
      relevance: 0,
      strengths: [],
      weaknesses: ['No answer provided'],
      improvedAnswer: 'Please provide an answer to receive feedback.',
      keyConceptsMissed: [],
    };
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}

Candidate's Answer:
"""
${userAnswer}
"""

Evaluate the answer on these dimensions (0-10 scale) and provide detailed feedback.

Return a JSON object with this exact structure:
{
  "score": <overall score 0-10>,
  "accuracy": <technical accuracy 0-10>,
  "communication": <clarity and communication 0-10>,
  "completeness": <how complete is the answer 0-10>,
  "relevance": <how relevant to the question 0-10>,
  "strengths": ["what the candidate did well", ...],
  "weaknesses": ["what was missing or incorrect", ...],
  "improvedAnswer": "A comprehensive model answer covering all key points",
  "keyConceptsMissed": ["concept1", "concept2", ...]
}

Be constructive but honest. A score of 8+ means excellent answer. 5-7 is decent. Below 5 needs significant improvement.
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
    console.error('Answer evaluator error:', error);
    throw new Error(`Answer evaluation failed: ${error.message}`);
  }
};

module.exports = { evaluateAnswer };
