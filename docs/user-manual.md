# NovaDrive Motors - User Manual

This manual provides step-by-step instructions for using the NovaDrive Motors vehicle auction platform. Follow these guides to learn how to bid on vehicles, manage auctions, and use the administrative features.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [How to Bid on Vehicles](#how-to-bid-on-vehicles)
3. [How to Create and Manage Auctions](#how-to-create-and-manage-auctions)
4. [Administration Guide](#administration-guide)
5. [Import & Scraping System](#import--scraping-system)

---

## Getting Started

### Accessing the Platform

Navigate to the NovaDrive Motors website to access the home page.

![Home Page](img/01-home.png)

The home page displays:
- **Hero Section**: Main call-to-action with "Browse Auctions" and "Create Account" buttons
- **Statistics**: Live counts of active auctions, users, and bids
- **Featured Auctions**: Vehicles ending soon
- **Benefits Section**: Why choose NovaDrive Motors

### Creating an Account

Click "Register" in the navigation or "Create Account" on the home page.

![Registration Page](img/04-register.png)

**Step 1: Personal Information**
1. Enter your **First Name** (minimum 2 characters)
2. Enter your **Last Name** (minimum 2 characters)
3. Enter your **Email Address** (this will be your login)
4. Create a **Password** (minimum 8 characters)
5. **Confirm Password** by typing it again

**Step 2: Verification**
1. Enter your **PESEL Number** (Polish ID - 11 digits)
2. Enter your **Phone Number** (minimum 9 digits)

**Step 3: Address (Optional)**
1. Enter your **Street Address**
2. Enter your **City**
3. Enter your **Postal Code**

Click **Create Account** to complete registration.

> **Tip**: You can also register quickly using the "Continue with Google" option.

### Logging In

Click "Sign In" in the navigation menu.

![Login Page](img/03-login.png)

**To log in:**
1. Enter your registered **Email Address**
2. Enter your **Password**
3. Click **Sign In**

**Alternative**: Click "Continue with Google" to sign in with your Google account.

---

## How to Bid on Vehicles

### Step 1: Browse Available Auctions

Navigate to the **Auctions** page from the main menu.

![Auctions Listing](img/02-auctions-listing.png)

**Using Filters:**
- **Search Box**: Type keywords (make, model, or title)
- **Vehicle Type Tabs**: Filter by Cars, Motorcycles, Trucks, or All
- **Year Range**: Set minimum and maximum years
- **Mileage Range**: Filter by kilometers
- **Sort Options**:
  - Ending Soon (default)
  - Newest
  - Most Popular

**Reading Auction Cards:**
Each card shows:
- Vehicle photo
- Title with make and model
- Year and mileage
- Reference number
- Source type badge
- Time remaining
- Estimated value

### Step 2: View Auction Details

Click on any auction card to see full details.

![Auction Detail](img/08-auction-detail.png)

**Photo Gallery (Left Side):**
- Main image display
- Navigation arrows to browse photos
- Thumbnail strip at bottom
- Click any thumbnail to view that image

**Information Tabs:**
1. **Specifications Tab**
   - Year, Mileage, Fuel Type
   - Engine details (size, power)
   - Transmission type
   - Body type and color
   - Condition rating
   - Location
   - VIN number (for verified users)

2. **Description Tab**
   - Full vehicle description
   - Equipment list
   - Special features

3. **Damage Report Tab**
   - Damage assessment (if applicable)
   - Repair cost estimate
   - Condition notes

**Auction Panel (Right Side):**
- Starting price
- Estimated market value
- Live countdown timer
- Your current bid (if any)
- Bid input field

### Step 3: Place Your Bid

**Requirements:**
- You must be logged in
- The auction must be active
- Your bid must meet minimum requirements

**To place a bid:**

1. **Ensure you're logged in** - If not, you'll see a prompt to sign in

2. **Enter your bid amount** in the bid field
   - First bid: Must equal or exceed starting price
   - Updating bid: Must be at least 100 PLN more than your previous bid

3. **Click "Place Bid"** or "Update Bid"

4. **Confirm** when prompted

5. **Check confirmation** - You'll receive:
   - On-screen success message
   - Email confirmation

**Bid Increment Requirements:**

| Current Price Range | Minimum Increment |
|---------------------|-------------------|
| Up to 10,000 PLN | 100 PLN |
| 10,001 - 50,000 PLN | 250 PLN |
| 50,001 - 100,000 PLN | 500 PLN |
| Above 100,000 PLN | 1,000 PLN |

### Step 4: Monitor Your Bids

Access your dashboard to track all your bidding activity.

![User Dashboard](img/14-user-dashboard.png)

**Dashboard Shows:**
- **Total Bids**: Count of all bids you've placed
- **Active Auctions**: Auctions you're currently bidding on
- **Auctions Won**: Your winning bids

**Recent Bids Section:**
- Lists your 5 most recent bids
- Shows auction title, amount, and status
- Click "View All" for complete history

### Understanding Sealed Bids

NovaDrive Motors uses a **sealed-bid auction format**:

- Your bid amount is **private** - other bidders cannot see it
- You can only see **your own** bid
- The highest bid wins when the auction ends
- If your bid is below the reserve price, the vehicle may not sell

### Winning an Auction

When you win:

1. **Notification**: You'll receive an email confirming your win

2. **Deposit (24 hours)**: Pay 10% of the winning bid to secure your purchase

3. **Full Payment (5 business days)**: Complete payment via bank transfer

4. **Pickup (10 business days)**: Collect the vehicle or arrange delivery

---

## How to Create and Manage Auctions

> **Note**: This section is for administrators only. You must have admin privileges to access these features.

### Accessing Admin Panel

Log in with an administrator account and navigate to **Admin Panel** in the menu.

![Admin Dashboard](img/09-admin-dashboard.png)

The admin dashboard displays:
- **Total Auctions**: All auctions with active count
- **Total Users**: Registered user count
- **Total Bids**: All-time bid count
- **Active Rate**: Percentage of active auctions
- **Recent Bids**: Latest bidding activity
- **Most Active Auctions**: Popular listings

### Managing Existing Auctions

Navigate to **Admin → Auctions**.

![Admin Auctions List](img/10-admin-auctions.png)

**Auction Table Columns:**
- Vehicle (image and title)
- Reference number
- Status badge
- Current price
- Bid count
- End date
- Actions

**Available Actions:**
- 👁 **View**: Open public auction page
- ✏️ **Edit**: Modify auction details
- 🗑 **Delete**: Remove auction (only if no bids)

**Status Colors:**
- 🔵 **Draft**: Not yet published
- 🟢 **Active**: Live, accepting bids
- 🟡 **Ended**: Auction time expired
- 🔵 **Sold**: Payment completed
- 🔴 **Cancelled**: Auction cancelled

### Creating a New Auction

Navigate to **Admin → Auctions** and click **"New Auction"**.

![Auction Form](img/11-admin-auction-form.png)

**Basic Information Card:**

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | Full vehicle name (e.g., "BMW 320d xDrive 2019") |
| Description | No | Detailed vehicle description |
| VIN | Yes | Vehicle Identification Number |
| Vehicle Type | Yes | Car, Motorcycle, Truck, or Other |

**Vehicle Details Card:**

| Field | Required | Description |
|-------|----------|-------------|
| Make | Yes | Manufacturer (e.g., BMW, Audi) |
| Model | Yes | Model name (e.g., 320d, A4) |
| Year | Yes | Production year (1900 - current) |
| Mileage | Yes | Kilometers driven |
| Color | No | Exterior color |
| Body Type | Yes | Sedan, SUV, Hatchback, etc. |
| Fuel Type | Yes | Petrol, Diesel, Electric, Hybrid, LPG, CNG |
| Transmission | Yes | Manual, Automatic, Semi-Auto |
| Condition | Yes | Excellent to Salvage |
| Engine Size | No | Displacement in cc |
| Engine Power | No | Power in HP |
| Doors | No | Number of doors (1-6) |
| Location | No | Pickup location |

**Pricing Card:**

| Field | Required | Description |
|-------|----------|-------------|
| Starting Price | Yes | Minimum opening bid (PLN) |
| Estimated Value | No | Market value estimation (PLN) |
| Reserve Price | No | Minimum acceptable bid (PLN) |
| Repair Cost | No | Estimated repair cost for damaged vehicles |

**Damage Information Card:**
- Damage Description: Text area for detailed damage report
- Only relevant for damaged/salvage vehicles

**Auction Settings Card:**

| Field | Required | Options |
|-------|----------|---------|
| Source Type | Yes | Insurance, Dealer, Fleet, Private, Leasing, Other |
| Status | Yes | Draft, Active, Ended, Sold, Cancelled |
| Duration | Yes (create only) | 1-30 days |

**To create the auction:**
1. Fill in all required fields
2. Review the information
3. Set status to "Draft" to save without publishing
4. Set status to "Active" to publish immediately
5. Click **"Create Auction"**

### Editing an Auction

1. Go to **Admin → Auctions**
2. Find the auction in the list
3. Click the **Edit** (✏️) icon
4. Modify any fields
5. Click **"Update Auction"**

**Photo Management (Edit Mode Only):**
- Drag and drop photos to reorder
- First photo becomes the thumbnail
- Click **"Save Order"** to apply changes

### Changing Auction Status

To activate, end, or cancel an auction:
1. Edit the auction
2. Change the **Status** field
3. Save changes

**Status Transitions:**
- Draft → Active: Publishes the auction
- Active → Ended: Manually ends the auction
- Active → Cancelled: Cancels the auction
- Ended → Sold: Marks as sold after payment

---

## Administration Guide

### Admin Dashboard Overview

The admin dashboard provides real-time platform metrics.

**Key Metrics:**
- **Total Auctions**: All auctions ever created
- **Active Count**: Currently running auctions
- **Total Users**: Registered accounts
- **Total Bids**: All bids placed
- **Active Rate**: Percentage of auctions currently active

**Activity Feeds:**
- Recent bids across all auctions
- Most popular active auctions

### User Management

Navigate to **Admin → Users**.

**Features:**
- View all registered users
- Search by name or email
- View user details and activity
- Manage user roles (User/Admin)
- View user bid history

### Platform Settings

Navigate to **Admin → Settings**.

![Admin Settings](img/13-admin-settings.png)

**General Settings:**
- Site name
- Contact email
- Contact phone

**Auction Settings:**
- Default auction duration
- Minimum bid increment
- Auto-extend feature (extends auction if bid in last minutes)

**Notification Settings:**
- Admin notification email
- Email alerts for new bids
- Email alerts for auction endings

---

## Import & Scraping System

The import system allows administrators to bulk-import vehicles from external auction sources.

### Overview

Navigate to **Admin → Import**.

![Import Page](img/12-admin-import.png)

**Statistics Cards:**
1. **Total Scraped**: All vehicles found by scraper
2. **Pending Review**: Awaiting admin selection
3. **Selected**: Marked for detail fetching
4. **Fetching**: Currently downloading details
5. **With Details**: Ready for import
6. **Imported**: Added to main auctions

### Scraping Workflow

The import process has three main stages:

#### Stage 1: List Scraping (Free)

The scraper automatically collects basic vehicle data from external sources.

**Data Collected (No Cost):**
- Brand and model
- Year and mileage
- Fuel type and power
- Location
- Thumbnail image
- Expiration date

**Vehicle Status After Scrape:**
- `PENDING` - Awaiting review

#### Stage 2: Detail Fetching (Paid)

For vehicles you want to import, fetch full details.

**Cost:** €0.23 per vehicle

**Additional Data Retrieved:**
- VIN number
- Full image gallery (all photos)
- Complete specifications
- Detailed condition report

**To fetch details:**
1. Review pending vehicles in the table
2. Select vehicles you want by clicking checkbox
3. Click **"Fetch Details"** button
4. Confirm the cost estimate
5. Wait for fetching to complete

**Status Progression:**
```
PENDING → SELECTED → FETCHING → FETCHED
```

#### Stage 3: Import to Auctions

Convert fetched vehicles into live auctions.

**To import:**
1. Review vehicles with status `FETCHED`
2. Click **"Import"** for individual vehicles
3. Or use **"Bulk Import"** for multiple
4. Set pricing and duration
5. Choose initial status (Draft or Active)

**Status After Import:**
- `IMPORTED` - Vehicle is now a platform auction

### Selection Tools

**Filtering Options:**
- Filter by brand
- Filter by status
- Filter by year range
- Filter by price range

**Bulk Actions:**
- Select All Visible
- Clear Selection
- Select by criteria

### Cost Management

**Tracking Costs:**
- View estimated cost before fetching
- See actual costs in job history
- Monitor per-vehicle expenses

**Best Practices:**
1. Review thumbnails before selecting
2. Check expiration dates
3. Focus on high-value vehicles
4. Batch similar vehicles together

### Error Handling

**Possible Statuses:**
- `ERROR` - Fetch failed, can retry
- `SKIPPED` - Manually skipped by admin

**If fetching fails:**
1. Check the error message
2. Retry the fetch
3. Contact support if persistent

---

## Quick Reference

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Navigate photos | ← → arrows |
| Close modal | Escape |

### Status Reference

**Auction Statuses:**
| Status | Can Bid | Visible | Description |
|--------|---------|---------|-------------|
| Draft | No | No | Not published |
| Active | Yes | Yes | Live auction |
| Ended | No | Yes | Time expired |
| Sold | No | Yes | Payment complete |
| Cancelled | No | No | Auction cancelled |

**Scrape Statuses:**
| Status | Meaning | Next Action |
|--------|---------|-------------|
| PENDING | Awaiting review | Select for fetch |
| SELECTED | Marked for fetch | Wait for fetch |
| FETCHING | Downloading data | Wait |
| FETCHED | Ready to import | Import to auction |
| IMPORTED | Now an auction | Complete |
| SKIPPED | Manually skipped | None |
| ERROR | Fetch failed | Retry |

### Contact Support

If you encounter issues:
- **Email**: support@novadrivemotors.pl
- **Phone**: +48 22 123 45 67
- **Hours**: Mon-Fri 8:00-18:00, Sat 9:00-14:00

---

*Last updated: December 2024*
*NovaDrive Motors Sp. z o.o.*
