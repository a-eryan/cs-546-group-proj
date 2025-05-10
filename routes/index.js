import authRoutes from "./auth.js"
import forumPostsRoutes from "./forumPosts.js"

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/forums', forumPostsRoutes);
    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};
  
export default constructorMethod;