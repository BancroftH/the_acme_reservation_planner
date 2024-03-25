require('dotenv').config();
const apiRouter = require('../api');
const express = require('express');
const { initTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservation, destroyReservation, seed } = require('./db');

const app = express();
app.use(express.json());

// Initialize database tables
initTables().then(() => {
  console.log('Database tables created');
  seed().then(() => {
    console.log('Dummy data seeded into the database');
  }).catch(error => {
    console.error('Error seeding dummy data:', error);
  });
}).catch(error => {
  console.error('Error creating database tables:', error);
});

// Endpoint to fetch customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await fetchReservations();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create a reservation for a customer
app.post('/api/customers/:id/reservations', async (req, res) => {
  const { id } = req.params; // Extract customer ID from URL parameters
  const { restaurant_id, date, party_count } = req.body;

  try {
    const reservation = await createReservation({ date, party_count, restaurant_id, customer_id: id });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create a new customer
app.post('/api/customers', async (req, res) => {
  const { name } = req.body;

  try {
    const customer = await createCustomer(name);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create a new restaurant
app.post('/api/restaurants', async (req, res) => {
  const { name } = req.body;

  try {
    const restaurant = await createRestaurant(name);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to delete a reservation
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res) => {
  const { customer_id, id } = req.params; // Extract customer ID and reservation ID from URL parameters

  try {
    await destroyReservation(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('/api', apiRouter);