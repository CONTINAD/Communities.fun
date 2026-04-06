import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const password = await bcrypt.hash("password123", 12);

  const alex = await prisma.user.upsert({
    where: { email: "alex@communities.fun" },
    update: {},
    create: {
      email: "alex@communities.fun",
      username: "alex",
      name: "Alex",
      password,
      bio: "Building communities, one post at a time.",
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@communities.fun" },
    update: {},
    create: {
      email: "sarah@communities.fun",
      username: "sarah",
      name: "Sarah Chen",
      password,
      bio: "Designer & community enthusiast",
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike@communities.fun" },
    update: {},
    create: {
      email: "mike@communities.fun",
      username: "mike",
      name: "Mike Johnson",
      password,
      bio: "Full-stack developer. Open source contributor.",
    },
  });

  // Create communities
  const webDev = await prisma.community.upsert({
    where: { slug: "web-dev" },
    update: {},
    create: {
      name: "Web Development",
      slug: "web-dev",
      description: "A community for web developers to share knowledge, discuss trends, and help each other build amazing things on the web.",
      creatorId: alex.id,
    },
  });

  const design = await prisma.community.upsert({
    where: { slug: "design" },
    update: {},
    create: {
      name: "Design",
      slug: "design",
      description: "For designers of all kinds — UI/UX, graphic design, motion design, and more. Share your work, get feedback, and stay inspired.",
      creatorId: sarah.id,
    },
  });

  const startups = await prisma.community.upsert({
    where: { slug: "startups" },
    update: {},
    create: {
      name: "Startups",
      slug: "startups",
      description: "Founders, builders, and dreamers. Share your journey, ask for advice, and connect with fellow entrepreneurs.",
      creatorId: mike.id,
    },
  });

  const gaming = await prisma.community.upsert({
    where: { slug: "gaming" },
    update: {},
    create: {
      name: "Gaming",
      slug: "gaming",
      description: "Level up your gaming experience. Discuss the latest releases, share clips, and find your squad.",
      creatorId: alex.id,
    },
  });

  // Add memberships
  const memberships = [
    { userId: alex.id, communityId: webDev.id, role: "ADMIN" },
    { userId: alex.id, communityId: design.id, role: "MEMBER" },
    { userId: alex.id, communityId: startups.id, role: "MEMBER" },
    { userId: alex.id, communityId: gaming.id, role: "ADMIN" },
    { userId: sarah.id, communityId: webDev.id, role: "MEMBER" },
    { userId: sarah.id, communityId: design.id, role: "ADMIN" },
    { userId: sarah.id, communityId: startups.id, role: "MEMBER" },
    { userId: mike.id, communityId: webDev.id, role: "MODERATOR" },
    { userId: mike.id, communityId: startups.id, role: "ADMIN" },
    { userId: mike.id, communityId: gaming.id, role: "MEMBER" },
  ];

  for (const m of memberships) {
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: m.userId, communityId: m.communityId } },
      update: {},
      create: m,
    });
  }

  // Create posts
  const posts = [
    {
      content: "Just shipped a new feature using Next.js 14 Server Actions. The DX is incredible — no API routes needed for mutations. Who else is loving this pattern?",
      authorId: alex.id,
      communityId: webDev.id,
    },
    {
      content: "Hot take: Tailwind CSS has completely changed how I think about styling. Going back to writing custom CSS files feels painful now. What's your preferred approach?",
      authorId: mike.id,
      communityId: webDev.id,
    },
    {
      content: "Working on a new design system for our product. The key insight: consistency > creativity for UI components. Save the creativity for the overall experience.",
      authorId: sarah.id,
      communityId: design.id,
    },
    {
      content: "Year 2 of our startup journey. Revenue is growing 15% MoM. The biggest lesson? Talk to your users every single day. Not surveys — actual conversations.",
      authorId: mike.id,
      communityId: startups.id,
    },
    {
      content: "Launched Communities.fun today! Excited to build a space where communities can thrive without the noise. What features would you want to see?",
      authorId: alex.id,
      communityId: startups.id,
    },
    {
      content: "The new indie game releases this month are absolutely stacked. What are you all playing?",
      authorId: alex.id,
      communityId: gaming.id,
    },
    {
      content: "Typography tip: When in doubt, increase your line height. Most text on the web is too cramped. 1.5-1.7 for body text is the sweet spot.",
      authorId: sarah.id,
      communityId: design.id,
    },
    {
      content: "Just discovered that React Server Components can import server-only modules directly. No more 'use client' wrapper chains. The mental model is so much cleaner.",
      authorId: alex.id,
      communityId: webDev.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  // Add some rules
  await prisma.communityRule.createMany({
    data: [
      { communityId: webDev.id, title: "Be respectful", description: "Treat everyone with respect. No personal attacks or harassment.", order: 1 },
      { communityId: webDev.id, title: "Stay on topic", description: "Keep discussions related to web development.", order: 2 },
      { communityId: webDev.id, title: "No spam", description: "Don't post promotional content or spam links.", order: 3 },
      { communityId: design.id, title: "Give constructive feedback", description: "When critiquing work, be constructive and kind.", order: 1 },
      { communityId: design.id, title: "Credit original work", description: "Always credit the original creator when sharing others' work.", order: 2 },
    ],
  });

  console.log("Seed data created successfully!");
  console.log("\nDemo accounts (password: password123):");
  console.log("  alex@communities.fun");
  console.log("  sarah@communities.fun");
  console.log("  mike@communities.fun");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
