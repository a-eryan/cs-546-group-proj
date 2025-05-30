import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
import configRoutes from './routes/index.js';

const app = express();

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
	session({
		name: 'AuthenticationState',
		secret: "some secret string!",
		saveUninitialized: false,
		resave: false,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 2  // 2 hours
		}
	})
);

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    res.locals.isSignedIn = true;
  } else {
    res.locals.isSignedIn = false;
  }
  next();
});

// Create the handlebars instance with helpers
const hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		includes: function (value, array) {
			return Array.isArray(array) && array.includes(value);
		},
		isEqual: function (value1, value2) {
			return value1 === value2;
		},
		join: function(array, separator) {
			if (Array.isArray(array)) {
				return array.join(separator || ', ');
			}
			return '';
		}
	}
});

// Use the configured instance
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
	res.redirect('/login');
});

configRoutes(app);

app.listen(3000, () => {
	console.log("We've now got a server!");
	console.log('Your routes will be running on http://localhost:3000');
})