import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const listContacts = async (req, res) => {
  const where = req.user.role === 'SALES_REP' ? { ownerId: req.user.id } : {};
  const contacts = await prisma.contact.findMany({ where });
  return res.json(contacts);
};

export const getContact = async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'SALES_REP' && contact.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json(contact);
};

export const createContact = async (req, res) => {
  const contact = await prisma.contact.create({
    data: { ...req.body, ownerId: req.user.id },
  });
  return res.status(201).json(contact);
};

export const updateContact = async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'SALES_REP' && contact.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.contact.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return res.json(updated);
};

export const deleteContact = async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) return res.status(404).json({ error: 'Not found' });

  await prisma.contact.delete({ where: { id: req.params.id } });
  return res.status(204).send();
};
