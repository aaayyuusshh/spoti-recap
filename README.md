# SpotiRecap
Displays your Spotify top tracks, artists, or genres of the past month, 6 months, or all time.

You can view and share your music taste and listening habits anytime now!
___

## Architecture
<img width="1327" height="629" alt="architecture" src="https://github.com/user-attachments/assets/f59cbd62-733b-46b7-b434-aa0528518e5a" />

## Getting Started
Clone the repo:
```bash
git clone https://github.com/aaayyuusshh/spoti-recap
cd spoti-recap
```

### Spotify Developer
- Login to [Spotify Developer](https://developer.spotify.com/dashboard/)
- Register an app there so you can obtain your unique client id and client secret to use for this app
- Set redirect url to `http://127.0.0.1:3000/callback`

### Backend
- Copy and paste contents of `application.properties.example` into `application.properties` and populate with your own values (details about this in the `.example` file)
- Run a `localhost` Redis instance on port `6379`:
```bash
# install redis if you don't have it
brew update
brew install redis
# run redis
redis-server
# check if redis is working - should return: PONG
redis-cli ping
```
- Start the backend:
```bash
cd backend
./mvnw spring-boot:run
```
The backend server should now be running at http://localhost:8080

### Frontend
-  Copy and paste contents of `.env.example` into `.env` and populate with your own values (details about this in the `.example` file)
- Start the frontend:
```bash
cd frontend
npm run dev
```
Visit the frontend running at http://localhost:3000

---

_Built with TypeScript/React(frontend), Java/Spring Boot(backend), Python(automation), and unconditional love for music ❤️_
