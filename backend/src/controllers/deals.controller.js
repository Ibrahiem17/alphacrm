import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dealSchema = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).optional().default('LEAD'),
  contactId: z.string(),
});

export const stageSchema = z.object({
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']),
});

export const listDeals = async (req, res) => {
  const where = req.user.role === 'SALES_REP' ? { ownerId: req.user.id } : {};
  const deals = await prisma.deal.findMany({ where });
  return res.json(deals);
};

export const getDeal = async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'SALES_REP' && deal.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json(deal);
};

export const createDeal = async (req, res) => {
  const deal = await prisma.deal.create({
    data: { ...req.body, ownerId: req.user.id },
  });
  return res.status(201).json(deal);
};

export const updateDeal = async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'SALES_REP' && deal.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.deal.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return res.json(updated);
};

export const deleteDeal = async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal) return res.status(404).json({ error: 'Not found' });

  await prisma.deal.delete({ where: { id: req.params.id } });
  return res.status(204).send();
};

export const moveStage = async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'SALES_REP' && deal.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.deal.update({
    where: { id: req.params.id },
    data: { stage: req.body.stage },
  });
  return res.json(updated);
};
