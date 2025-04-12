const authRoutes = require('./routes/api/auth');
const profileRoutes = require('./routes/api/profiles');

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes); 