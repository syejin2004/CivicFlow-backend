const checkRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: '권한 없음' });
  }
};

module.exports = checkRole;