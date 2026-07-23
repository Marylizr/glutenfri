const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    savedEstablishments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
