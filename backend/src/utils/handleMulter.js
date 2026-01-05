export const handleMulter = (multerFunc) => {
  return (req, res, next) => {
    multerFunc(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};
