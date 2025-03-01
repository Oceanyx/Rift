const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const serversRouter = require('./servers.js');
const channelsRouter = require('./channels.js');
const messagesRouter = require('./messages.js');
const rolesRouter = require('./roles.js');
const serverMembersRouter = require('./server-members.js');
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/servers', serversRouter);
router.use('/channels', channelsRouter);
router.use('/messages', messagesRouter);
router.use('/roles', rolesRouter);
router.use('/server-members', serverMembersRouter);

// Error handler for API routes
router.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(err);
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode,
    errors: err.errors
  });
});

module.exports = router;