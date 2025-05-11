import authRoutes from "./auth.js"
import reviewRoutes from "./reviews.js"

const constructorMethod = (app) => {
    app.use('/', authRoutes);
		app.use('/reviews', reviewRoutes);
    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};
  
export default constructorMethod;