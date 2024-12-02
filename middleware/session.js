const sessionMiddleware = (req, res, next) => {
    // Vérifier si la session existe et a une dernière activité
    if (req.session && req.session.lastActivity) {
        const currentTime = Date.now();
        const lastActivity = req.session.lastActivity;
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 heures

        // Si la session a expiré
        if (currentTime - lastActivity > sessionTimeout) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la destruction de la session expirée:', err);
                }
            });
            
            // Supprimer les cookies
            res.clearCookie('token');
            res.clearCookie('sessionId');
            
            return res.status(401).json({
                status: 'error',
                message: 'Session expirée, veuillez vous reconnecter'
            });
        }

        // Mettre à jour le timestamp de dernière activité
        req.session.lastActivity = currentTime;
    }

    next();
};

module.exports = sessionMiddleware;
