const config = new Config();

var supabase = supabase.createClient(config.supabaseURI, config.supabaseKey);
console.log('supabase: ', supabase);