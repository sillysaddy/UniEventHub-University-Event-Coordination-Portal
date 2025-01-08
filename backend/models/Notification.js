import mongoose from "mongoose";

// Schema for Notification
/**
 * Notification Schema
 * 
 * This schema defines the structure of a notification document in the database.
 * 
 * @property {String} title - The title of the notification. It is required and trimmed.
 * @property {String} message - The message content of the notification. It is required.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The user who created the notification. It references the User model and is required.
 * @property {String} type - The type of notification. It can be 'announcement', 'alert', or 'update'. The default value is 'announcement'.
 * @property {Array} isRead - An array of objects containing user and readAt properties. Each object represents a user who has read the notification and the date when it was read.
 * @property {mongoose.Schema.Types.ObjectId} isRead.user - The user who read the notification. It references the User model.
 * @property {Date} isRead.readAt - The date when the notification was read. The default value is the current date.
 * @property {Date} createdAt - The date when the notification was created. The default value is the current date.
 */
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'alert', 'update'], // enum is used to restrict the value to one of the specified values
    default: 'announcement' // Default value
  },
  isRead: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;