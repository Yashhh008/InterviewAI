const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

const getMockDataForPrompt = (prompt) => {
  const p = prompt.toLowerCase();

  if (p.includes('ats resume parser') || p.includes('resume text:')) {
    return JSON.stringify({
      summary: "Experienced software developer with a strong foundation in full-stack web applications and cloud computing.",
      extractedSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "Python", "SQL", "Git"],
      projects: [
        {
          name: "E-Commerce Platform",
          description: "Built a scalable e-commerce website with real-time payment integration.",
          technologies: ["React", "Node.js", "MongoDB"]
        }
      ],
      education: [
        {
          degree: "BTech Computer Science",
          institution: "State University",
          year: "2024",
          field: "Computer Science"
        }
      ],
      experience: [
        {
          company: "Tech Solutions Inc.",
          role: "Software Engineering Intern",
          duration: "Jun 2023 - Aug 2023",
          description: "Assisted in developing REST APIs and frontend components for dashboard modules."
        }
      ],
      certifications: ["AWS Certified Cloud Practitioner"],
      missingInfo: ["Portfolio website link", "LinkedIn URL"],
      improvementSuggestions: ["Highlight metrics or impact in project descriptions", "Add more details on certifications"]
    });
  }

  if (p.includes('job description analyzer') || p.includes('job description:')) {
    return JSON.stringify({
      role: "Full Stack Engineer",
      company: "Innovative Labs",
      experienceLevel: "Entry",
      requiredSkills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML/CSS"],
      preferredSkills: ["TypeScript", "AWS", "Docker", "Tailwind CSS"],
      responsibilities: ["Develop user-facing features using React", "Build robust backend services and APIs in Node.js", "Collaborate with cross-functional teams to define requirements"],
      interviewTopics: ["JavaScript & React Concepts", "REST API Development", "Data Structures & Algorithms", "System Design Basics"]
    });
  }

  if (p.includes('ats (applicant tracking system) analyzer')) {
    return JSON.stringify({
      atsScore: 78,
      matchingSkills: ["React", "Node.js", "MongoDB", "JavaScript", "HTML/CSS"],
      missingSkills: ["TypeScript", "AWS", "Docker"],
      recommendations: [
        "Mention TypeScript in your resume to match preferred skills",
        "Add a containerization project demonstrating Docker experience",
        "Incorporate AWS Cloud concepts in your project descriptions"
      ],
      keywordAnalysis: {
        totalKeywords: 10,
        matchedKeywords: 7,
        matchPercentage: 70
      }
    });
  }

  if (p.includes('skill gap analyzer') || p.includes('roadmap')) {
    return JSON.stringify({
      missingSkills: ["TypeScript", "AWS", "Docker"],
      roadmap: [
        {
          week: 1,
          topic: "TypeScript Fundamentals",
          description: "Learn static typing, interfaces, enums, generics, and setting up tsconfig.json in React.",
          resources: ["TypeScript official documentation", "Jack Herrington YouTube channel"]
        },
        {
          week: 2,
          topic: "AWS Essentials",
          description: "Understand EC2, S3, Lambda, and IAM roles. Practice deploying a static React app on S3.",
          resources: ["AWS Free Tier tutorials", "A Cloud Guru introductory courses"]
        },
        {
          week: 3,
          topic: "Docker Containers",
          description: "Learn to write Dockerfiles, build images, run containers, and manage multi-container systems using docker-compose.",
          resources: ["Docker official docs", "TechWorld with Nana Docker tutorial"]
        },
        {
          week: 4,
          topic: "Capstone Full-Stack Deployment",
          description: "Deploy a Dockerized Node.js + React application using AWS Lambda or ECS.",
          resources: ["Medium guides on full-stack deployment", "GitHub boilerplate templates"]
        }
      ]
    });
  }

  if (p.includes('expert technical interviewer') && p.includes('interview questions')) {
    return JSON.stringify([
      {
        category: "technical",
        question: "What is the difference between state and props in React?",
        difficulty: "Easy",
        hint: "Immutable props vs mutable state managed internally by the component."
      },
      {
        category: "sql",
        question: "How do you optimize a query that is running slowly on a large database table?",
        difficulty: "Medium",
        hint: "Indexes, checking query execution plans, avoiding select *."
      },
      {
        category: "behavioral",
        question: "Tell me about a time you faced a difficult technical challenge and how you solved it.",
        difficulty: "Medium",
        hint: "STAR method: Situation, Task, Action, Result."
      },
      {
        category: "system_design",
        question: "Design a URL shortener like Bitly.",
        difficulty: "Hard",
        hint: "API endpoints, database choice, hashing algorithms, scaling/caching."
      },
      {
        category: "hr",
        question: "Why do you want to join our company?",
        difficulty: "Easy",
        hint: "Company values, tech stack, interest in products."
      }
    ]);
  }

  if (p.includes('evaluating a candidate\'s answer')) {
    return JSON.stringify({
      score: 8,
      accuracy: 8,
      communication: 9,
      completeness: 7,
      relevance: 9,
      strengths: ["Clear explanation of basic state and prop differences", "Good communication style"],
      weaknesses: ["Missed mentioning component re-rendering triggers"],
      improvedAnswer: "Props are external parameters passed down to components and are read-only/immutable. State represents mutable data managed internally by the component, which triggers a re-render when changed.",
      keyConceptsMissed: ["Re-render triggers", "Immutability details"]
    });
  }

  if (p.includes('company research expert') || p.includes('research the company')) {
    return JSON.stringify({
      name: "General Tech",
      overview: "A leading global provider of software solutions and cloud architecture platforms.",
      businessModel: "SaaS subscriptions, enterprise licensing, and professional services.",
      products: ["Cloud Portal", "Analytix Dashboards"],
      techStack: ["React", "TypeScript", "Node.js", "AWS", "Python"],
      interviewPattern: "Initial recruiter screen, 1 technical phone round, 3-4 on-site coding/system design rounds.",
      frequentTopics: ["Data Structures & Algorithms", "System Design Scalability", "RESTful API Best Practices"],
      importantConcepts: ["Caching strategies", "CAP theorem", "Load balancing"],
      difficulty: "Hard",
      hrQuestions: ["Why do you want to work here?", "Tell me about yourself."]
    });
  }

  if (p.includes('post-interview report')) {
    return JSON.stringify({
      overallScore: 8.0,
      technicalScore: 8.0,
      communicationScore: 8.5,
      hrScore: 8.0,
      strengths: ["Structured answers to technical questions", "Good communication speed"],
      weakAreas: ["Missed edge cases in system design", "SQL joins could be optimized"],
      improvementPlan: "Practice writing clean, optimized SQL queries and design trade-offs. Spend time studying scaling mechanisms.",
      studyPlan: [
        { "day": "Monday", "topic": "SQL Optimization", "resources": ["LeetCode SQL", "W3Schools"] },
        { "day": "Tuesday", "topic": "System Design Basics", "resources": ["System Design Primer"] },
        { "day": "Wednesday", "topic": "DBMS Indexes", "resources": ["GeeksforGeeks DBMS"] },
        { "day": "Thursday", "topic": "Communication skills", "resources": ["Pracitce mock chats"] },
        { "day": "Friday", "topic": "Array Algorithms", "resources": ["LeetCode Easy/Medium"] },
        { "day": "Saturday", "topic": "Mock Interviews", "resources": ["Pramp"] },
        { "day": "Sunday", "topic": "Review notes", "resources": [] }
      ]
    });
  }

  if (p.includes('learning coach') || p.includes('weekly study plan')) {
    return JSON.stringify([
      {
        day: "Monday",
        topic: "SQL & Database Optimization",
        focus: "Indexing, query optimization, joins",
        tasks: ["Solve 5 LeetCode SQL problems", "Read about B-Tree indexes", "Practice window functions"],
        resources: ["LeetCode SQL 50", "Use The Index Luke"],
        estimatedHours: 3
      },
      {
        day: "Tuesday",
        topic: "System Design Basics",
        focus: "Load balancers, caching, CDN",
        tasks: ["Read System Design Primer", "Design simple URL shortener"],
        resources: ["System Design Primer"],
        estimatedHours: 3
      },
      {
        day: "Wednesday",
        topic: "React Rendering Lifecycle",
        focus: "Hooks, virtual DOM, reconciliation",
        tasks: ["Read React docs on performance", "Profile a complex component"],
        resources: ["React Official Documentation"],
        estimatedHours: 2
      },
      {
        day: "Thursday",
        topic: "DSA Arrays & Hashing",
        focus: "HashMap, sliding window, two pointer",
        tasks: ["Solve 4 LeetCode medium array problems"],
        resources: ["NeetCode 150"],
        estimatedHours: 3
      },
      {
        day: "Friday",
        topic: "AWS Basics",
        focus: "S3, EC2, Lambda",
        tasks: ["Deploy React static site on AWS S3"],
        resources: ["AWS Tutorials"],
        estimatedHours: 3
      },
      {
        day: "Saturday",
        topic: "Mock Interviews",
        focus: "Behavioral and technical coding",
        tasks: ["Do a practice session on Pramp"],
        resources: ["Pramp"],
        estimatedHours: 2
      },
      {
        day: "Sunday",
        topic: "Review & Rest",
        focus: "Review week's notes and concepts",
        tasks: ["Go over missed key concepts in study plan"],
        resources: [],
        estimatedHours: 1
      }
    ]);
  }

  return JSON.stringify({
    success: true,
    message: "Fallback mock data generated successfully"
  });
};

const getModel = () => {
  let realModel;
  try {
    realModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (err) {
    console.warn('⚠️ Failed to initialize standard Gemini model:', err.message);
  }

  return {
    generateContent: async (prompt) => {
      try {
        if (!realModel || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_')) {
          throw new Error('No valid Gemini API key set');
        }
        return await realModel.generateContent(prompt);
      } catch (err) {
        console.warn('⚠️ Gemini API error or missing credentials, falling back to mock data:', err.message);
        const mockText = getMockDataForPrompt(prompt);
        return {
          response: {
            text: () => mockText
          }
        };
      }
    }
  };
};

const parseJSON = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    return JSON.parse(text);
  } catch {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch {}
    }
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch {}
    }
    return null;
  }
};

module.exports = { getModel, parseJSON };
