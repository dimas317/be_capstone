import pool from '../config/db.js';

export async function stats(req, res, next) {
  try {
    // Debug: Cek req.user
    console.log('=== Stats Debug Start ===');
    console.log('req.user:', JSON.stringify(req.user, null, 2));
    console.log('req.user.id type:', typeof req.user.id);
    
    const userId = req.user.id;
    console.log('userId:', userId);
    
    // Test query sederhana dulu
    const testQuery = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'expense']
    );
    console.log('Test count expenses:', testQuery.rows[0].count);
    
    // Query utama dengan explicit column names
    const result = await pool.query(
      `SELECT 
         c.id as category_id,
         c.name AS category, 
         SUM(t.amount)::numeric AS total,
         COUNT(t.id) as transaction_count
       FROM transactions t
       INNER JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1 AND t.type = $2
       GROUP BY c.id, c.name
       ORDER BY c.name`,
      [userId, 'expense']
    );

    console.log('Query executed');
    console.log('Rows count:', result.rows.length);
    console.log('Raw result.rows:', JSON.stringify(result.rows, null, 2));

    // Periksa setiap row
    result.rows.forEach((row, index) => {
      console.log(`Row ${index}:`, {
        category_id: row.category_id,
        category: row.category,
        total: row.total,
        transaction_count: row.transaction_count
      });
    });

    // Cek apakah ada hasil
    if (!result.rows || result.rows.length === 0) {
      console.log('No data found, returning empty array');
      return res.json({ byCategory: [] });
    }

    // Format data
    const formatted = result.rows.map(row => ({
      name: String(row.category),
      value: Number(row.total)
    }));

    console.log('Formatted data:', JSON.stringify(formatted, null, 2));
    console.log('=== Stats Debug End ===');

    return res.json({ byCategory: formatted });
    
  } catch (err) {
    console.error('=== Stats Error ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    console.error('=== End Error ===');
    
    return res.status(500).json({ 
      message: 'Error fetching stats', 
      error: err.message,
      details: err.code
    });
  }
}