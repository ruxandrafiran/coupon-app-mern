## Coupon Management App

This project is a full-stack web application for managing discount coupons. Users can create, edit and organize coupons by location, mark them as used, and keep track of expired ones through a dashboard.

The application includes authentication with JWT and cookies, so only logged-in users can access the dashboard and manage coupons.

## Main functionality

- User authentication (login and register)
- Create, edit and delete coupons
- Coupons grouped by location
- Coupon status management:
  active
  used
  expired
- Used and expired coupons displayed in separate sections
- Filtering by location
- Protected routes for authenticated users

## Technologies used

Frontend:
- React
- SCSS
- React Router

Backend:
- Node.js
- Express
- MongoDB (with Mongoose)

## Project structure

- frontend folder contains the React application, pages, components and SCSS styles
- backend folder contains the Express server, routes, controllers and database models
- MongoDB is used to store users, locations and coupons
