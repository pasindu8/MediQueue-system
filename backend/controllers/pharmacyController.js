require('dotenv').config();
const doctor = require('../models/Doctor');
const hospital = require('../models/Hospital');
const clinic = require('../models/Clinic');
const admin = require('../models/Admin');
const pharmacy = require('../models/Pharmacy');
const asyncHandler = require('../middleware/asyncHandler');



const pharmacyCreate = asyncHandler(async (req, res) => {

    const { counter, staff, hospitalId, status } = req.body;
    
    if (!counter || !staff || !hospitalId || !status) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const adminExists = await admin.findOne({ StaffID: staff });

    if (!adminExists) {
        res.status(400);
        throw new Error('Admin with this ID does not exist');
    }
    
    const hospitalExists = await hospital.findOne({ _id: hospitalId });
    if (!hospitalExists) {
        res.status(400);
        throw new Error('Hospital with this ID does not exist');
    }

    const pha = await pharmacy.create({
        adminId: adminExists._id,
        counter,
        hospitalId,
        status
    });

    res.status(201).json({
        message: 'Pharmacy profile created successfully',
        pharmacyId: pha._id,
    });
});



const updatePharmacy = asyncHandler(async (req, res) => {
    const { pharmacyId, id, counter, staff, status } = req.body;
    const targetId = pharmacyId || id;

    if (!targetId) {
        res.status(400);
        throw new Error('Pharmacy ID is required');
    }

    const pha = await pharmacy.findById(targetId);
    if (!pha) {
        res.status(404);
        throw new Error('Pharmacy counter not found');
    }

    if (staff) {
        const adminExists = await admin.findOne({ StaffID: staff });
        if (!adminExists) {
            res.status(400);
            throw new Error('Admin with this Staff ID does not exist');
        }
        pha.adminId = adminExists._id;
    }

    if (counter !== undefined) pha.counter = counter;
    if (status !== undefined) pha.status = status;

    const updatedPha = await pha.save();
    const populated = await pharmacy.findById(updatedPha._id).populate('adminId');

    res.status(200).json({
        success: true,
        message: 'Pharmacy counter updated successfully',
        data: populated,
    });
});

const deletePharmacy = asyncHandler(async (req, res) => {
    const { pharmacyId, id } = req.body;
    const targetId = pharmacyId || id;

    if (!targetId) {
        res.status(400);
        throw new Error('Pharmacy ID is required');
    }

    const pha = await pharmacy.findById(targetId);
    if (!pha) {
        res.status(404);
        throw new Error('Pharmacy counter not found');
    }

    await pharmacy.findByIdAndDelete(targetId);

    res.status(200).json({
        success: true,
        message: 'Pharmacy counter deleted successfully',
    });
});

const getAllhospitalpharmacies = asyncHandler(async (req, res) => {
    const { hospitalId } = req.body;

    const pharmacies = await pharmacy.find({ hospitalId: hospitalId }).populate('adminId');

    res.status(200).json({
        success: true,
        pharmacies: pharmacies,
    });
});

module.exports = {
    pharmacyCreate,
    getAllhospitalpharmacies,
    updatePharmacy,
    deletePharmacy,
};