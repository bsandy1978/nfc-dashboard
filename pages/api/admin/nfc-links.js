import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const links = await prisma.nfcLink.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        return res.status(200).json(links);
      } catch (error) {
        console.error('Error fetching NFC links:', error);
        return res.status(500).json({ error: 'Failed to fetch NFC links' });
      }

    case 'POST':
      try {
        const { slug } = req.body;
        if (!slug) {
          return res.status(400).json({ error: 'Slug is required' });
        }

        const existingLink = await prisma.nfcLink.findUnique({
          where: { slug },
        });

        if (existingLink) {
          return res.status(400).json({ error: 'Slug already exists' });
        }

        const link = await prisma.nfcLink.create({
          data: {
            slug,
            link: `${process.env.NEXT_PUBLIC_BASE_URL}/r/${slug}`,
          },
        });

        return res.status(201).json(link);
      } catch (error) {
        console.error('Error creating NFC link:', error);
        return res.status(500).json({ error: 'Failed to create NFC link' });
      }

    case 'PUT':
      try {
        const { id, isActive } = req.body;
        if (!id || typeof isActive !== 'boolean') {
          return res.status(400).json({ error: 'Invalid request' });
        }

        const link = await prisma.nfcLink.update({
          where: { id },
          data: { isActive },
        });

        return res.status(200).json(link);
      } catch (error) {
        console.error('Error updating NFC link:', error);
        return res.status(500).json({ error: 'Failed to update NFC link' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 