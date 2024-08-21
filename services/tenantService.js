// services/tenantService.js
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');

const registerTenant = async (tenantData) => {
  const { name, contact_email, contact_phone, website, email, password } = tenantData;
  console.log(tenantData);
  try {
    // Start a Supabase transaction
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        { name, contact_email, contact_phone, website }
      ])
      .select()
      .single();

    if (tenantError) throw tenantError;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        { name, email, password: hashedPassword, role: 'tenant_admin', tenant_id: tenant.id }
      ])
      .select()
      .single();

    if (userError) {
      // If user creation fails, we should delete the tenant we just created
      await supabase.from('tenants').delete().match({ id: tenant.id });
      throw userError;
    }

    return { tenant, user };
  } catch (error) {
    console.error('Error in registerTenant:', error);
    throw error;
  }
};

const getTenantData = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  registerTenant,
  getTenantData,
};