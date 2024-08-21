const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');

const createUser = async (userData) => {
  const { name, email, password, role, tenant_id } = userData;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      { name, email, password: hashedPassword, role, tenant_id }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getUsers = async (tenantId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('tenant_id', tenantId);
  return data;
};

module.exports = {
  createUser,
  getUsers,
};