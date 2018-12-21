# uno-api

This project is an API for mulitplayer UNO that will be utilized by a future front-end application. When starting this project, I wanted to fully commit to BDD methodologies. Before anything was implemented in the API, tests were written describing the behavior of the application. Once I made these tests fail, I implemented the corresponding end-point and refactored until I reached a green state. I repeated this process until my entire test suite successfully passed. This style of developing forces you test earlier and more often. This reduces the amount of bugs and also the time it takes to find them.

This API was built using:

* Node + Express
* Async/Await (cleaner async code)
* SocketIO (communication between server and clients)
* PostgreSQL (database)
* Knex (database migrations and query building)
* Mocha + Chai (testing and assertions)
