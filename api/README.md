# Getting started

**\*Prerequisites**: To run this project locally, you need to have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your operating system.\*

**Local development**

To start the api locally, run the following command:

```bash
docker compose up -d
```

This will create a container for the database.  
The api is available at http://localhost:8000  
The api docs are available at http://localhost:8000/doc

**Spinning Up the Server**

To start the server, install the dependencies:

```bash
npm i
```

then run the following command:

```bash
npm run start
```

**Testing**

To run e2e tests, run the following command:

```bash
npm run test
```
