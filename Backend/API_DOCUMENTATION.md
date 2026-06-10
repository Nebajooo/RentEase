# House Rental System API Documentation

## Base URL: `http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/auth/register`              | Register new user      |
| POST   | `/auth/login`                 | Login user             |
| GET    | `/auth/verify-email/:token`   | Verify email           |
| POST   | `/auth/forgot-password`       | Request password reset |
| PUT    | `/auth/reset-password/:token` | Reset password         |
| GET    | `/auth/me`                    | Get current user       |
| POST   | `/auth/logout`                | Logout user            |

### User Endpoints

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/users/profile`         | Get user profile      |
| PUT    | `/users/profile`         | Update profile        |
| POST   | `/users/upload-avatar`   | Upload avatar         |
| POST   | `/users/upload-kyc`      | Upload KYC (landlord) |
| GET    | `/users/stats`           | Get user statistics   |
| PUT    | `/users/change-password` | Change password       |

### Property Endpoints

| Method | Endpoint                              | Description                       |
| ------ | ------------------------------------- | --------------------------------- |
| GET    | `/properties`                         | Get all properties (with filters) |
| GET    | `/properties/featured`                | Get featured properties           |
| GET    | `/properties/:id`                     | Get single property               |
| POST   | `/properties`                         | Create property (landlord)        |
| PUT    | `/properties/:id`                     | Update property                   |
| DELETE | `/properties/:id`                     | Delete property                   |
| PATCH  | `/properties/:id/toggle-availability` | Toggle availability               |
| POST   | `/properties/:id/save`                | Save to wishlist                  |

### Booking Endpoints

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/bookings`                    | Create booking request |
| GET    | `/bookings/my-bookings`        | Get tenant bookings    |
| GET    | `/bookings/requests`           | Get landlord requests  |
| PUT    | `/bookings/:id/approve`        | Approve booking        |
| PUT    | `/bookings/:id/reject`         | Reject booking         |
| PUT    | `/bookings/:id/cancel`         | Cancel booking         |
| POST   | `/bookings/check-availability` | Check dates            |

### Review Endpoints

| Method | Endpoint                        | Description          |
| ------ | ------------------------------- | -------------------- |
| POST   | `/reviews`                      | Create review        |
| GET    | `/reviews/property/:propertyId` | Get property reviews |
| PUT    | `/reviews/:id/respond`          | Landlord response    |
| POST   | `/reviews/:id/helpful`          | Mark as helpful      |

### Payment Endpoints

| Method | Endpoint                          | Description     |
| ------ | --------------------------------- | --------------- |
| POST   | `/payments/create-payment-intent` | Create payment  |
| POST   | `/payments/confirm-payment`       | Confirm payment |
| GET    | `/payments/history`               | Payment history |
| POST   | `/payments/webhook`               | Stripe webhook  |

### Admin Endpoints

| Method | Endpoint                        | Description      |
| ------ | ------------------------------- | ---------------- |
| GET    | `/admin/stats`                  | Dashboard stats  |
| GET    | `/admin/users`                  | Get all users    |
| PUT    | `/admin/users/:id/suspend`      | Suspend user     |
| PUT    | `/admin/properties/:id/approve` | Approve property |
| GET    | `/admin/disputes`               | Get disputes     |
| PUT    | `/admin/disputes/:id/resolve`   | Resolve dispute  |

### Query Parameters for GET /properties

- `location` - Search by city
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `bedrooms` - Number of bedrooms (1,2,3,4+)
- `bathrooms` - Number of bathrooms (1,2,3+)
- `propertyType` - apartment, house, condo, studio
- `amenities` - Comma-separated list (AC,WiFi,Parking)
- `sortBy` - price_asc, price_desc, newest, popular
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
