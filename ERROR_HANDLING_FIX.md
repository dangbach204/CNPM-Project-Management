# Error Handling Improvements - Join Project Feature

## Problem

The application was showing `Error response: {}` when trying to join a project, making it difficult to diagnose the root cause.

## Changes Made

### 1. Created Error Utility Module

**File:** [fe/lib/error-utils.ts](fe/lib/error-utils.ts)

Added comprehensive error handling utilities:

- `parseApiError()` - Categorizes errors into server/network/client types
- `getUserFriendlyMessage()` - Provides user-friendly error messages based on error type and status
- `logDetailedError()` - Logs errors with detailed debugging information

### 2. Updated Student Service

**File:** [fe/service/student-service.ts](fe/service/student-service.ts)

Improved error logging in `joinProject()`:

- Now uses `logDetailedError()` for structured error logging
- Provides detailed context including the projectId
- Better categorization of error types (server/network/client)

### 3. Enhanced Hook Error Handling

**File:** [fe/hooks/useStudentProjects.ts](fe/hooks/useStudentProjects.ts)

Improved `handleJoinProject()`:

- Uses `parseApiError()` for consistent error parsing
- Uses `getUserFriendlyMessage()` for better user feedback
- Simplified error handling logic
- Maintains special handling for "already joined" error case

## Error Types Now Handled

### 1. **Server Errors** (Error response received)

- **400 Bad Request**: Already joined another project, project full, invalid request
- **401 Unauthorized**: Session expired
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Project doesn't exist
- **500 Server Error**: Internal server error

### 2. **Network Errors** (No response received)

- Connection timeout
- Server not reachable
- CORS issues
- DNS resolution failures

### 3. **Client Errors** (Request setup failed)

- Invalid request configuration
- Interceptor errors

## Debugging the Original Error

The `Error response: {}` error suggests one of these scenarios:

### Most Likely Causes:

1. **Backend Server Not Running**

   ```bash
   # Check if backend is running on http://localhost:5000
   # Start backend if needed:
   cd be
   npm run dev
   ```

2. **Network/CORS Issue**

   - Check browser console for CORS errors
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend CORS is configured for your frontend URL

3. **Authentication Issue**
   - Token might be expired or invalid
   - Check if user is properly logged in
   - Verify cookies contain `accessToken` and `refreshToken`

### How to Debug Further

With the new error logging, check the console for:

```
❌ Error in joinProject
Type: [server|network|client|unknown]
Status: [HTTP status code if applicable]
Message: [Error message]
Details: [Additional error details]
Additional Info: { projectId: [id] }
Full Error: [Complete error object]
```

This will tell you exactly what type of error occurred.

## Testing Scenarios

1. **Test with backend running**: Should work normally
2. **Test with backend stopped**: Should show "Không thể kết nối đến máy chủ"
3. **Test with invalid token**: Should redirect to login (handled by axios interceptor)
4. **Test joining when already in project**: Should show special dialog with current project name
5. **Test joining full project**: Should show "Đề tài đã đủ số lượng sinh viên"

## Next Steps

1. **Try to reproduce the error** - The new logging will show exactly what's happening
2. **Check backend logs** - See if request reaches the backend
3. **Verify environment variables** - Ensure `NEXT_PUBLIC_API_URL` is correct
4. **Test network connectivity** - Ensure backend is accessible from frontend

## Additional Recommendations

### Add Request/Response Logging (Optional)

If you need more debugging info, add this to [fe/config/axios.ts](fe/config/axios.ts):

```typescript
// Add after line 78 (in request interceptor)
console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
  headers: config.headers,
  data: config.data,
});

// Add at line 94 (in response interceptor success)
console.log(`[API Response] ${response.config.url}`, {
  status: response.status,
  data: response.data,
});
```

### Backend Health Check

Add a health check endpoint to verify backend is running:

```typescript
// In be/src/app.ts
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

Then test: `curl http://localhost:5000/api/health`

## Files Modified

1. ✅ [fe/lib/error-utils.ts](fe/lib/error-utils.ts) - Created
2. ✅ [fe/service/student-service.ts](fe/service/student-service.ts) - Updated
3. ✅ [fe/hooks/useStudentProjects.ts](fe/hooks/useStudentProjects.ts) - Updated
