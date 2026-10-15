const express = require('express');
const router = express.Router();

const { pharmacyCreate, getAllhospitalpharmacies, updatePharmacy, deletePharmacy } = require('../controllers/pharmacyController');

router.post('/create', pharmacyCreate);
router.post('/all', getAllhospitalpharmacies);
router.post('/update', updatePharmacy);
router.post('/delete', deletePharmacy);

module.exports = router;

