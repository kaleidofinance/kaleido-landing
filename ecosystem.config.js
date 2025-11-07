module.exports = {
  apps: [{
    name: 'kalaido',
    script: '.next/standalone/server.js',
    cwd: '/home/kaleido/htdocs/kaleidofinance.xyz',
    env: {
      PORT: 3020,
      NODE_ENV: 'production',
      UV_THREADPOOL_SIZE: 16,
      NODE_OPTIONS: '--max-old-space-size=3072',
      NEXT_TELEMETRY_DISABLED: '1',
      MONGODB_URI: 'mongodb://kaleidoUser:NvxXBuTE6kn29UbKAcFzPDG8C@147.93.52.163:27017/kaleido?authSource=kaleido',
      NEXT_PUBLIC_API_URL: 'https://kaleidofinance.xyz',
      NEXT_PUBLIC_APP_URL: 'https://kaleidofinance.xyz',
      HOST: 'kaleidofinance.xyz',
      MAX_MEMORY_MB: '16384',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '500'
    },
    exec_mode: 'cluster',
    instances: 'max',
    watch: false,
    max_memory_restart: '3G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    time: true,
    kill_timeout: 30000,
    autorestart: true,
    exp_backoff_restart_delay: 1000,
    max_restarts: 5,
    max_restart_delay: 5000,
    vizion: false,
    pmx: false,
    post_update: ['npm install'],
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }],

  deploy: {
    production: {
      user: 'user',
      host: 'vps.kaleidofinance.xyz',
      ref: 'origin/main',
      repo: 'git@github.com:kaleidofinance/kalaido-landing.git',
      path: '/home/kaleido/htdocs/kaleidofinance.xyz',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
