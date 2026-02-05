# Maintenance Request API Documentation

Base URL (local): `http://localhost:4000/api`

All authenticated routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Auth

### Register
`POST /auth/register`

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@facility.com",
  "password": "StrongPass123!"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@facility.com",
    "role": "USER"
  }
}
```

### Login
`POST /auth/login`

Request:
```json
{
  "email": "admin@facility.com",
  "password": "Admin123!"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@facility.com",
    "role": "ADMIN"
  }
}
```

## Users

### Get current user
`GET /users/me`

Response:
```json
{
  "id": "uuid",
  "name": "Admin User",
  "email": "admin@facility.com",
  "role": "ADMIN"
}
```

## Maintenance Requests

### List requests (pagination + filter + sort)
`GET /requests?page=1&pageSize=10&status=OPEN&priority=HIGH&search=hvac&sortBy=createdAt&sortOrder=desc`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "HVAC filter replacement",
      "description": "Quarterly filter replacement needed for 2nd floor HVAC.",
      "location": "Building A - Floor 2",
      "category": "HVAC",
      "priority": "MEDIUM",
      "status": "OPEN",
      "requester": {
        "id": "uuid",
        "name": "Standard User",
        "email": "user@facility.com"
      },
      "createdAt": "2026-02-05T10:12:00.000Z",
      "updatedAt": "2026-02-05T10:12:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Create request
`POST /requests`

Request:
```json
{
  "title": "Water leak",
  "description": "Leak under sink in break room",
  "location": "Building B - Break Room",
  "category": "Plumbing",
  "priority": "HIGH"
}
```

Response:
```json
{
  "id": "uuid",
  "title": "Water leak",
  "description": "Leak under sink in break room",
  "location": "Building B - Break Room",
  "category": "Plumbing",
  "priority": "HIGH",
  "status": "OPEN",
  "requesterId": "uuid",
  "createdAt": "2026-02-05T10:12:00.000Z",
  "updatedAt": "2026-02-05T10:12:00.000Z"
}
```

### Update request
`PATCH /requests/:id`

Request:
```json
{
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

Response:
```json
{
  "id": "uuid",
  "title": "Water leak",
  "description": "Leak under sink in break room",
  "location": "Building B - Break Room",
  "category": "Plumbing",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "requesterId": "uuid",
  "createdAt": "2026-02-05T10:12:00.000Z",
  "updatedAt": "2026-02-05T12:00:00.000Z"
}
```

### Delete request
`DELETE /requests/:id`

Response:
```json
{
  "message": "Request deleted successfully"
}
```
