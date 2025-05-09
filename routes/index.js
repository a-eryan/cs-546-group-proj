import authRoutes from "./auth.js"
import studySpotsRoutes from "./studySpots.js"
import userRoutes from "./users.js"

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/', studySpotsRoutes);
    app.use('/', userRoutes);
    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};
  
export default constructorMethod;