import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) throw new Error('Missing Supabase key') 
console.log("Clé Supabase:", process.env.SUPABASE_KEY)
   
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase


async function testConnection() {
  const { data, error } = await supabase.from('courses').select('*')

  if (error) {
    console.error("Erreur Supabase ❌", error)
  } else {
    console.log("Connexion Supabase réussie ✅", data)
  }
}

testConnection()
