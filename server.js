const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./db');

const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } 
  }));
  
     
const authRoutes = require('./routes/auth');
const branchesRoutes = require('./routes/branches');
const creditsRoutes = require('./routes/credits');
const pricingRoutes = require('./routes/pricing');
const produceRoutes = require('./routes/produce');
const reportsRoutes = require('./routes/reports');
const salesRoutes = require('./routes/sales');
const stockRoutes = require('./routes/stock');



app.use(cors());
app.use(express.json()); 

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock', stockRoutes);

// app.use((req, res, next) => {
//     res.status(404).send('Oops!! Error 404 - Page Not Found');
// });


app.listen(8000, () => console.log('Server started on port 8000'));