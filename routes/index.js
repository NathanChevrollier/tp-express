import express from 'express';
import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getMinBills } from '../lib/dab.js';
import * as userService from '../lib/userService.js';
const router = express.Router();

const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user === 'admin') return next();
  res.redirect('/login');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TP Express' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About' });
});

router.get('/contact', function(req, res) {
  res.render('contact', { title: 'Contact' });
});

router.get('/chat', function(req, res) {
  res.render('chat', { title: 'Chat WebSocket' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin', { title: 'Admin' });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// download route
router.get('/download', (req, res, next) => {
  const now = new Date();

  const padZero = (number) => (number < 10 ? '0' + number : number);

  const YYYY = now.getFullYear();
  const MM = padZero(now.getMonth() + 1);
  const DD = padZero(now.getDate());
  const hh = padZero(now.getHours());
  const mm = padZero(now.getMinutes());
  const ss = padZero(now.getSeconds());

  const filename = `${YYYY}${MM}${DD}_${hh}${mm}${ss}.txt`;
  const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');

  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

  const filePath = path.join(downloadsDir, filename);
  const content = `Téléchargé le ${now.toISOString()}\n`;

  try {
    fs.writeFileSync(filePath, content);
    res.download(filePath, filename, (err) => { if (err) next(err); });
  } catch (err) {
    next(err);
  }
});

// DAB fallback 
router.get('/dab', function(req, res) {
  if (req.query.amount) {
    var result = getMinBills(req.query.amount);
    return res.render('dab', { title: 'DAB', amount: req.query.amount, result: result });
  }
  // no amount show empty form
  res.render('dab', { title: 'DAB', amount: null, result: null });
});

// DAB dynamic
router.get('/dab/:amount', function(req, res) {
  var param = req.params.amount;
  var result = getMinBills(param);
  res.render('dab', { title: 'DAB', amount: param, result: result });
});

// 404
router.get('/show-404', function(req, res){
  res.redirect('/this-page-does-not-exist');
});

router.get('/prisma-check', async (req, res) => {
  res.redirect('/api/users/prisma-check');
});

// Users management page
router.get('/users', async (req, res) => {
  try {
    const users = await userService.listUsers();
    let editUser = null;
    
    // If edit query param is present, fetch that user
    if (req.query.edit) {
      const id = Number(req.query.edit);
      if (Number.isInteger(id) && id > 0) {
        editUser = await userService.getUserById(id);
      }
    }
    
    res.render('user', { 
      title: 'Gestion des utilisateurs', 
      users, 
      editUser 
    });
  } catch (error) {
    console.error('Error loading users page:', error);
    res.status(500).render('error', { 
      message: 'Erreur lors du chargement des utilisateurs', 
      error: error 
    });
  }
});

router.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.render('login', { title: 'Login', error: 'Champs manquants' });
  }

  try {
    // admin en dur
    if (username === 'admin' && password === 'admin') {
      req.session.user = 'admin';
      return res.redirect('/');
    }
} catch (error) {
    console.error('Prisma error:', error);
    return res.render('login', { title: 'Login', error: 'Erreur lors de la connexion' });
  }
});

export default router;
