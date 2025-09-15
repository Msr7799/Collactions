# Security and Performance Improvements

## 🛡️ Rate Limiting

The image generation API now includes rate limiting to prevent abuse and ensure fair usage:

### Limits
- **Image Generation**: 5 requests per minute per client IP
- **Prompt Enhancement**: 20 requests per minute per client IP (more lenient for text operations)

### Implementation
- Uses in-memory rate limiting with automatic cleanup
- Client identification based on IP address with fallbacks for proxy/CDN scenarios
- Returns appropriate HTTP 429 status codes with retry-after headers

### Response Headers
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (on 429 responses)

## 🚀 Caching

Implemented caching headers for better performance:

### Static Images
- **Generated Images** (`/generated/*`): 24 hours cache with immutable flag
- **Cache-Control**: `public, max-age=86400, s-maxage=86400, immutable`
- **Security**: Added `X-Content-Type-Options: nosniff` header

### API Responses
- **Image Generation**: 24 hours cache for successful generations
- **Text Enhancement**: No cache for dynamic text responses
- **Error Responses**: No cache to prevent caching temporary errors

## 📁 File Structure

```
src/
├── utils/
│   └── rateLimiter.ts          # Rate limiting utility
├── app/api/generate-image/
│   └── route.ts                # Updated with rate limiting and caching
└── middleware.ts               # Next.js middleware for static file caching
```

## 🔧 Configuration

### Rate Limiter Settings
- Window: 60 seconds (1 minute)
- Cleanup interval: 5 minutes
- Memory-based (resets on server restart)

### Cache Settings
- Max age: 86400 seconds (24 hours)
- Public caching allowed
- CDN/proxy cache: 24 hours

## 🚨 Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Error message in English | رسالة الخطأ بالعربية"
}
```

Rate limit errors include additional headers for client handling.

## 📊 Monitoring

The implementation includes console logging for:
- Rate limit violations with client IDs
- Image generation success/failure
- Cache hits and performance metrics

## 🔄 Production Considerations

For production deployment, consider:
1. **Redis-based rate limiting** for multi-server deployments
2. **CDN integration** for global image caching
3. **Image compression** and WebP support
4. **Database logging** for rate limit analytics
5. **IP whitelisting** for trusted clients
