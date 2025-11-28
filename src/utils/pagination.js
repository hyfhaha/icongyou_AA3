module.exports = function(req) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 20;
  const offset = (page - 1) * pageSize;
  return { limit: pageSize, offset };
};
