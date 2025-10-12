# Telegram Mini App Moderation Checklist

## Overview
This checklist is designed to ensure your Telegram Mini App passes moderation successfully. Following these steps can reduce the rejection risk to less than 5% and help achieve approval within 1-3 days instead of 7-10.

## Pre-Submission Technical Requirements

### 1. Performance Metrics
- [ ] **Lighthouse Performance Score**: ≥ 90
- [ ] **TTFB (Time to First Byte)**: < 200 ms (test with `curl -w "@curl-format.txt" -s -o /dev/null https://your.app`)
- [ ] **Bundle Size**: First screen ≤ 170 KB gzipped (excluding images)
- [ ] **Load Time**: App loads completely within 3 seconds on 4G connection

### 2. Security Headers (CSP)
- [ ] **Content Security Policy**: No `'unsafe-inline'` or `'unsafe-eval'` in script-src
- [ ] **Connect-src**: Only `self` and `https://api.telegram.org`
- [ ] **External calls**: All external requests (e.g., RPC nodes) are proxied through your backend
- [ ] **No inline styles**: All CSS is in separate .css files (use `vite-plugin-css-injected-by-js` if needed)

### 3. Authentication Security
- [ ] **Auth Window**: `auth_date` is validated to be ≤ 30 minutes old on the server side
- [ ] **Bot Token**: `TELEGRAM_BOT_TOKEN` is stored only on the server, never in frontend code
- [ ] **Signature Verification**: Proper HMAC-SHA256 verification of Telegram auth data
- [ ] **No Client-Side Storage**: Sensitive tokens are not stored in localStorage/sessionStorage

### 4. UI/UX Compliance
- [ ] **No System Dialogs**: Replace all `alert()` and `confirm()` with custom components
- [ ] **Main Button Usage**: Only one primary CTA per screen uses the MainButton
- [ ] **Back Button**: Properly implemented with `onEvent('backButtonClicked', ...)` handler
- [ ] **Contrast Check**: Text has proper contrast against `themeParams.bg_color` (especially black backgrounds in dark mode)
- [ ] **Haptic Feedback**: Implemented for significant user interactions (player, purchase)

### 5. Asset Requirements
- [ ] **Logo**: 512×512 transparent PNG format
- [ ] **Icon**: 100×100 transparent PNG without text
- [ ] **Manifest.json**: Contains correct fields:
  ```json
  {
    "short_name": "normaldance",
    "scope": "./",
    "start_url": "./",
    "display": "standalone"
  }
  ```
- [ ] **No Service Worker**: If not critical for offline functionality, avoid `sw.js` to prevent moderation questions

### 6. Link Handling
- [ ] **External Links**: All external links open via `window.Telegram.WebApp.openLink()`
- [ ] **No Direct Navigation**: No `window.open()` or direct URL navigation to external sites
- [ ] **Deep Linking**: Properly implemented for internal navigation

### 7. Payment Integration
- [ ] **Stars Invoice**: Created via `/createInvoiceLink` API
- [ ] **Invoice Payload**: Format `nftId_userId_hash`
- [ ] **Payment Confirmation**: Waits for `web_app_invoice_closed` with status `'paid'` before minting NFT
- [ ] **Currency Compliance**: 1 ⭐ ≈ 0.01 USD pricing (rounded appropriately)

## Testing Checklist

### 8. Cross-Platform Testing
- [ ] **iOS Testing**: App functions properly on iOS Telegram client
- [ ] **Android Testing**: App functions properly on Android Telegram client
- [ ] **Desktop Testing**: App functions properly on desktop Telegram client
- [ ] **Theme Testing**: App looks good in both light and dark themes

### 9. Wallet Integration Testing
- [ ] **TON Connect**: Wallet connection works properly
- [ ] **Transaction Flow**: TON transactions execute successfully
- [ ] **Fallback Testing**: Alternative payment methods work if primary fails

