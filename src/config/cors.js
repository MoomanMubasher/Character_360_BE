const allowedOrigins = [
	'http://localhost:5173',
	'http://localhost:5174',
	'https://cart360-fe.vercel.app',
	...(process.env.CLIENT_URL
		? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
		: []),
].filter(Boolean);

export const isOriginAllowed = (origin) => !origin || allowedOrigins.includes(origin);

export const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (mobile apps, curl, Postman)
		if (isOriginAllowed(origin)) return callback(null, true);
		return callback(new Error(`CORS: origin '${origin}' not allowed`));
	},
	credentials: true,
};

export const applyCorsHeaders = (req, res) => {
	const origin = req.headers.origin;

	if (isOriginAllowed(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin || '*');
		res.setHeader('Vary', 'Origin');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	}
};
