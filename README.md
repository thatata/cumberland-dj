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

Any changes to node modules or Python packages will require a fresh build:
```sh
docker-compose down
docker-compose up --build
```

Hot reload is enabled for both the backend & frontend, so no need to create a fresh build for every change!

### Testing
TODO
