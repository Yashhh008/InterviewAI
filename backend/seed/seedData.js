require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@interviewai.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Demo User',
    email: 'demo@interviewai.com',
    password: 'Demo@1234',
    role: 'user',
    education: { college: 'IIT Delhi', degree: 'BTech CSE', graduationYear: '2024' },
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
  },
];

const seedCompanies = [
  {
    name: 'Google',
    overview: 'Multinational technology company specializing in search, cloud computing, advertising, and AI.',
    businessModel: 'Advertising, cloud services, hardware products, and subscription services.',
    techStack: ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow', 'BigQuery'],
    interviewPattern: '4-6 rounds: coding (DSA), system design, behavioral (Googleyness), and domain-specific.',
    frequentTopics: ['Data Structures & Algorithms', 'System Design', 'Distributed Systems', 'Machine Learning'],
    importantConcepts: ['Consistent Hashing', 'MapReduce', 'Bigtable', 'PageRank', 'CAP Theorem'],
    difficulty: 'Very Hard',
  },
  {
    name: 'Amazon',
    overview: 'E-commerce, cloud computing (AWS), digital streaming, and AI leader.',
    businessModel: 'E-commerce marketplace, AWS cloud services, Prime subscriptions, and advertising.',
    techStack: ['Java', 'Python', 'AWS Services', 'DynamoDB', 'Kafka', 'React'],
    interviewPattern: 'Bar Raiser format: behavioral (Leadership Principles) + coding + system design.',
    frequentTopics: ['Leadership Principles', 'System Design at Scale', 'OOP', 'SQL/NoSQL'],
    importantConcepts: ['CAP Theorem', 'Eventual Consistency', 'S3 Architecture', 'Lambda Functions'],
    difficulty: 'Hard',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('🗑️  Cleared existing seed data');

    // Create users
    for (const u of seedUsers) {
      await User.create(u);
    }
    console.log(`✅ Created ${seedUsers.length} users`);

    // Create companies
    await Company.insertMany(seedCompanies);
    console.log(`✅ Created ${seedCompanies.length} company profiles`);

    console.log('\n🎉 Seed complete!');
    console.log('📧 Admin login: admin@interviewai.com / Admin@123');
    console.log('📧 Demo login:  demo@interviewai.com  / Demo@1234');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
