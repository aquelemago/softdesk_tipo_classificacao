module.exports = {
  apps: [
    {
      name: 'softdesk-type-classifier',
      script: 'server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        AUTO_SCHEDULE_ENABLED: 'true',
        AUTO_SCHEDULE_LIMIT: '50',
        PORT: '4000'
      }
    }
  ]
};
