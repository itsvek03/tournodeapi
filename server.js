const app = require('./index');
require('./connection/connection');


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

//port var
const port = process.env.PORT || 5000;
//server start
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
})