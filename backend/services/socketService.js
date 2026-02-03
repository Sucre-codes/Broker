/**
 * socketService.js
 * 
 * Centralised Socket.io bootstrap + emit helpers.
 * 
 * Usage in your main app (server.js / app.js):
 * 
 *   const http          = require('http');
 *   const app           = require('./app');           // express app
 *   const { initSocket } = require('./services/socketService');
 * 
 *   const server = http.createServer(app);
 *   initSocket(server);                               // attaches io to server
 *   server.listen(PORT);
 * 
 * Everywhere else you need to emit, just:
 *   const { emitPaymentDetails } = require('./services/socketService');
 *   emitPaymentDetails(userId, details);
 */

const { Server } = require('socket.io');

// ---------------------------------------------------------------------------
// Module-level reference so helpers can reach `io` without re-importing
// ---------------------------------------------------------------------------
let io = null;

// ---------------------------------------------------------------------------
// Auth middleware for Socket.io
// Extracts the JWT from the handshake query (or header) and attaches the
// decoded user to every socket so we know *who* connected.
// ---------------------------------------------------------------------------
function authMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||          // { auth: { token } } from client
      socket.handshake.query?.token ||         // ?token=xxx fallback
      (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

    if (!token) {
      return next(new Error('No token provided'));
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach to socket so every handler can read socket.userId
    socket.userId = decoded.id || decoded._id || decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
}

// ---------------------------------------------------------------------------
// Initialise Socket.io on an existing HTTP server
// ---------------------------------------------------------------------------
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Apply auth middleware to every incoming connection
  io.use(authMiddleware);

  // ---------------------------------------------------------------------------
  // Connection handler
  // ---------------------------------------------------------------------------
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔗 Socket connected — userId: ${userId}  socketId: ${socket.id}`);

    // Join a private room keyed to this user.
    // This lets the server push events to exactly one user later.
    socket.join(`user:${userId}`);
    console.log(`📦 Joined room: user:${userId}`);

    // -----------------------------------------------------------------------
    // Client can explicitly re-join (e.g. after a page navigation)
    // -----------------------------------------------------------------------
    socket.on('join_room', (data) => {
      if (data?.userId && data.userId === userId) {
        socket.join(`user:${userId}`);
        console.log(`📦 Re-joined room: user:${userId}`);
      }
    });

    // -----------------------------------------------------------------------
    // Ping / Pong — useful for connection health-checks on the frontend
    // -----------------------------------------------------------------------
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // -----------------------------------------------------------------------
    // Disconnect cleanup
    // -----------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`🔕 Socket disconnected — userId: ${userId}  reason: ${reason}`);
    });
  });

  console.log('✅ Socket.io initialised');
  return io;
}

// ---------------------------------------------------------------------------
// Emit helpers — used by controllers / services on the server side
// ---------------------------------------------------------------------------

/**
 * Send payment-details payload from admin to a specific user.
 * The frontend listens on the "payment_details_ready" event.
 *
 * @param {string} userId   - Mongo ObjectId (string) of the target user
 * @param {object} details   - Arbitrary payload the admin composed
 *   {
 *     investmentId : string,
 *     paymentMethod: 'crypto' | 'wire',
 *     // --- crypto ---
 *     cryptoAddress: string,
 *     cryptoNetwork: string,
 *     cryptoCurrency: string,
 *     cryptoAmount  : number,   // amount in the chosen crypto
 *     // --- wire ---
 *     bankName      : string,
 *     accountName   : string,
 *     accountNumber : string,
 *     routingNumber : string,
 *     swiftCode     : string,
 *     bankAddress   : string,
 *     referenceNote : string,   // e.g. "include your user ID"
 *     // --- shared ---
 *     usdAmount     : number,
 *     instructions  : string[],
 *   }
 */
function emitPaymentDetails(userId, details) {
  if (!io) {
    console.warn('⚠️  Socket.io not initialised — cannot emit payment_details_ready');
    return false;
  }

  const room = `user:${userId}`;
  const clientCount = io.sockets.adapter.rooms?.get(room)?.size || 0;

  io.to(room).emit('payment_details_ready', {
    ...details,
    sentAt: new Date().toISOString(),
  });

  console.log(`📤 Emitted payment_details_ready → room ${room} (${clientCount} client(s))`);
  return true;
}

/**
 * Notify a user that their payment has been approved / rejected.
 * Generic "investment status update" event.
 *
 * @param {string} userId
 * @param {object} update   { investmentId, status: 'approved'|'rejected', message, ... }
 */
function emitInvestmentUpdate(userId, update) {
  if (!io) {
    console.warn('⚠️  Socket.io not initialised — cannot emit investment_update');
    return false;
  }

  io.to(`user:${userId}`).emit('investment_update', {
    ...update,
    sentAt: new Date().toISOString(),
  });

  console.log(`📤 Emitted investment_update → user:${userId}`);
  return true;
}

// ---------------------------------------------------------------------------
// Getter — handy if some other module needs the raw `io` instance
// ---------------------------------------------------------------------------
function getIO() {
  return io;
}

module.exports = {
  initSocket,
  emitPaymentDetails,
  emitInvestmentUpdate,
  getIO,
};