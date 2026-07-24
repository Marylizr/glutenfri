function validateRuntimeEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres.');
  }
  if (/cambia-esto|ejemplo|placeholder/i.test(process.env.JWT_SECRET)) {
    throw new Error('JWT_SECRET conserva un valor de ejemplo y debe rotarse.');
  }
}

module.exports = { validateRuntimeEnv };
