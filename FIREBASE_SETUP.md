# Firebase Database Rules and Indexes Setup

This guide explains how to configure Firebase Realtime Database rules and indexes for the Nexus educational platform.

## 🔥 Firebase Database Rules Configuration

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Nexus project
3. Navigate to **Realtime Database** → **Rules** tab

### Step 2: Apply Database Rules
Copy the content from `firebase-rules-withdrawal.json` and paste it into the Firebase Console rules editor.

### Step 3: Database Indexes Setup

**IMPORTANT**: The application requires specific database indexes for optimal performance and to prevent errors during financial report generation.

The following indexes are automatically configured in the rules file:

#### User Data Indexes
```json
"users": {
  "$uid": {
    "withdrawalHistory": {
      ".indexOn": ["requestedAt", "status", "amount"]
    }
  }
}
```

#### Course and Enrollment Indexes
```json
"courses": {
  ".indexOn": ["instructorId", "category", "price", "createdAt"]
},
"enrollments": {
  ".indexOn": ["userId", "courseId", "transactionId", "enrollmentDate", "status"]
}
```

#### Payment and Application Indexes
```json
"payments": {
  ".indexOn": ["userId", "status", "transactionId", "createdAt", "courseId"]
},
"instructorApplications": {
  ".indexOn": ["userId", "status", "applicationDate"]
}
```

## 🚨 Error Resolution

### Common Error: "Index not defined"

**Error Message**: 
```
Index not defined, add ".indexOn": "requestedAt", for path "/users/.../withdrawalHistory", to the rules
```

**Solution**: 
1. Apply the updated Firebase rules from `firebase-rules-withdrawal.json`
2. Wait 2-3 minutes for the indexes to be built
3. Test the financial report export functionality again

### Testing Database Rules

After applying the rules, test the following features to ensure everything works:

1. **Financial Report Export**: 
   - Go to Instructor Dashboard → Advanced Payment Gateway
   - Click "تصدير PDF" or "تصدير Excel" 
   - Should work without index errors

2. **Payment History**: 
   - Check payment records load correctly
   - Verify filtering and sorting works

3. **Course Management**: 
   - Ensure course listings load properly
   - Verify instructor-specific course filtering

## 🔒 Security Features

The rules implement comprehensive security:

### User Data Protection
- Users can only access their own data
- Instructors can only modify their own courses
- Admin role required for sensitive operations

### Payment Security
- Payment data accessible only to involved parties
- Secure transaction logging
- Withdrawal history protected per user

### Instructor Applications
- Applications visible only to admins and applicants
- Status updates controlled by role permissions

## 📊 Performance Optimization

The indexes optimize these critical operations:

1. **Financial Reports**: Fast queries on withdrawal history by date
2. **Payment Processing**: Quick lookups by transaction ID and user ID
3. **Course Discovery**: Efficient filtering by instructor and category
4. **Admin Operations**: Fast pending application and payment queries

## 🔧 Troubleshooting

### Rules Not Applied
- Check JSON syntax in Firebase Console
- Ensure no trailing commas or syntax errors
- Refresh browser and try again

### Index Building Time
- New indexes take 2-3 minutes to build
- Large datasets may take longer
- Monitor Firebase Console for completion status

### Permission Errors
- Verify user authentication status
- Check user role assignments in database
- Ensure proper context providers are configured

## 📝 Rule Maintenance

### Regular Updates
- Review rules quarterly for security updates
- Monitor Firebase Console for rule performance
- Update indexes as new features are added

### Testing Changes
- Always test rule changes in development first
- Use Firebase Console simulator for rule testing
- Backup existing rules before major changes

## 🆘 Support

If you encounter issues:

1. Check Firebase Console for detailed error messages
2. Verify rules syntax using JSON validators
3. Review authentication context in application
4. Contact development team with specific error messages

---

**Note**: These rules are specifically configured for the Nexus educational platform's financial and payment management system. Modifications should be tested thoroughly before deployment.