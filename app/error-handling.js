const trycatch = require('trycatch').configure({'long-stack-traces': true});

process.on('uncaughtApplicationException', function(err) {
  console.log('uncaughtApplicationException: \n\n', err.stack);
});

process.on('uncaughtException', function(err) {
  console.log('uncaughtException: \n\n', err.stack);
  // IMPORTANT: Exit the process (optionally, soft exit)
  process.exit();
})

process.on('unhandledRejection', (err, rejectedPromise) => {
  console.log('unhandledRejection: \n\n', err.stack);
});
