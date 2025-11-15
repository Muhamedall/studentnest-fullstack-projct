# Student Housing Rental Platform

## I. Host Organization

This project was undertaken for educational institutions such as colleges and universities. These organizations represent the main operational environment for the project. They play a vital role in supporting students who live far from home by facilitating access to suitable housing solutions.

## II. Project Overview

The project addresses the challenges faced by university students who need temporary accommodation during their studies, often far from their hometowns. These students encounter unique housing difficulties such as finding affordable, safe, and conveniently located housing near their study centers. The student housing rental website aims to meet these needs by providing an online platform dedicated to renting accommodations specifically for university students.

## III. Proposed Solutions

1. **Student Housing Rental Platform:**  
   The core solution is the development of a user-friendly website dedicated to student housing rentals. The platform allows students to search, compare, and book temporary accommodations tailored to their requirements.


2. **Data API Integration:**  
   To ensure reliable and up-to-date housing information, the platform integrates with data APIs from trusted sources such as real estate agencies and specialized student housing databases.

3. **Customer Support:**  
   A customer support system is implemented to answer user inquiries, provide assistance with any issues, and support users throughout the rental process.

---

## IV. Technologies Used

- **Backend:** Laravel 10 (PHP Framework)  
- **Database:** MySQL  
- **Frontend:** React.js with Vite.js  
- **API:** RESTful API with Laravel  
- **Authentication:** Laravel Sanctum 
- **Other:** Axios for HTTP requests, Tailwind CSS , React Router  

---

## V. Installation & Setup

### Prerequisites

- PHP >= 8.1  
- Composer  
- Node.js & npm/yarn  
- MySQL  
- Git  

### Backend Setup (Laravel API)

```bash
# Clone the repository
git clone https://github.com/Muhamedall/studentnest-fullstack-projct
cd backend-laravel

# Install PHP dependencies
composer install

# Copy env file and set up environment variables
cp .env.example .env

# Generate app key
php artisan key:generate

# Set up database credentials in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel_react_full_stack
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate --seed

# Start the Laravel development server
php artisan serve

### Frontend Setup
cd ../frontend-react

# Install npm dependencies
npm install

# Run development server
npm run dev


VI. API Documentation
# Authentication Endpoints

| Method | Endpoint        | Description           | Auth Required |
| ------ | --------------- | --------------------- | ------------- |
| POST   | `/api/login`    | User login            | No            |
| POST   | `/api/register` | User registration     | No            |
| POST   | `/api/logout`   | User logout           | Yes           |
| GET    | `/api/user`     | Get current user info | Yes           |

# Listings Endpoints
| Method | Endpoint                    | Description          | Auth Required |
| ------ | --------------------------- | -------------------- | ------------- |
| POST   | `/api/listings`             | Create a new listing | No*           |
| GET    | `/api/dataListings`         | Get all listings     | No            |
| GET    | `/api/dataListings/{title}` | Get listing by title | No            |

# Comments Endpoints
| Method | Endpoint                             | Description                | Auth Required |
| ------ | ------------------------------------ | -------------------------- | ------------- |
| POST   | `/api/comments`                      | Add a comment to a listing | No*           |
| GET    | `/api/listings/{listingId}/comments` | Get comments for a listing | No            |

