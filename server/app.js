const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/auth/authRoutes');
const propertyRoutes = require('./src/properties/propertyRoutes');
const roomRoutes = require('./src/rooms/roomRoutes');
const bedRoutes = require('./src/beds/bedRoutes');
const tenancyRoutes = require('./src/tenancies/tenancyRoutes');
const billRoutes = require('./src/bills/billRoutes');
const paymentRoutes = require('./src/payments/paymentRoutes');
const ratingRoutes = require('./src/ratings/ratingRoutes');
const searchRoutes = require('./src/search/searchRoutes');
const renterRoutes = require('./src/renter/renterRoutes');

const app = express();

/**
 * CORS — by default, allow only PUBLIC_APP_URL in production. In dev, allow
 * everything. Set CORS_ORIGIN=* if you really want a permanently-open API.
 */
const allowedOrigin =
  process.env.CORS_ORIGIN ||
  (process.env.NODE_ENV === 'production' ? process.env.PUBLIC_APP_URL : true);

app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/auth', authRoutes);
app.use('/properties', propertyRoutes);
app.use('/properties', roomRoutes);
app.use('/properties', bedRoutes);
app.use('/tenancies', tenancyRoutes);
app.use('/bills', billRoutes);
app.use('/payments', paymentRoutes);
app.use('/ratings', ratingRoutes);
app.use('/search', searchRoutes);
app.use('/renter', renterRoutes);

// /health — also pinged every 5 min by UptimeRobot to keep the free Render
// dyno warm. Keep this cheap; do not hit the DB here.
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
