const config = require('./config');

const yetkili = (userId) => config.yetkiliIDs.includes(String(userId));

module.exports = { yetkili };
