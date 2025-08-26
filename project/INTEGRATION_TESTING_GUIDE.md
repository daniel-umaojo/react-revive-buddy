# 🧪 Supabase Auth Integration Testing Guide

This guide will help you test the complete Supabase Auth integration to ensure everything works correctly.

## 📋 Pre-Testing Checklist

### 1. Database Setup
- [ ] Run the `database-setup-auth.sql` script in your Supabase SQL Editor
- [ ] Verify all tables are created: `user_profiles`, `tank_settings`, `tank_data`, `fluid_database`
- [ ] Check that RLS is enabled on all tables
- [ ] Confirm admin views are created: `admin_user_overview`, `auth_users_info`

### 2. Supabase Configuration
- [ ] Authentication → Settings → Email: Enable email confirmations = ON
- [ ] Set Site URL: `http://localhost:5173`
- [ ] Add redirect URLs: `http://localhost:5173/`, `http://localhost:5173/?*`

### 3. Admin Account Setup
- [ ] Register admin account with email: `admin@glence.com`
- [ ] Verify the admin email to ensure RLS policies work

## 🔄 Testing Sequence

### Phase 1: User Registration & Authentication

#### Test 1: New User Registration
1. **Run the app**: `npm run dev`
2. **Go to Register tab**
3. **Register a new user**:
   - Email: `testuser@example.com`
   - Password: `testpass123` (at least 6 characters)
4. **Expected Results**:
   - ✅ Registration successful message
   - ✅ Console shows: `🔍 Starting Supabase Auth signUp`
   - ✅ Console shows: `✅ Supabase Auth signup successful`
   - ✅ Console shows: `📧 Email verification required`
   - ✅ Form switches to login tab
   - ✅ User receives verification email

#### Test 2: Email Verification
1. **Check email inbox** (including spam)
2. **Click verification link**
3. **Expected Results**:
   - ✅ Redirected back to app
   - ✅ URL contains verification parameters
   - ✅ Console shows: `🔍 Processing email verification`
   - ✅ Success message: "Email verified successfully!"
   - ✅ Automatically switches to login tab

#### Test 3: User Login
1. **Enter verified credentials**
2. **Click Login**
3. **Expected Results**:
   - ✅ Console shows: `🔍 Starting Supabase Auth signIn`
   - ✅ Console shows: `✅ Supabase Auth signin successful`
   - ✅ Access to dashboard
   - ✅ Tank setup modal appears (no tanks configured)

### Phase 2: Data Operations

#### Test 4: Tank Settings Creation
1. **Complete tank setup modal**:
   - Vessel: "Test Vessel"
   - Tank: "Test Tank A"
   - Shape: Cylindrical
   - Max Level: 10m
   - Area: 50 m²
2. **Click Save**
3. **Expected Results**:
   - ✅ Console shows: `🔍 Saving tank settings for user`
   - ✅ Console shows: `✅ Tank settings saved successfully`
   - ✅ Tank appears in dashboard
   - ✅ Data saved to Supabase (check via Supabase dashboard)

#### Test 5: Tank Data Entry
1. **Navigate to "Input & Volume"**
2. **Enter tank data**:
   - Select your tank
   - Volume: 25 m³
   - Temperature: 20°C
   - Pressure: 101325 Pa
   - Add operator name
3. **Submit data**
4. **Expected Results**:
   - ✅ Console shows: `🔍 Saving tank data for user`
   - ✅ Console shows: `✅ Tank data saved successfully`
   - ✅ Data appears in charts/history
   - ✅ Data saved to Supabase with auth_user_id

#### Test 6: Data Fetching on Login
1. **Logout and login again**
2. **Expected Results**:
   - ✅ Tank settings automatically loaded
   - ✅ Tank data history displayed
   - ✅ No setup modal (tank exists)
   - ✅ Console shows successful data fetching

### Phase 3: Admin Dashboard Testing

#### Test 7: Admin Login
1. **Go to Admin Panel**
2. **Login with admin credentials**:
   - Email: `admin@glence.com`
   - Password: `glence-admin-2024`
3. **Expected Results**:
   - ✅ Access to admin dashboard
   - ✅ Console shows: `🔍 Loading admin dashboard data`
   - ✅ Console shows: `🔍 Admin check for user: admin@glence.com isAdmin: true`

#### Test 8: Admin Data Visibility
1. **Check admin statistics cards**
2. **Expand user entries**
3. **Expected Results**:
   - ✅ Total users count includes test users
   - ✅ Verified users count shows confirmed users
   - ✅ Tank settings and data counts are accurate
   - ✅ User details show auth_user_id
   - ✅ Recent tank data table populated
   - ✅ Export function works

#### Test 9: RLS Policy Testing
1. **Create a second test user**
2. **Add tank data for both users**
3. **Login as each user**
4. **Expected Results**:
   - ✅ User 1 only sees their own data
   - ✅ User 2 only sees their own data  
   - ✅ Admin sees all users' data
   - ✅ No cross-user data leakage

