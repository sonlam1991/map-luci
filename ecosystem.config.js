require('dotenv').config();

module.exports = {
  apps : [{
    name: 'luci-map',
    script: 'index.js',

    instances: 2,
    max_memory_restart: '2G',
    env: {
      NODE_PATH: '.'
    },
    args: '',
    exec_mode  : 'cluster',

    log_file: 'logs/combined',
    time: false,

    autorestart: true,
    watch: false
  }]
};
