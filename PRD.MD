# Creator Membership Platform - PRD

## 1. Product Overview

Build a modern **creator membership and social community platform** where creators can publish content, grow followers, offer premium memberships, receive support from fans, and manage earnings.

Users can follow creators, subscribe to memberships, access premium posts, watch stories and reels, interact with content, send messages, and manage their account balance.

The platform should have a premium, modern, mobile-first design.

---

# 2. User Roles

### Guest

* View landing page
* Explore creators
* View public profiles
* Register
* Login

### Member

* Create profile
* Follow creators
* Subscribe to creators
* Join membership plans
* Access premium content
* Like and comment
* Save posts
* Watch stories and reels
* Send messages
* Support creators
* Manage balance and transactions

### Creator

* Create posts
* Upload images and videos
* Create stories
* Upload reels
* Create premium content
* Create membership plans
* Set subscription pricing
* Receive creator support
* Manage followers
* Manage subscribers
* View earnings
* Request payouts
* View analytics

### Admin

* Manage users
* Manage creators
* Review creator applications
* Manage content
* Manage reports
* Manage subscriptions
* Manage transactions
* Manage payouts
* Configure platform fees
* Manage categories
* Manage settings
* View analytics

---

# 3. Authentication

Include:

* Sign up
* Login
* Logout
* Email verification
* Forgot password
* Reset password
* Protected routes
* Role-based permissions
* Account status management

---

# 4. Creator Profiles

Each creator profile should include:

* Avatar
* Cover image
* Display name
* Username
* Verification badge
* Bio
* Followers
* Membership starting price
* Follow button
* Subscribe button
* Message button
* Support creator button
* Share profile

Profile tabs:

* Posts
* Media
* Reels
* Memberships
* About

---

# 5. Post System

Creators can publish:

* Text posts
* Image posts
* Video posts
* Multiple images
* Audio posts
* Polls

Content visibility:

* Public
* Followers
* Subscribers
* Membership members
* Premium access
* Private

Users can:

* Like
* Comment
* Reply
* Save
* Share

---

# 6. Premium Content Access

Creators can publish premium content that requires membership or individual access.

Supported premium content:

* Images
* Videos
* Albums
* Posts
* Reels
* Messages

Before access, show:

* Preview
* Blurred thumbnail
* Premium icon
* Access price
* Unlock button

After successful transaction, the member receives access.

Premium media must use private storage and secure backend validation.

---

# 7. Subscription System

Members can subscribe to creators.

Support:

* Monthly
* 3 months
* 6 months
* 12 months
* Auto-renewal
* Cancel subscription
* Subscription expiration

Creators can choose their subscription price.

---

# 8. Membership Plans

Creators can create multiple plans.

Example:

### Starter

$5/month

### Premium

$15/month

### VIP

$30/month

Each plan can include different benefits and content access.

---

# 9. Story / Status System

Create a modern story feature.

Support:

* Images
* Videos
* Text updates
* 24-hour expiration
* Viewer list
* Reactions
* Replies
* Progress bar

Visibility options:

* Public
* Followers
* Subscribers
* Membership members
* Premium

---

# 10. Reel System

Create a vertical short-video experience.

Features:

* Full-screen video
* Auto play
* Pause
* Mute
* Like
* Comment
* Follow
* Subscribe
* Save
* Share
* Creator profile
* Caption
* Hashtags
* View counter

Creators can publish public or premium reels.

---

# 11. Main Feed

Home feed should display content from:

* Followed creators
* Subscribed creators
* Recommended creators
* Trending content

Feed tabs:

* For You
* Following
* Subscribed

Use infinite scrolling.

---

# 12. Explore and Search

Explore page:

* Trending creators
* New creators
* Recommended creators
* Popular reels
* Popular posts
* Categories

Search:

* Creators
* Users
* Posts
* Reels
* Hashtags

---

# 13. Messaging

Create private communication between users and creators.

Features:

* Text
* Images
* Videos
* Audio
* Emoji
* Read status
* Typing indicator
* Online status
* Block
* Report

Creators can optionally share premium content inside conversations.

---

# 14. Creator Support

Members can financially support creators.

Support can be sent from:

* Creator profile
* Posts
* Reels
* Stories

Support options:

* Suggested amounts
* Custom amount

Each transaction should calculate:

* Total amount
* Platform fee
* Creator earning

---

# 15. Balance and Transaction System

Each member has an account balance area.

Display:

* Available balance
* Pending balance
* Total spent
* Creator earnings
* Transaction history

Members can use the balance for:

* Memberships
* Premium content
* Creator support

Creators can:

* Receive earnings
* Request payouts

Use a secure transaction ledger.

---

# 16. Creator Earnings

Creator dashboard should display:

