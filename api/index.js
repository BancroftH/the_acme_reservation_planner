const router = require('express').Router();

router.use('/customers', require('./customers')); 
router.use('/reservations', require('./reservations'));
router.use('/restaurants', require('./restaurants'));

module.exports = router;