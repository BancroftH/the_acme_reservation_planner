const router = require("express").Router();
const { fetchCustomers, destroyReservation, createReservation } = require("../../server/db");

router.get("/", async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.status(200).send(customers);
  } catch (error) {
    next(error);
  }
});

router.delete("/:customer_id/:reservations/:id", async (req, res, next) => {
  try {
    await destroyReservation({
      customer_id: req.params.customer_id,
      id: req.params.id,
    });
    res.status(204);
  } catch (error) {
    next(error);
  }
});

router.post("/:customer_id/:reservations", async (req, res, next) => {
  try {
    const reservation = await createReservation({
      customer_id: req.params.customer_id,
      party_count: req.body.party_count,
      restaurant_id: req.body.restaurant_id,
    });
    res.status(201).send(reservation);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
