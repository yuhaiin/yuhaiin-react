# Backend Authentication Changes

To fully enable the custom login page and prevent the browser's native login popup, you must apply the following changes to your Go backend.

## 1. Suppress Browser Login Popup

The browser popup is triggered by the `WWW-Authenticate` header with `Basic` realm. You must remove this header or rename it.

**Current Code:**
```go
if auth != nil {
    username, password, ok := r.BasicAuth()
    if !ok || !auth.Auth(password, username) {
        // This triggers the browser popup
        ow.Header().Set("WWW-Authenticate", `Basic realm="restricted", charset="UTF-8"`)
        http.Error(ow, "Unauthorized", http.StatusUnauthorized)
        return
    }
}
```

**Recommended Change:**
Remove the `WWW-Authenticate` header setting.

```go
if auth != nil {
    username, password, ok := r.BasicAuth()
    if !ok || !auth.Auth(password, username) {
        // Optional: Set a custom header if you want to indicate auth type without triggering popup
        // ow.Header().Set("X-WWW-Authenticate", `Basic realm="restricted", charset="UTF-8"`)

        http.Error(ow, "Unauthorized", http.StatusUnauthorized)
        return
    }
}
```

## 2. WebSocket Authentication

Standard WebSockets in browsers do not support custom headers (like `Authorization`). The frontend has been updated to send the Basic Auth token via a query parameter `token`.

You must update your authentication middleware to check for this query parameter if the standard header is missing.

**Example Implementation:**

```go
import (
    "encoding/base64"
    "net/http"
    "strings"
)

func AuthMiddleware(auth AuthProvider, next http.Handler) http.Handler {
    return http.HandlerFunc(func(ow http.ResponseWriter, r *http.Request) {
        if auth != nil {
            username, password, ok := r.BasicAuth()

            // Fallback: Check for "token" query parameter for WebSockets
            if !ok {
                token := r.URL.Query().Get("token")
                if token != "" {
                    // Token is base64 encoded "username:password"
                    data, err := base64.StdEncoding.DecodeString(token)
                    if err == nil {
                        parts := strings.SplitN(string(data), ":", 2)
                        if len(parts) == 2 {
                            username = parts[0]
                            password = parts[1]
                            ok = true
                        }
                    }
                }
            }

            if !ok || !auth.Auth(password, username) {
                // Do NOT set WWW-Authenticate header
                http.Error(ow, "Unauthorized", http.StatusUnauthorized)
                return
            }
        }
        next.ServeHTTP(ow, r)
    })
}
```
