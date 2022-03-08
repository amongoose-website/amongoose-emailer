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
    },
    inboundEmailWhitelist: ['anthony@amongoose.com', 'jooshuagrimmett@gmail.com', 'joshua@grimmett.com.au'],
    assetsPath: '/var/www/html/mongoose-gatsby-site/static/assets',
    postsPath: '/var/www/html/mongoose-gatsby-site/src/pages/posts',
    multerPath: `${__dirname}/uploads`,
    gitRepoPath: '/var/www/html/mongoose-gatsby-site/mongoose-site/'
}