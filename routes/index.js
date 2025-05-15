import authRoutes from './auth.js';
import studySpotsRoutes from './studySpots.js';
import userRoutes from './users.js';
import commentRoutes from './comments.js';
import reviewRoutes from './reviews.js';
import forumPostsRoutes from './forumPosts.js';
import reportRoutes from './reports.js';

const routes = (app) => {
	app.use('/', authRoutes);
	app.use('/studyspots', studySpotsRoutes);
	app.use('/profile', userRoutes);
	app.use('/comments', commentRoutes);
	app.use('/reviews', reviewRoutes);
	app.use('/forums', forumPostsRoutes);
<<<<<<< HEAD
	app.use('/reports', reportRoutes);
=======
	app.use(./reviewComments.js);
>>>>>>> 3532626 (feat: begins implmentation of reviewComments; adds helper and addCommentToReview function; creates reviewComments route)
	app.use('*', (req, res) => {
		return res.status(404).json({ error: "Not found" });
	});
};
  
export default routes;