### 10. Error Handling
- [ ] **API Fallback**: "Mini App unavailable" screen with support contact option
- [ ] **Network Errors**: Graceful handling of network issues
- [ ] **Payment Errors**: Proper error messages for failed payments
- [ ] **Authentication Errors**: Clear feedback for auth issues

## Bot Configuration

### 11. BotFather Settings
- [ ] **Inline Locations**: Enabled in BotFather
- [ ] **Menu Button**: "Commands" configured with web_app setting
- [ ] **Short Name**: Matches the `short_name` in manifest.json
- [ ] **Web App URL**: Correctly configured with proper domain

### 12. Analytics and Monitoring
- [ ] **No Third-Party Analytics**: Google Analytics, Facebook Pixel removed before moderation
- [ ] **Bot API Events**: Using `sendEvent` method for analytics
- [ ] **Error Monitoring**: Sentry or similar setup for crash reporting
- [ ] **User Data**: Only collecting necessary user data as per Telegram guidelines

## Pre-Launch Validation

### 13. Final Testing
- [ ] **Sandbox Testing**: App tested in Telegram sandbox environment
- [ ] **Real Device Testing**: Tested on actual iOS and Android devices
- [ ] **Performance Testing**: Verified under load conditions
- [ ] **Security Testing**: Penetration testing for common vulnerabilities

### 14. Documentation
- [ ] **Feature Description**: Clear description of all app features
- [ ] **External Dependencies**: List of all external services used
- [ ] **Privacy Policy**: Available and accessible
- [ ] **Terms of Service**: Available and accessible

## Post-Submission Monitoring

### 15. Launch Monitoring
- [ ] **Error Threshold**: Sentry configured with 50 errors/hour threshold for rollback
- [ ] **Conversion Tracking**: Wallet → Purchase conversion rate monitoring
- [ ] **User Feedback**: System for collecting initial user reviews
- [ ] **Performance Metrics**: Continuous monitoring of load times and performance

## Common Rejection Reasons to Avoid

- ❌ Using `alert()` or `confirm()` system dialogs
- ❌ CSP with `'unsafe-inline'` or `'unsafe-eval'`
- ❌ Third-party analytics during moderation
- ❌ Improper handling of `web_app_close`
- ❌ Missing fallback screens for API failures
- ❌ Incorrect manifest.json configuration
- ❌ Direct external API calls without proxying
- ❌ Invalid auth_date validation (not checking age of auth data)

## Quick CLI Validation Commands

```bash
# Check bundle size
ls -lh dist/index.html | awk '{print $5}'

# Check for unsafe code
grep -R "alert\|confirm" src/ && echo "clean" || echo "found system dialogs"

# Validate auth date (Node.js)
node -e "console.log(Date.now()/1000 - 1800 < AUTH_DATE)"

# Check CSP headers
curl -I https://your.app | grep -i "Content-Security-Policy"

# Validate image formats
file icon512.png  # Should show PNG with alpha channel
```

## Final Verification Steps

Before submitting to Telegram moderation:

1. [ ] Run through all user flows manually
2. [ ] Verify all checklists above are completed
3. [ ] Test on multiple devices and platforms
4. [ ] Ensure all error states are handled gracefully
5. [ ] Confirm all external services are properly proxied
6. [ ] Validate that no sensitive data is stored client-side
7. [ ] Test payment flows thoroughly
8. [ ] Verify performance metrics meet requirements
9. [ ] Confirm all UI elements work in both themes
10. [ ] Test the entire authentication and payment flow from start to finish

## Emergency Rollback Plan

- [ ] Version control system with ability to quickly revert
- [ ] Monitoring system to detect issues within 1 hour of deployment
- [ ] Rollback procedures documented and tested
- [ ] Communication plan for users in case of rollback

Following this checklist should ensure your Telegram Mini App meets all moderation requirements and has the best chance of quick approval.