### Phase 4: Error Handling & Edge Cases

#### Test 10: Duplicate Registration
1. **Try to register with existing email**
2. **Expected Results**:
   - ✅ Error: "User already exists with this email"
   - ✅ No console errors
   - ✅ User remains on registration form

#### Test 11: Invalid Login
1. **Try login with wrong credentials**
2. **Expected Results**:
   - ✅ Error message displayed
   - ✅ No access granted
   - ✅ Console shows auth error details

#### Test 12: Unverified User Login
1. **Register new user but don't verify email**
2. **Try to login**
3. **Expected Results**:
   - ✅ Login blocked or limited functionality
   - ✅ Message about email verification

#### Test 13: Network Offline Testing
1. **Disconnect internet**
2. **Try to perform operations**
3. **Expected Results**:
   - ✅ Graceful error handling
   - ✅ Local storage fallback works
   - ✅ Data syncs when reconnected

## 🔍 Debugging & Verification

### Console Log Monitoring
Watch for these key log messages:
- 🔍 (Investigation/Debug)
- ✅ (Success)
- ❌ (Error)
- 📧 (Email related)
- 🔄 (Sync/Update)
- 🎉 (Major success)

### Supabase Dashboard Verification
1. **Go to Supabase Dashboard**
2. **Check Table Editor**:
   - `auth.users`: Verify new users appear
   - `tank_settings`: Check auth_user_id is populated
   - `tank_data`: Verify data links to correct user
   - `user_profiles`: Auto-created profiles exist

### Database Query Testing
Run these queries in Supabase SQL Editor:

```sql
-- Check user count
SELECT COUNT(*) as total_users FROM auth.users;

-- Check user data association
SELECT 
    au.email,
    COUNT(ts.id) as tank_settings_count,
    COUNT(td.id) as tank_data_count
FROM auth.users au
LEFT JOIN tank_settings ts ON au.id = ts.auth_user_id
LEFT JOIN tank_data td ON au.id = td.auth_user_id
GROUP BY au.id, au.email;

-- Test admin view
SELECT * FROM admin_user_overview;
```

## ✅ Success Criteria

### User Experience
- [ ] Registration process is smooth and intuitive
- [ ] Email verification works reliably
- [ ] Login/logout functions properly
- [ ] Data operations are fast and reliable
- [ ] Error messages are clear and helpful

### Data Integrity
- [ ] All data properly linked to auth_user_id
- [ ] RLS policies prevent data leakage
- [ ] Admin can see all data, users see only their own
- [ ] Data persists across sessions
- [ ] Local storage fallback works

### Security
- [ ] Unauthenticated users cannot access data
- [ ] Users cannot see other users' data
- [ ] Admin access requires proper authentication
- [ ] SQL injection and other attacks prevented by RLS

### Performance
- [ ] Login/registration within 2-3 seconds
- [ ] Data loading is responsive
- [ ] Admin dashboard loads efficiently
- [ ] No memory leaks or performance issues

## 🚨 Common Issues & Solutions

### Issue: "User already registered" on fresh install
**Solution**: Check if email exists in `auth.users` table. Delete if needed.

### Issue: RLS policies blocking legitimate access
**Solution**: Verify user is properly authenticated and policies match auth_user_id.

### Issue: Admin dashboard shows empty data
**Solution**: Ensure admin user email is exactly `admin@glence.com` and verified.

### Issue: Email verification not working
**Solution**: Check Supabase email settings and redirect URLs.

### Issue: Console errors about auth_user_id
**Solution**: Verify database schema includes auth_user_id columns and foreign keys.

## 📊 Test Results Template

Copy this template and fill it out during testing:

```
## Test Results - [Date]

### Phase 1: Authentication
- [ ] User Registration: ✅/❌
- [ ] Email Verification: ✅/❌  
- [ ] User Login: ✅/❌
- Notes: ________________

### Phase 2: Data Operations
- [ ] Tank Settings: ✅/❌
- [ ] Tank Data Entry: ✅/❌
- [ ] Data Persistence: ✅/❌
- Notes: ________________

### Phase 3: Admin Dashboard
- [ ] Admin Login: ✅/❌
- [ ] Data Visibility: ✅/❌
- [ ] RLS Policies: ✅/❌
- Notes: ________________

### Phase 4: Error Handling
- [ ] Duplicate Registration: ✅/❌
- [ ] Invalid Login: ✅/❌
- [ ] Offline Handling: ✅/❌
- Notes: ________________

### Overall Status: ✅ PASS / ❌ FAIL
### Critical Issues Found: 
### Recommendations:
```

---

**🎯 Goal**: Complete this testing guide to ensure your Supabase Auth integration is production-ready!

**📞 Support**: Check browser console for detailed logs and refer to error messages for troubleshooting.
