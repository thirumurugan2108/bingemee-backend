const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
mongoose.set('useFindAndModify', false);
const postSchema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uuid: {
      type:String,
      required: true,
    },
    isVideo :{
      type: Boolean,
      required: true
    },
    isPaid :{
      type: String,
      required: true,
      default:"Yes"
    },
    extensionName: {
      type:String,
      required: true,
    },
    albumFileNames: {
      type:String,
      required: false,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

/**
 * @typedef Post
 */
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
