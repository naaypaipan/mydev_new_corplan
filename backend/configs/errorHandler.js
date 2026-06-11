module.exports = (isProduction = false, app) => {
    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Endpoint Not Found');
        err.status = 404;
        next(err);
    });

    app.use((err, req, res) => {
        if (!isProduction) {
            console.log(err.stack);
        }
        // eslint-disable-next-line no-magic-numbers
        const statusCode = err.status || 500;
        res.status(statusCode);
        res.json({
            error: {
                status: statusCode,
                message: err.message,
            },
        });
    });
};
