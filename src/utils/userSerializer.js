const SENSITIVE_FIELDS = ['password_hash', 'password'];

function toPlainObject(user) {
  if (!user) return null;
  if (typeof user.toJSON === 'function') return user.toJSON();
  if (typeof user.get === 'function') return user.get({ plain: true });
  if (typeof user === 'object') return { ...user };
  return user;
}

function omitSensitiveFields(plainUser) {
  if (!plainUser || typeof plainUser !== 'object') return plainUser;
  const safeUser = { ...plainUser };
  SENSITIVE_FIELDS.forEach((field) => {
    if (field in safeUser) delete safeUser[field];
  });
  return safeUser;
}

function extractDeptName(remark) {
  if (!remark) return null;
  try {
    const obj = JSON.parse(remark);
    if (obj && typeof obj === 'object' && obj.dept_name) {
      return obj.dept_name;
    }
  } catch (e) {
    // ignore JSON parse error, treat as无结构备注
  }
  return null;
}

function toPublicUser(user) {
  const plain = toPlainObject(user);
  const safe = omitSensitiveFields(plain);

  // 从 remark 中尽力解析出 dept_name，便于前端展示“专业/班级名称”
  const deptNameFromRemark = extractDeptName(plain && plain.remark);
  if (deptNameFromRemark && !safe.dept_name) {
    safe.dept_name = deptNameFromRemark;
  }

  return safe;
}

function toAuthUser(user) {
  const safe = toPublicUser(user) || {};
  return {
    id: safe.id,
    username: safe.username,
    nickname: safe.nickname,
    user_role: safe.user_role,
    dept_id: safe.dept_id || null,
    dept_name: safe.dept_name || null
  };
}

module.exports = { toPublicUser, toAuthUser };


