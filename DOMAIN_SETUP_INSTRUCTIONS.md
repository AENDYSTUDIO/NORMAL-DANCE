# 🌐 Domain Setup Instructions for NormalDance

## 📋 Current Status
- ✅ **Deployment**: Latest deployed to Vercel
- ✅ **Base URL**: https://normaldance-rfei73btp-neuroflacs-projects.vercel.app
- ⏳ **Custom Domains**: Ready for configuration

## 🎯 Target Domains
1. **Primary**: `normaldance.online`
2. **Secondary**: `normaldance.ru`

## 🔧 Setup Instructions

### Option 1: Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Navigate to project: `neuroflacs-projects/normaldance`

2. **Add Custom Domain**
   - Click "Settings" tab
   - Click "Domains" section
   - Click "Add" button
   - Enter: `normaldance.online`
   - Click "Add"

3. **Configure DNS**
   - Vercel will show DNS records
   - Add these records to your domain registrar:
   
   **For normaldance.online:**
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Repeat for normaldance.ru**
   - Add `normaldance.ru` as second domain
   - Configure similar DNS records

5. **HTTPS Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation (5-10 minutes)
   - Verify domain status in Vercel dashboard

### Option 2: Vercel CLI

```bash
# Add primary domain
vercel domains add normaldance.online

# Add secondary domain  
vercel domains add normaldance.ru

# Check domain status
vercel domains ls

# Remove domain if needed
vercel domains rm normaldance.online
```

## 🚀 After Setup

### 1. Update Environment Variables
```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_APP_URL=https://normaldance.online
NEXTAUTH_URL=https://normaldance.online
TELEGRAM_WEB_APP_URL=https://normaldance.online/telegram-app
TELEGRAM_WEBHOOK_URL=https://normaldance.online/api/telegram/webhook
```

### 2. Test Domains
```bash
# Test main domain
curl https://normaldance.online/api/health

# Test Telegram Mini App
curl https://normaldance.online/telegram-app

# Test API endpoints
curl https://normaldance.online/api/tracks
```

### 3. Update Telegram Bot
1. Open @BotFather in Telegram
2. Send `/setwebhook`
3. Set webhook to: `https://normaldance.online/api/telegram/webhook`

## 🔍 Troubleshooting

### Common Issues

1. **Domain Already in Use**
   ```
   Error: Cannot add normaldance.online since it's already assigned to another project
   ```
   **Solution**: Check Vercel dashboard for existing projects using the domain

2. **DNS Propagation**
   ```
   Domain verification failed
   ```
   **Solution**: Wait 10-15 minutes for DNS to propagate globally

3. **SSL Certificate Issues**
   ```
   Certificate provisioning failed
   ```
   **Solution**: Ensure DNS records are correct and wait for verification

4. **Access Denied for Domain**
   ```
   Error: You don't have access to "normaldance.ru"
   ```
   **Solution**: Verify domain ownership through domain registrar

### DNS Verification Commands
```bash
# Check A record
nslookup normaldance.online

# Check CNAME record
nslookup www.normaldance.online

# Verify propagation
dig normaldance.online
```

## 📊 Monitoring

### 1. Vercel Analytics
- Enable in project dashboard
- Monitor traffic and performance
- Set up alerts

### 2. Health Monitoring
```bash
# Continuous health check
while true; do
  curl -f https://normaldance.online/api/health
  sleep 60
done
```

### 3. Uptime Monitoring
- Set up external monitoring (UptimeRobot, Pingdom)
- Monitor custom domains
- Alert on downtime

## 🔄 Redirects

### WWW to Non-WWW
Add to `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/www/:path*",
      "destination": "/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/www/:path*",
      "destination": "https://normaldance.online/:path*",
      "permanent": true
    }
  ]
}
```

## 📱 Progressive Web App Configuration

### Service Worker Registration
Add to `public/manifest.json`:
```json
{
  "name": "NormalDance - Децентрализованная музыка",
  "short_name": "NormalDance",
  "description": "Web3 музыкальная платформа",
  "start_url": "https://normaldance.online",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#1a1a1a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎉 Launch Checklist

- [ ] Custom domains configured and verified
- [ ] DNS records updated
- [ ] SSL certificates provisioned
- [ ] Environment variables updated
- [ ] Health endpoints tested
- [ ] Telegram webhook configured
- [ ] Analytics enabled
- [ ] Monitoring set up
- [ ] redirects configured
- [ ] PWA manifest updated

---

## 📞 Support

**Vercel Documentation**: https://vercel.com/docs/custom-domains
**Vercel Support**: support@vercel.com
**Domain Registrar**: Contact your domain provider for DNS assistance

## 🔄 Next Steps

1. **Configure DNS** - Add A and CNAME records
2. **Verify Domains** - Wait for SSL certificates
3. **Test Functionality** - Verify all endpoints work
4. **Update Integrations** - Configure Telegram and other services
5. **Monitor Performance** - Set up alerts and analytics

**Timeline**: 24-48 hours for full domain propagation and SSL setup

---

**Status**: ✅ Ready for domain configuration
**Next Action**: Add domains via Vercel Dashboard and configure DNS
