import authRoutes from "./auth.js"

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};
  
export default constructorMethod;