// Centralized error handler
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Erreur serveur";
  res.status(status).json({ message });
};

