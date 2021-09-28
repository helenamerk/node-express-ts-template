# node-express-ts-template

```
/health

POST /register
Response:
{
    token: xxx
}

GET /validate-token
Headers: {
    x-access-token: xxx
}

Response:
// Success
{
    message: "token is valid"
}

// Error
You need to be authenticated for this

```
