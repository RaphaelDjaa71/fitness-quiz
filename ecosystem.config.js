module.exports = {
    apps: [{
        name: "fitness-quiz",
        script: "./server.js",
        env_production: {
            NODE_ENV: "production",
            PORT: 3000
        },
        env_development: {
            NODE_ENV: "development",
            PORT: 3000
        },
        watch: false,
        max_memory_restart: "500M",
        instances: "max",
        exec_mode: "cluster"
    }]
};
