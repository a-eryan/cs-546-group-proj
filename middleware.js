export const isAuthenticated = (req, res, next) => {
	if (!req.session.user)
		return res.status(401).json({ error: "You must be logged in to do this" });

	next();
};

export function requireAuth(req, res, next) {
	if (!req.session.user)
	  return res.redirect('/login');
  
	res.set('Cache-Control', 'no-store');
	res.set('Pragma', 'no-cache');
	res.set('Expires', '0');
  
	next();
};