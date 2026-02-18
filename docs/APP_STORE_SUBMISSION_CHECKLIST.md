
# BioLoop - App Store Submission Checklist

## ✅ Technical Requirements

### HealthKit Integration
- [x] NSHealthShareUsageDescription in Info.plist
- [x] All HealthKit calls wrapped in try/catch blocks
- [x] Defensive programming for nil/NaN/Infinity values
- [x] Data validation and clamping implemented
- [x] Read permissions for required data types:
  - Heart rate samples
  - Resting heart rate
  - Heart rate variability (SDNN)
  - VO2 max
  - Workout type
  - Sleep analysis
  - Body mass
  - Height
  - Date of birth

### Data Security
- [x] AES-256 encryption for local storage (AsyncStorage)
- [x] No iCloud sync (local device only)
- [x] Data deletion functionality implemented
- [x] Privacy-first architecture (data never leaves device)

### Subscription System
- [x] StoreKit 2 integration
- [x] 7-day free trial configured
- [x] Monthly subscription product: bioloop.premium.monthly
- [x] Yearly subscription product: bioloop.premium.yearly
- [x] Purchase flow implemented
- [x] Restore purchases functionality
- [x] Subscription status display

### UI/UX
- [x] SF Symbols for all icons
- [x] 4 tabs: Home, Activity, Biology, Profile
- [x] Dark mode support
- [x] Responsive design for all iOS devices
- [x] Loading states for all async operations
- [x] Error handling with user-friendly messages

### Legal & Privacy
- [x] Privacy Policy URL: https://bioloop.app/privacy
- [x] Terms of Service URL: https://bioloop.app/terms
- [x] HealthKit permissions link in Profile
- [x] Data deletion option in Profile

## 📱 App Icon Requirements

### Required Sizes
- 1024×1024px - App Store (required)
- 180×180px - iPhone (3x)
- 120×120px - iPhone (2x)
- 167×167px - iPad Pro
- 152×152px - iPad (2x)
- 76×76px - iPad (1x)

### Design Specifications
- Blue waveform on white background
- No transparency
- No rounded corners (iOS adds them automatically)
- RGB color space
- PNG format

## 🧪 Testing Checklist

### HealthKit Permissions
- [ ] Grant HealthKit permissions on first launch
- [ ] Verify all data types are accessible
- [ ] Test permission denial flow
- [ ] Test re-requesting permissions

### Data Sync
- [ ] Sync data from HealthKit
- [ ] Verify all metrics are calculated correctly
- [ ] Test with missing data (partial metrics)
- [ ] Test with no data available

### All Tabs
- [ ] Home tab displays Readiness Score
- [ ] Activity tab shows Performance Index
- [ ] Biology tab displays BioAge
- [ ] Profile tab shows subscription status

### Subscription Flow
- [ ] Test paywall presentation
- [ ] Test monthly subscription purchase (sandbox)
- [ ] Test yearly subscription purchase (sandbox)
- [ ] Test 7-day free trial
- [ ] Test restore purchases
- [ ] Verify subscription status updates

### Free Tier Limits
- [ ] Verify 3-day historical data limit for free users
- [ ] Test blurred charts for free users
- [ ] Verify premium features unlock after subscription

### Data Deletion
- [ ] Test delete all data functionality
- [ ] Verify confirmation modal appears
- [ ] Confirm data is permanently deleted
- [ ] Verify app continues to work after deletion

## 📝 App Store Metadata

### App Information
- **Name:** BioLoop
- **Subtitle:** Health Analytics & BioAge
- **Category:** Health & Fitness
- **Age Rating:** 4+ (No objectionable content)

### Description
See `BioLoop_AppStore_Submission_Package.docx` for:
- Full app description
- Feature list
- Keywords for ASO
- What's New text

### Screenshots Required
- 6.7" iPhone (iPhone 15 Pro Max) - Required
- 6.5" iPhone (iPhone 14 Plus) - Required
- 5.5" iPhone (iPhone 8 Plus) - Optional
- 12.9" iPad Pro - Optional

### Screenshot Content
1. Home screen with Readiness Score
2. Activity screen with Performance Index
3. Biology screen with BioAge
4. Paywall screen
5. Profile screen
6. Metrics detail view

## 🔐 Privacy & Compliance

### HealthKit Justification
**Why does your app need HealthKit data?**

"BioLoop analyzes your heart rate, HRV, sleep, and workout data to calculate your Performance Index and biological age. All calculations are performed on-device, and your data never leaves your device. We use this data to provide personalized health insights and track your fitness progress over time."

### Data Collection
- [x] No data collected by developer
- [x] All data stored locally on device
- [x] No analytics or tracking
- [x] No third-party SDKs

### Privacy Policy Requirements
Must include:
- What data is accessed (HealthKit data types)
- How data is used (calculations, insights)
- Where data is stored (local device only)
- Data retention policy
- User rights (deletion, access)
- Contact information

## 🚀 Pre-Submission Steps

1. **Build Configuration**
   - [ ] Set version number (1.0.0)
   - [ ] Set build number (1)
   - [ ] Configure bundle identifier: com.bioloop.app
   - [ ] Set deployment target: iOS 16.0+

2. **App Store Connect**
   - [ ] Create app listing
   - [ ] Upload app icon (1024×1024px)
   - [ ] Add screenshots for all required sizes
   - [ ] Fill in app description and metadata
   - [ ] Set pricing (Free with in-app purchases)
   - [ ] Configure in-app purchases (monthly/yearly)
   - [ ] Set up 7-day free trial

3. **TestFlight**
   - [ ] Upload build to TestFlight
   - [ ] Add internal testers
   - [ ] Test all functionality
   - [ ] Verify subscription flow in sandbox
   - [ ] Collect feedback

4. **Final Review**
   - [ ] Test on multiple devices
   - [ ] Verify all links work (Privacy, Terms)
   - [ ] Check for crashes or bugs
   - [ ] Verify HealthKit permissions
   - [ ] Test subscription purchase flow
   - [ ] Verify data deletion works

## 📋 Submission Notes

### Review Notes for Apple
"BioLoop is a health analytics app that calculates a Performance Index and biological age based on HealthKit data. All data processing happens on-device, and no data is transmitted to external servers. The app requires HealthKit access to read heart rate, HRV, sleep, and workout data for calculations. A 7-day free trial is included with both subscription options."

### Demo Account
Not required - app works with user's own HealthKit data.

### Test Instructions
1. Grant HealthKit permissions when prompted
2. Tap "Sync Data" on Home screen to fetch HealthKit data
3. Navigate through all 4 tabs to see calculated metrics
4. Test subscription flow (use sandbox account)
5. Test data deletion in Profile tab

## ✅ Final Checklist

Before submitting:
- [ ] All features tested and working
- [ ] No crashes or critical bugs
- [ ] HealthKit permissions working
- [ ] Subscription flow tested in sandbox
- [ ] Privacy Policy and Terms hosted and accessible
- [ ] App icon uploaded (1024×1024px)
- [ ] Screenshots uploaded for all required sizes
- [ ] App description and metadata complete
- [ ] In-app purchases configured
- [ ] 7-day free trial configured
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight testing complete

## 📞 Support

For App Store review questions or issues:
- Email: support@bioloop.app
- Website: https://bioloop.app
