import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('photos')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
