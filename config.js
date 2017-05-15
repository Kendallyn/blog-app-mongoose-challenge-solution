exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
    'mongodb: //admin:password@ds137801.mlab.com:37801/test-blog-integration';
exports.PORT = process.env.PORT || 8080;
