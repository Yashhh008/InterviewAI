const { getModel, parseJSON } = require('./geminiClient');

const analyzeSkillGap = async ({ resumeSkills, requiredSkills, missingSkills, role }) => {
  const model = getModel();

  const prompt = `
You are a career coach and skill gap analyzer. Analyze the skill gap for a candidate targeting a ${role} role.

Candidate's Current Skills: ${JSON.stringify(resumeSkills)}
Required Skills for Role: ${JSON.stringify(requiredSkills)}
Missing/Gap Skills: ${JSON.stringify(missingSkills)}

Generate a detailed skill gap analysis and 4-week learning roadmap.

Return a JSON object with this exact structure:
{
  "missingSkills": ["skill1", "skill2", ...],
  "roadmap": [
    {
      "week": 1,
      "topic": "AWS Fundamentals",
      "description": "Learn EC2, S3, RDS basics. Complete AWS Cloud Practitioner prep.",
      "resources": ["AWS Free Tier", "A Cloud Guru", "AWS official docs"]
    },
    {
      "week": 2,
      "topic": "Docker & Containerization",
      "description": "Learn Docker basics, Dockerfile creation, docker-compose.",
      "resources": ["Docker official docs", "TechWorld with Nana YouTube"]
    },
    {
      "week": 3,
      "topic": "Apache Airflow",
      "description": "Understand DAGs, operators, task scheduling for data pipelines.",
      "resources": ["Airflow docs", "Marc Lamberti YouTube channel"]
    },
    {
      "week": 4,
      "topic": "Mini Project",
      "description": "Build an end-to-end data pipeline using AWS + Docker + Airflow.",
      "resources": ["GitHub project ideas", "Medium blogs"]
    }
  ]
}

Prioritize the most impactful skills first. Be specific with resources. Return only valid JSON.
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
    console.error('Skill gap analyzer error:', error);
    throw new Error(`Skill gap analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeSkillGap };
