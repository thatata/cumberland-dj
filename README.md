# cumberland-dj

### Requirements
- Docker 
- Docker Compose

### Setting environment variables
Copy the `.env.tpl` file and name it `.env`. Fill all the environmental variables listed in the file.

### Running locally
```sh
docker-compose up
```

Frontend is set up for hot-reload, so any changes made while app is running will automatically re-render the frontend

Backend changes require re-building the application using the following command:
```sh
docker-compose build
```

### Testing
TODO