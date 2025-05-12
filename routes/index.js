import authRoutes from "./auth.js"
import studySpotsRoutes from "./studySpots.js"
import userRoutes from "./users.js"
import commentRoutes from "./comments.js"
import reviewRoutes from "./reviews.js"
import forumPostsRoutes from "./forumPosts.js"

const constructorMethod = (app) => {
	app.use('/', authRoutes);
	app.use('/', studySpotsRoutes);
	app.use('/', userRoutes);
	app.use('/comments', commentRoutes);
	app.use('/reviews', reviewRoutes);
	app.use('/forums', forumPostsRoutes);
	app.use('*', (req, res) => {
		return res.status(404).json({error: 'Not found'});
	});
};
  
export default constructorMethod;