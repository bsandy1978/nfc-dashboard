const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');

// @route   POST api/profiles
// @desc    Create a new profile
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, bio, location, website, social } = req.body;

    // Check if profile already exists for this user
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      return res.status(400).json({ msg: 'Profile already exists' });
    }

    // Create new profile
    profile = new Profile({
      user: req.user.id,
      name,
      bio,
      location,
      website,
      social,
      ownerEmail: req.user.email
    });

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profiles/:slug
// @desc    Get profile by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const profile = await Profile.findOne({ slug: req.params.slug });
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // If profile is private and user is not the owner, return 403
    if (!profile.isPublic && (!req.user || req.user.id !== profile.user.toString())) {
      return res.status(403).json({ msg: 'Profile is private' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profiles/:id
// @desc    Update profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // Check if user owns the profile
    if (profile.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { name, bio, location, website, social, isPublic } = req.body;

    // Update profile
    if (name) profile.name = name;
    if (bio) profile.bio = bio;
    if (location) profile.location = location;
    if (website) profile.website = website;
    if (social) profile.social = social;
    if (typeof isPublic === 'boolean') profile.isPublic = isPublic;

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profiles/:id/claim
// @desc    Claim a profile
// @access  Private
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // Check if profile is already claimed
    if (profile.ownerEmail) {
      return res.status(400).json({ msg: 'Profile already claimed' });
    }

    // Update profile with owner information
    profile.ownerEmail = req.user.email;
    profile.user = req.user.id;
    profile.claimedAt = Date.now();

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 