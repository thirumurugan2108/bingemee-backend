const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    otp: {
      type: String,
      default: '',
    },
    otpSentTime: {
      type: String,
      default: '',
    },
    mobile: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    photoUrl: {
      type: String,
      default:'https://bingmee1.s3.ap-south-1.amazonaws.com/profile/defaultprof.jpg'
    },
    total: {
      type: Number,
      default:0,
    },
    paid: {
      type: Number,
      default:0,
    },
    balance: {
      type: Number,
      default:0,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if username is taken
 * @param {string} username 
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
 userSchema.statics.isUserNameTaken = async function (name, excludeUserId) {
  const user = await this.findOne({ name: name, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.updateOtp = async function (email, otp) {
  const user = await this.findOne({ email });
  const result = await User.updateOne({ email} , { otp, otpSentTime: Date.now() });
  return user
}

userSchema.statics.validateOtp = async function (email, otp, type) {
  const user = await this.findOne({ email, otp });
  if (user && type =='signup') {
    const result = await User.updateOne({ email} , { otp: '', otpSentTime: '', isEmailVerified: true});
  }
  else {
    const result = await User.updateOne({email} , { otp: '', otpSentTime: '' });
  }
  return user
}

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
