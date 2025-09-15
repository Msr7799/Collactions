import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/tavily-search
 * بحث في الويب باستخدام Tavily API
 * Web search using Tavily API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, max_results = 5, include_images = false } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Query is required | طلب البحث مطلوب',
          message: 'Please provide a search query | يرجى تقديم نص للبحث'
        }, 
        { status: 400 }
      );
    }

    const tavilyApiKey = process.env.NEXT_PUBLIC_TAVILY_API;
    if (!tavilyApiKey) {
      return NextResponse.json(
        { 
          error: 'TAVILY_API_KEY not configured | مفتاح Tavily غير مُعدَّل',
          message: 'Tavily API key is not configured | مفتاح API لـ Tavily غير مُعدَّل'
        }, 
        { status: 500 }
      );
    }

    console.log(`Tavily search for: "${query}" with max_results: ${max_results}`);

    // Call Tavily API
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`
      },
      body: JSON.stringify({
        query: query.trim(),
        search_depth: 'basic',
        include_answer: true,
        include_images: include_images,
        include_raw_content: false,
        max_results: Math.min(max_results, 10),
        include_domains: [],
        exclude_domains: []
      })
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error('Tavily API error:', errorText);
      
      if (tavilyResponse.status === 401) {
        return NextResponse.json(
          { 
            error: 'Invalid Tavily API key | مفتاح Tavily غير صحيح',
            message: 'Please check your Tavily API key configuration | تحقق من إعداد مفتاح Tavily'
          }, 
          { status: 401 }
        );
      }
      
      if (tavilyResponse.status === 429) {
        return NextResponse.json(
          { 
            error: 'Tavily rate limit exceeded | تم تجاوز حد استخدام Tavily',
            message: 'Too many requests to Tavily API | طلبات كثيرة جداً لـ Tavily'
          }, 
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Tavily search failed | فشل البحث في Tavily',
          message: `Tavily API error: ${tavilyResponse.status} | خطأ في API: ${tavilyResponse.status}`
        }, 
        { status: tavilyResponse.status }
      );
    }

    const searchData = await tavilyResponse.json();

    // Format results
    const results = searchData.results?.map((result: any) => ({
      title: result.title || 'No title',
      url: result.url || '',
      content: result.content || result.snippet || 'No content available',
      score: result.score || 0,
      published_date: result.published_date || null,
      ...(result.image_url && { image_url: result.image_url })
    })) || [];

    return NextResponse.json({
      success: true,
      query: query.trim(),
      results: results,
      answer: searchData.answer || null,
      total_results: results.length,
      search_metadata: {
        provider: 'Tavily',
        search_time: new Date().toISOString(),
        include_images: include_images
      },
      message: 'Search completed successfully | تم البحث بنجاح'
    });

  } catch (error: any) {
    console.error('Error in Tavily search:', error);
    return NextResponse.json(
      {
        error: 'Internal server error | خطأ داخلي في الخادم',
        message: error.message || 'Unknown error occurred | حدث خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Tavily Search API endpoint. Use POST method with query parameter.',
    endpoints: {
      search: 'POST /api/tavily-search',
      parameters: {
        query: 'string (required)',
        max_results: 'number (optional, default: 5)',
        include_images: 'boolean (optional, default: false)'
      }
    }
  });
}
