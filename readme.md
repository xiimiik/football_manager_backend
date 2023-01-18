# Football Manager

Hello :) This is football manager (mobile game for Android and IOS).

It's provided by [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/)
and [Prisma ORM](https://www.prisma.io/).

Project has the following structure:

- Main file: **server.js**
- Prisma client file: **prisma-client.js**
- Environment variables file: **.env**
- Modules folder: **/modules**
- Routes folder: **/routes**
- Controllers folder: **/controllers**
- Services folder: **/services**
- Storage folder: **/data**
- Middlewares folder: **/middlewares**
- Exceptions folder: **/exceptions**
- Utils folder: **/utils**
- Prisma folder: **/prisma**
- Config folder: **/config**
- Public (static) folder: **/public**

Let's do a brief overview of each part of the project.

### Main file

`server.js` is the starting point of the application. It configures and starts express server, launches few game
modules.

### Prisma client file

`prisma-client.js` imports needed class from `/node_modules` and initializes new instance of prisma client used in each
part of
the application.

### Environment variables file

`.env` stores environment variables such as **_DATABASE_URL_**, **_GOOGLE_CLIENT_ID_** etc.

### Modules folder

`/modules` folder includes files that responsible for some game mechanics performed by server (creating common leagues,
weekend leagues etc).

### Routes folder

`/routes` folder is a bunch of api routers which calls corresponding controllers if http request match some route (for
instance, if request was made for _**/api/server**_ then `server.router.js` will be used).

### Controllers folder

`/controllers` folder is a bunch of controllers called by corresponding routers and responsive for handling incoming http request and generating response.

### Services folder

`/services` folder is a bunch of services called by controllers and responsive for processing data, saving and getting it from db etc.

### Storage folder

`/data` folder holds files acting like a local application db (for instance, `babynames-clean.csv` preserves list of available male names, `bots-names-patterns.txt` saves patterns for naming bots etc.).

### Middlewares folder

`/middlewares` folder is a bunch of middleware functions, that injected into express server (for instance, `error-middleware.js` called where server cant generate successful response and needed to send error).

### Exceptions folder

`/exceptions` folder is a bunch of exception functions which give comfortable methods for working with errors.

### Utils folder

`/utils` folder is a bunch of utils handling different kinds of tasks.

### Prisma folder

`/prisma` folder holds database scheme and migrations.

### Config folder

`/config` folder holds various configuration files.

### Public folder

`/public` folder holds static files hosted by express server.