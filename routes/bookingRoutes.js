import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to determine cost based on service type
const calculateCost = (serviceType) => {
  switch (serviceType) {
    case 'Hospital Visit Assistance':
      return 45.00;
    case 'Medicine Management':
      return 30.00;
    case 'Routine Checkup':
      return 25.00;
    default:
      return 40.00;
  }
};

// @desc    Get all available caretakers list
// @route   GET /api/bookings/caretakers/available
// @access  Private (accessible by parents when booking)
router.get('/caretakers/available', protect, async (req, res) => {
  try {
    const caretakers = await User.find({ role: 'caretaker', isAvailable: true })
      .select('name phone email')
      .sort({ name: 1 });
    res.json(caretakers);
  } catch (error) {
    console.error('Fetch available caretakers error:', error);
    res.status(500).json({ message: 'Server error fetching available caretakers list' });
  }
});

// @desc    Create a new booking (Parent customer selects caretaker or auto-assigns)
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { serviceType, location, date, time, caretakerId: selectedCaretakerId } = req.body;

    if (!serviceType || !location || !date || !time) {
      return res.status(400).json({ message: 'Please provide all booking fields: serviceType, location, date, time' });
    }

    const estimatedCost = calculateCost(serviceType);

    let caretakerId = null;
    let caretakerName = 'Pending caretaker assignment';
    let status = 'pending';

    // If customer selected a specific caretaker
    if (selectedCaretakerId) {
      const chosenCaretaker = await User.findOne({ _id: selectedCaretakerId, role: 'caretaker' });
      if (chosenCaretaker) {
        caretakerId = chosenCaretaker._id;
        caretakerName = chosenCaretaker.name;
        status = 'assigned';
      }
    } else {
      // Auto-assign first available caretaker
      const availableCaretaker = await User.findOne({ role: 'caretaker', isAvailable: true });
      if (availableCaretaker) {
        caretakerId = availableCaretaker._id;
        caretakerName = availableCaretaker.name;
        status = 'assigned';
      }
    }

    const booking = await Booking.create({
      userId: req.user._id,
      serviceType,
      location,
      date,
      time,
      estimatedCost,
      status,
      caretakerId,
      caretakerName,
    });

    if (caretakerId) {
      await booking.populate('caretakerId', 'name phone email');
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
});

// @desc    Get parent bookings (Parent customer)
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('caretakerId', 'name phone email')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// @desc    Get caretaker jobs (Caretaker employee)
// @route   GET /api/bookings/caretaker
// @access  Private
router.get('/caretaker', protect, async (req, res) => {
  try {
    if (req.user.role !== 'caretaker') {
      return res.status(403).json({ message: 'Caretaker authorization required' });
    }

    // Filter out cancelled bookings so they do not show in active caretaker timeline/jobs
    const bookings = await Booking.find({ 
      caretakerId: req.user._id,
      status: { $ne: 'cancelled' }
    })
      .populate('userId', 'name phone email')
      .sort({ date: 1 });
      
    res.json(bookings);
  } catch (error) {
    console.error('Fetch caretaker bookings error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// @desc    Submit prescription and complete booking (Caretaker employee)
// @route   PUT /api/bookings/:id/complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    if (req.user.role !== 'caretaker') {
      return res.status(403).json({ message: 'Caretaker authorization required' });
    }

    const { prescriptionText, visitSummary } = req.body;
    if (!prescriptionText && !visitSummary) {
      return res.status(400).json({ message: 'Please provide prescription text or visit summary notes' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify booking is assigned to this caretaker
    if (booking.caretakerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this booking assignment' });
    }

    booking.status = 'completed';
    booking.prescriptionText = prescriptionText || booking.prescriptionText;
    booking.visitSummary = visitSummary || booking.visitSummary;
    
    await booking.save();
    await booking.populate('userId', 'name phone email');

    res.json(booking);
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server error completing booking' });
  }
});

// @desc    Cancel a booking (Parent customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify that the booking belongs to the logged-in parent
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Make sure it is not already completed
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();
    
    if (booking.caretakerId) {
      await booking.populate('caretakerId', 'name phone email');
    }

    res.json(booking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

export default router;
