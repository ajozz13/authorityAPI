# authorityAPI
Full NodeJS user authority API.   
This is a simple API using Node that can be used to manage user and create validation JSON Web Tokens.  
The user passwords are encrypted and stored in the database using Bcrypt.  
This authentication API adheres to Basic Authentication exchanges via HTTP HEAD requests.  The user encrypts the username and password into a base64 Token and exchanges via 'Authorization' header.  

# Requirements
MongoDB instance  
NodeJs 
 - Express
 - Mongoose
 - Bcrypt
 - Jsonwebtoken

 Development
   - jasmine-node
   - express

### Alberto Ochoa
