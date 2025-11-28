module.exports = function(roles = []){
  return (req, res, next) => {
    if (!Array.isArray(roles)) roles = [roles];
    const role = req.user.user_role; // 0 学生,1 教师,2 企业用户,3 管理员
    if (roles.length && !roles.includes(role)) return res.status(403).json({ message: '权限不足' });
    next();
  }
}
