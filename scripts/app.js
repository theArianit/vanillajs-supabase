const config = new Config();

const supabase = supabase.createClient(config.supabaseURI, config.key);
console.log('supabase: ', supabase);