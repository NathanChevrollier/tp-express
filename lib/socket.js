import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Filter for bad words
const BAD_WORDS = ['merde','con','pute','salope','fdp','batard'];

// sanitol tout dans ta maison
const sanitize = (text) => {
  let result = text;
  BAD_WORDS.forEach(badWord => {
    const wordRegex = new RegExp(`\\b${badWord}\\b`, 'gi');
    result = result.replace(wordRegex, '*'.repeat(badWord.length));
  });
  return result;
};

const DEFAULT_ROOM = 'générale';

export async function initializeWebSocket(io) {
  // Open database connection
  const db = await open({
    filename: path.join(__dirname, '..', 'chat.db'),
    driver: sqlite3.Database
  });

  // Create if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT,
        username TEXT,
        room TEXT DEFAULT 'générale',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  async function sendHistory(socket, roomName) {
    try {
      const rows = await db.all(
        'SELECT id, content, username, created_at FROM messages WHERE room = ? ORDER BY id DESC LIMIT 100',
        [roomName]
      );
      rows.reverse().forEach(row => {
        socket.emit('chat message', row.content, row.id, row.username, row.created_at);
      });
    } catch (error) {
      console.log('Error sending history:', error);
    }
  }

  // Socket.IO
  io.on('connection', async (socket) => {
    const auth = socket.handshake?.auth || {};
    const initialRoom = auth.room || DEFAULT_ROOM;
    socket.join(initialRoom);
    socket.data.room = initialRoom;
    await sendHistory(socket, initialRoom);

    // Handle chat message event
    socket.on('chat message', async (msg, clientOffset, username, callback) => {
      let result;
      const room = socket.data.room || DEFAULT_ROOM;
      const cleaned = sanitize(msg);
      const now = new Date().toISOString();
      
      try {
        result = await db.run(
          'INSERT INTO messages (content, client_offset, username, room, created_at) VALUES (?, ?, ?, ?, ?)', 
          cleaned, clientOffset, username, room, now
        );
      } catch (e) {
        if (e.errno === 19) { // SQLITE_CONSTRAINT
          callback && callback();
        }
        return;
      }
      
      // Emit message to all sockets in the room
      io.to(room).emit('chat message', cleaned, result.lastID, username, now);
      callback && callback();
    });

    // Handle room change event
    socket.on('join room', async (roomName, callback) => {
      try {
        const prev = socket.data.room;
        if (prev) socket.leave(prev);
        socket.join(roomName);
        socket.data.room = roomName;
        await sendHistory(socket, roomName);
        callback && callback();
      } catch (e) {
        callback && callback(e);
      }
    });
  });
}
