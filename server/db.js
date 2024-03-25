const pg = require('pg');
const uuid = require('uuid');

// Initialize the PostgreSQL client
const client = new pg.Client(`postgres://localhost/${process.env.DB_NAME}`);

// Function to initialize tables
const initTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS restaurants;
    DROP TABLE IF EXISTS customers;

    CREATE TABLE customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE restaurants (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE reservations (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL
    );
  `;

  await client.query(SQL);
};

// Function to create a customer
const createCustomer = async (name) => {
  const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
  `;
  const { rows } = await client.query(SQL, [uuid.v4(), name]);
  return rows[0];
};

// Function to create a restaurant
const createRestaurant = async (name) => {
  const SQL = `
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
  `;
  const { rows } = await client.query(SQL, [uuid.v4(), name]);
  return rows[0];
};

// Function to create a reservation
const createReservation = async ({ date, party_count, restaurant_id, customer_id }) => {
  const SQL = `
    INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id) VALUES($1, $2, $3, $4, $5) RETURNING *
  `;
  const { rows } = await client.query(SQL, [uuid.v4(), date, party_count, restaurant_id, customer_id]);
  return rows[0];
};

// Function to fetch customers
const fetchCustomers = async () => {
  const SQL = `SELECT * FROM customers`;
  const { rows } = await client.query(SQL);
  return rows;
};

// Function to fetch restaurants
const fetchRestaurants = async () => {
  const SQL = `SELECT * FROM restaurants`;
  const { rows } = await client.query(SQL);
  return rows;
};

// Function to fetch reservations
const fetchReservations = async () => {
  const SQL = `SELECT * FROM reservations`;
  const { rows } = await client.query(SQL);
  return rows;
};

// Function to delete a reservation
const destroyReservation = async (reservation_id) => {
  const SQL = `DELETE FROM reservations WHERE id = $1`;
  await client.query(SQL, [reservation_id]);
};

const seed = async () => {
  await Promise.all([
    createCustomer({name: 'Kyle'}),
    createCustomer({name: 'Muhammed'}),
    createCustomer({name: 'Alex'}),
    createCustomer({name: 'Gabriella'}),
    createRestaurant({name: 'The Lodge'}),
    createRestaurant({name: 'Orsay'}),
    createRestaurant({name: 'Hells Kitchen'}),
    createRestaurant({name: 'Black Sheep'}),
  ]);

  console.log('Customers created: ', await fetchCustomers()); 
  const customers = await fetchCustomers(); 
  console.log('Restaurants created: ', await fetchRestaurants()); 
  const restaurants = await fetchRestaurants();

  await Promise.all([
    createReservation({
      customer_id: customers[0].id,
      restaurant_id: restaurants[3].id,
      party_count: 3
    }),
    createReservation({
      customer_id: customers[2].id,
      restaurant_id: restaurants[1].id,
      party_count: 8
    }),
    createReservation({
      customer_id: customers[3].id,
      restaurant_id: restaurants[0].id,
      party_count: 4
    }),
    createReservation({
      customer_id: customers[1].id,
      restaurant_id: restaurants[2].id,
      party_count: 2
    }),
  ]);
  console.log("Reservations created: ", await fetchReservations())
};

// Export the functions and client
module.exports = {
  client,
  initTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
  seed
};