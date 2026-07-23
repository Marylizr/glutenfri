const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    savedEstablishments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' }],
    // GDPR: consentimiento explícito al registrarse. Si la política cambia
    // en el futuro, comparar contra la fecha de esta política para saber a
    // quién hay que volver a pedirle consentimiento.
    privacyAcceptedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
