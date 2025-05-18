for testing api endpoints and the behaviors of api in senarios what kind of test i need? which lib is better for my needs between jest and chai and cypress. give points of 10

how can i make this 10 of 10 :
Jest + Supertest (9/10 for API testing)

lets start from begining.
right now i have a empty tests folder in my api that is developed with nest js (uses fastify Adaptor) and postgressql db for data and redis db for caching and typeORM and CASL for permission checking and JWT (that has RT and AT and it sets and updates and removes a coockie that contains AT for client side) and other stuff.
lets do what is needed to have a 10 of 10 test strategy and config and usages for this api project and consider that i want have even complex tests senarios like for example:
field level permission of a user (i have user, role, permission system that is dynamic which means all of these stuff will save and retrieve data from db and cache systemm) for each entity (endpoint) for example if a user is trying to watch detail page of articles it will be get it only if he/she has the endpoint permssion at first step and then if he has , will get artile but only fields he has the permissins of .
ask any question if needed. right now i have not any test files of configurations for that. and my API folder structure is in this file: directory-structure-20250518.txt
