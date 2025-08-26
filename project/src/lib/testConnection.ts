import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "users" does not exist. You need to run the SQL setup first.');
        return {
          success: false,
          message: 'Database tables not found. Please run the SQL setup in your Supabase dashboard.',
          error: error
        };
      }
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        message: 'Connection failed: ' + error.message,
        error: error
      };
    }
    
    console.log('✅ Supabase connection successful!');
    return {
      success: true,
      message: 'Connection successful!',
      data: data
    };
    
  } catch (error) {
    console.error('❌ Unexpected connection error:', error);
    return {
      success: false,
      message: 'Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      error: error
    };
  }
}

export async function testTableExists(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    return { exists: !error, error };
  } catch (error) {
    return { exists: false, error };
  }
}

export async function runDiagnostics() {
  console.log('🔍 Running Supabase diagnostics...');
  
  const tables = ['users', 'tank_settings', 'tank_data', 'fluid_database'];
  const results: Record<string, any> = {};
  
  for (const table of tables) {
    const result = await testTableExists(table);
    results[table] = result;
    console.log(`${result.exists ? '✅' : '❌'} Table "${table}": ${result.exists ? 'EXISTS' : 'NOT FOUND'}`);
  }
  
  return results;
}
