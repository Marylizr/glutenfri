const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    sessionVersion: { type: Number, default: 0, select: false },
    passwordResetHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    passwordResetRequestedAt: { type: Date, select: false },
    savedEstablishments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' }],
    blockedAuthors: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: undefined, select: false },
    // GDPR: consentimiento explícito al registrarse. Si la política cambia
    // en el futuro, comparar contra la fecha de esta política para saber a
    // quién hay que volver a pedirle consentimiento.
    privacyAcceptedAt: { type: Date, required: true },
    // Moderación: el primer admin se crea con `npm run set-admin`; desde
    // entonces los roles se gestionan en el panel protegido `/admin`.
    isAdmin: { type: Boolean, default: false },
    suspendedAt: { type: Date, default: null },
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, maxlength: 500, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
