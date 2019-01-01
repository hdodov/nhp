var isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
    root: process.cwd(),
    cache: isProduction
};
