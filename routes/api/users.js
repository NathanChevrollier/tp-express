import express from 'express';
import * as userService from '../../lib/userService.js';

const router = express.Router();

// Prisma check
router.get('/prisma-check', async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.render('prisma', { title: 'Prisma Check', ok: true, count: users.length });
  } catch (error) {
    console.error('Prisma error:', error);
    res.status(500).send('Erreur lors de la récupération des utilisateurs.');
  }
});

// donne tout 
router.get('/', async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// donne connard 
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

//Creat
router.post('/', async (req, res) => {
  try {
    const created = await userService.createUser(req.body);
    res.redirect(303, '/users');
  } catch (error) {
    res.redirect(303, '/users');
  }
});

//Update
router.put('/:id', async (req, res) => {
  try {
    await userService.updateUser(Number(req.params.id), req.body);
    res.redirect(303, '/users');
  } catch (error) {
    res.redirect(303, '/users');
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await userService.deleteUser(Number(req.params.id));
    res.redirect(303, '/users');
  } catch (error) {
    res.redirect(303, '/users');
  }
});

export default router;