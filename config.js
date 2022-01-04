module.exports = {
    port: process.env.PORT || 2022,
    corsWhitelist: [
        'https://amongoose.com',
        'http://amongoose.com', 
        'https://amongoose.com.au',
        'http://amongoose.com.au'
    ],
    rateLimit: {
        windowMs: 24 * 60 * 60 * 1000, // 24 hour window
        max: 2,
        standardHeaders: true,
        legacyHeaders: false
    }
}