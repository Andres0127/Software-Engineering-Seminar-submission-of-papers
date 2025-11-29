# Notification System - Event Platform

## Overview

A complete notification system that alerts users about important events in their ticket purchasing journey, including payment confirmations, failures, and refund status updates.

## Features

### Notification Types

1. **Payment Success** 🎉
   - Triggered when a payment is successfully processed
   - Confirms ticket purchase
   - Includes transaction details

2. **Payment Failed** ❌
   - Triggered when a payment fails
   - Includes error details and reason
   - Prompts user to try again

3. **Refund Requested** 💰
   - Notifies organizers when a user requests a refund
   - Includes refund reason
   - Requires organizer action

4. **Refund Approved** ✅
   - Notifies user when refund is approved
   - Confirms refund processing

5. **Refund Rejected** ❌
   - Notifies user when refund is rejected
   - Includes rejection reason

## Setup Instructions

### 1. Database Migration

Execute the SQL migration script to update the notifications table:

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to `eventplatform` database
3. Open Query Tool
4. Load file: `python-backend/scripts/05-update-notifications-table.sql`
5. Execute (F5)

**Using psql command line:**
```bash
psql -U postgres -d eventplatform -f python-backend/scripts/05-update-notifications-table.sql
```

### 2. Install Frontend Dependencies

The notification panel requires `date-fns` for time formatting:

```bash
cd react-frontend
npm install date-fns
```

### 3. Restart Backend

After database migration, restart the Python backend:

```bash
cd python-backend
# Stop current server (Ctrl+C)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Usage

### For Users

**Viewing Notifications:**
1. Click the bell icon (🔔) in the top right corner
2. See unread count badge
3. Panel opens showing all notifications
4. New notifications appear in blue highlight

**Managing Notifications:**
- Click "Mark as read" on individual notifications
- Click "Mark all" to mark all as read
- Click "Delete" to remove a notification
- Notifications auto-refresh every 30 seconds

### For Organizers

**Refund Requests:**
When a user requests a refund, organizers receive a notification with:
- Order details
- Refund reason
- Quick action links

**Responding to Refunds:**
Use the API endpoints:
- `POST /api/orders/{order_id}/refund/approve` - Approve refund
- `POST /api/orders/{order_id}/refund/reject` - Reject refund

## API Endpoints

### Get Notifications
```
GET /api/notifications/
Query params:
  - unread_only: boolean (optional)
  - skip: number (default: 0)
  - limit: number (default: 50)
```

### Get Notification Stats
```
GET /api/notifications/stats
Returns: { total, unread, read }
```

### Mark as Read
```
POST /api/notifications/{id}/read
POST /api/notifications/mark-read
  Body: { notification_ids: [1, 2, 3] }
POST /api/notifications/mark-all-read
```

### Delete Notification
```
DELETE /api/notifications/{id}
```

## Notification Flow

### Payment Flow
```
User makes payment
  ↓
Payment processed
  ↓
Success? → Send "Payment Success" notification
         → Update order & tickets
  ↓
Failure? → Send "Payment Failed" notification
         → Include error details
```

### Refund Flow
```
User requests refund
  ↓
Send "Refund Requested" to Organizer
  ↓
Organizer reviews
  ↓
Approve? → Send "Refund Approved" to User
         → Update order status to REFUNDED
  ↓
Reject? → Send "Refund Rejected" to User
        → Revert order to CONFIRMED
```

## Components

### Backend

**Models:**
- `notification.py` - Notification model with types

**Services:**
- `notification_service.py` - Notification creation logic

**Routes:**
- `notifications.py` - API endpoints

**Schemas:**
- `notification.py` - Pydantic validation schemas

### Frontend

**Services:**
- `notificationService.ts` - API client

**Components:**
- `NotificationPanel.tsx` - Main notification UI

## Configuration

### Polling Interval
Notifications refresh every 30 seconds by default. To change:

```typescript
// In NotificationPanel.tsx
const interval = setInterval(loadNotifications, 30000); // milliseconds
```

### Maximum Notifications
Default limit is 50 notifications. To change:

```typescript
// In notificationService.ts
const response = await axios.get(`${API_URL}/`, {
  params: { limit: 100 } // Change limit here
});
```

## Troubleshooting

### Notifications Not Appearing

1. **Check database migration:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'notifications';
   ```
   Should include: title, type (VARCHAR), message (TEXT), data (JSONB), etc.

2. **Check backend logs:**
   Look for notification creation in console

3. **Check authentication:**
   Notifications require valid JWT token

### Unread Count Not Updating

1. Ensure notifications are being marked as read
2. Check that stats endpoint is responding
3. Verify polling is working (check network tab)

## Future Enhancements

- **Email notifications** - Send emails for important notifications
- **Push notifications** - Browser push notifications
- **Notification preferences** - Let users choose which notifications to receive
- **Notification groups** - Group similar notifications
- **Sound alerts** - Audio notification for new messages
- **Real-time updates** - WebSocket for instant notifications

## Database Schema

```sql
notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

**Implementation date**: November 2025  
**Status**: Functional and ready for testing