* Total earnings
* Available earnings
* Pending earnings
* Subscription earnings
* Membership earnings
* Premium content earnings
* Support received

Analytics:

* Daily
* Weekly
* Monthly
* Yearly

---

# 17. Payout System

Creator payout flow:

Creator Dashboard
→ Earnings
→ Request Payout
→ Enter Amount
→ Select Payout Method
→ Submit
→ Admin Review
→ Approved / Rejected
→ Completed

Admin can configure:

* Minimum payout
* Platform fee
* Processing fee

---

# 18. Notifications

Notify users about:

* New followers
* New subscribers
* Likes
* Comments
* Messages
* Creator support
* Premium content access
* Subscription updates
* Creator updates
* Payout updates
* Verification updates

---

# 19. Creator Dashboard

Include:

* Revenue overview
* Followers
* Subscribers
* Profile views
* Content performance
* Reel views
* Story views
* Earnings chart
* Subscriber management
* Content management
* Payout management
* Analytics

---

# 20. Admin Panel

Admin menu:

* Dashboard
* Users
* Creators
* Creator Applications
* Posts
* Reels
* Stories
* Reports
* Subscriptions
* Memberships
* Transactions
* Earnings
* Payouts
* Categories
* Notifications
* Pages
* Platform Fees
* General Settings

Admin dashboard should display:

* Total members
* Total creators
* Active subscriptions
* Total platform revenue
* Creator earnings
* Transactions
* Pending payouts
* Reports

---

# 21. Creator Verification

Members can apply for creator status.

Application can include:

* Full name
* Creator name
* Country
* Profile information
* Creator category
* Verification information
* Payout information

Application statuses:

* Pending
* Under Review
* Approved
* Rejected

Admin manages all applications.

---

# 22. Reporting and Moderation

Users can report:

* Profiles
* Posts
* Reels
* Stories
* Comments
* Messages

Admin can:

* Review reports
* Hide content
* Remove content
* Warn users
* Suspend accounts
* Restrict creator features

---

# 23. Landing Page

Create a modern premium landing page.

Sections:

* Navigation
* Hero
* Creator showcase
* Main platform features
* How it works
* Membership benefits
* Creator benefits
* Community benefits
* Testimonials
* FAQ
* Become a Creator
* Final CTA
* Footer

Suggested hero:

**Create. Connect. Grow.**

Supporting text:

Build your community, share exclusive experiences, create memberships, and grow your creator business.

Buttons:

**Start Creating**

**Explore Creators**

---

# 24. Main Database Tables

```text
profiles
user_roles
creator_profiles
creator_applications

follows

posts
post_media
comments
likes
bookmarks

stories
story_views

reels
reel_views

membership_plans
subscriptions
content_access

balances
transactions

creator_earnings
payout_requests

conversations
messages

notifications
reports
categories
hashtags

site_settings
admin_audit_logs
```

---

# 25. Security Requirements

Use:

* Secure authentication
* PostgreSQL database
* Row Level Security
* Private media storage
* Server-side functions
* Secure transaction handling
* Role-based permissions

Never depend only on frontend checks for:

* Premium content access
* Membership status
* Balance
* Transactions
* Creator earnings
* Payout approvals
* Admin access

---

# 26. Recommended Lovable Stack

**Frontend:** Lovable + React + TypeScript
**Backend:** Supabase
**Database:** PostgreSQL
**Authentication:** Supabase Auth
**Storage:** Supabase Storage
**Realtime:** Supabase Realtime
**Backend Logic:** Supabase Edge Functions
**Source Control:** GitHub

---

# 27. Main Navigation

### Desktop

* Home
* Explore
* Reels
* Notifications
* Messages
* Saved
* Balance
* Creator Dashboard
* Profile

### Mobile

* Home
* Explore
* Create
* Messages
* Profile

---

# 28. Development Phases

### Phase 1

* Landing page
* Authentication
* Profiles
* Roles
* Database

### Phase 2

* Creator profiles
* Feed
* Posts
* Follow system
* Likes
* Comments
* Saved content

### Phase 3

* Stories
* Reels
* Search
* Notifications

### Phase 4

* Memberships
* Subscriptions
* Premium content
* Creator support
* Transactions

### Phase 5

* Messaging
* Creator earnings
* Payout system
* Creator analytics

### Phase 6

* Admin panel
* Creator verification
* Moderation
* Reports
* Platform analytics

---

# 29. Final Goal

Build a premium **creator membership, content-sharing, and social community platform** focused on:

* Creator profiles
* Social feed
* Followers
* Memberships
* Subscriptions
* Premium content
* Stories
* Reels
* Messaging
* Creator support
* Earnings
* Payouts
* Analytics
* Admin management
* Modern mobile-first UI

The design should be original, professional, scalable, and optimized for both creators and community members.
