const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  social: {
    twitter: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/.test(v);
        },
        message: props => `${props.value} is not a valid Twitter URL!`
      }
    },
    facebook: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/.test(v);
        },
        message: props => `${props.value} is not a valid Facebook URL!`
      }
    },
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v);
        },
        message: props => `${props.value} is not a valid LinkedIn URL!`
      }
    },
    instagram: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(v);
        },
        message: props => `${props.value} is not a valid Instagram URL!`
      }
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  ownerEmail: {
    type: String,
    sparse: true,
    index: true
  },
  claimedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a unique slug before saving
ProfileSchema.pre('save', async function(next) {
  if (!this.isModified('slug')) {
    return next();
  }

  const baseSlug = this.slug || this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingProfile = await this.constructor.findOne({ slug });
    if (!existingProfile) {
      this.slug = slug;
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  next();
});

module.exports = mongoose.model('Profile', ProfileSchema); 