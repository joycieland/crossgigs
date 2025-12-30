import { drizzle } from "drizzle-orm/mysql2";
import { jobs } from "./drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const sampleJobs = [
  {
    title: "Build a Modern E-commerce Landing Page",
    description: "Create a responsive landing page for an e-commerce platform with product showcase, hero section, and call-to-action buttons. Must be mobile-friendly and follow modern design principles.",
    category: "Web Development",
    requiredSkills: JSON.stringify(["React", "Tailwind CSS", "Responsive Design", "UI/UX"]),
    paymentAmount: "150",
  },
  {
    title: "Design Logo and Brand Identity",
    description: "Design a complete brand identity package including logo, color palette, typography guidelines, and brand assets for a tech startup. Deliverables should include vector files and brand guidelines document.",
    category: "Graphic Design",
    requiredSkills: JSON.stringify(["Adobe Illustrator", "Branding", "Logo Design", "Typography"]),
    paymentAmount: "200",
  },
  {
    title: "Write Technical Documentation for API",
    description: "Create comprehensive technical documentation for a RESTful API including endpoint descriptions, request/response examples, authentication guide, and error handling documentation.",
    category: "Technical Writing",
    requiredSkills: JSON.stringify(["API Documentation", "Technical Writing", "Markdown", "REST"]),
    paymentAmount: "100",
  },
  {
    title: "Develop Smart Contract for NFT Marketplace",
    description: "Build and test a Solidity smart contract for an NFT marketplace on Ethereum. Must include minting, buying, selling, and royalty distribution features with comprehensive unit tests.",
    category: "Blockchain Development",
    requiredSkills: JSON.stringify(["Solidity", "Smart Contracts", "Web3", "Testing"]),
    paymentAmount: "300",
  },
  {
    title: "Create Social Media Content Calendar",
    description: "Develop a 30-day social media content calendar for a SaaS product launch including post copy, hashtags, and visual content suggestions for LinkedIn, Twitter, and Instagram.",
    category: "Content Marketing",
    requiredSkills: JSON.stringify(["Social Media Marketing", "Content Strategy", "Copywriting", "SaaS"]),
    paymentAmount: "120",
  },
];

async function seed() {
  console.log("Seeding database with sample jobs...");
  
  for (const job of sampleJobs) {
    await db.insert(jobs).values(job);
    console.log(`✓ Created job: ${job.title}`);
  }
  
  console.log("✓ Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
