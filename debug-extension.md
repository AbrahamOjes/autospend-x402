# 🔍 Chrome Extension Debug Checklist

## Issue: Content Script Not Injecting
- Background messaging works ✅
- Content script messaging fails ❌ ("Receiving end does not exist")
- Even ultra-simple content script fails to inject

## Debug Steps:

### 1. Check Extension Loading Status
1. Go to `chrome://extensions/`
2. Find "Autospend - X402 Payment Extension"
3. Check for any **red error messages** or warnings
4. Verify extension is **enabled** (toggle switch is ON)
5. Note the **Extension ID** (long string like `abcdef123456...`)

### 2. Force Complete Reload
1. Click **"Remove"** button to completely uninstall extension
2. Click **"Load unpacked"** and select the project folder again
3. Check for any loading errors

### 3. Check Extension Console
1. Click **"Inspect views: background page"** (if available)
2. Look for any errors in the background script console
3. Check if background script is running properly

### 4. Check Content Script Injection
1. Visit: http://localhost:9000/test-pages/x402-test.html
2. Open Developer Tools (F12)
3. Go to **Sources** tab
4. Look for **Content Scripts** section in left sidebar
5. Should see `test-content-simple.js` listed there
6. If not listed, content script is not being injected

### 5. Check Console for Errors
1. In page console, look for:
   - "🔥 SIMPLE TEST: Content script is loading..."
   - Any JavaScript errors
   - CSP violations
   - Extension loading errors

### 6. Test Different Pages
1. Try on `https://google.com` (different domain)
2. Try on `chrome://newtab/` (if allowed)
3. See if content script injects on other pages

### 7. Check File Permissions
1. Verify all files exist in project directory
2. Check file permissions (should be readable)
3. Verify no syntax errors in JavaScript files

## Expected Results:
- Extension loads without errors
- Content script appears in Sources tab
- Red indicator box appears on page
- Console shows "🔥 SIMPLE TEST" messages

## If Still Failing:
- Try creating minimal manifest with just content script
- Test with different Chrome profile
- Check Chrome version compatibility
- Verify no conflicting extensions
