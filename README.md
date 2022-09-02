# Vehicle service app

## Description

This is backend app to book vehicle service appointment.

## Tech used

1. NestJS (V9.0.11)
2. ExpressJS (V4.17.13)
3. Swagger - For api docs
4. Docker

## Local setup

Guide to setup app locally

1. Use the .env-example file to create a .env file
2. Then run command ```npm run start```

## Generate typeorm migrations

Guide to generate typeorm migrations which will be used to migrate entity changes to database

1. Make sure you have followed steps in "Local Setup" guide and you are able to start server without errors
2. Run the command ```npm run typeorm:migration_generate --name=<name of the migration file>``` with replacing the placeholder in the name argument

**NOTE - The project is configured in a way that typeorm will take database configuration you have defined in you .env file.**
**So make sure that .env file contains database configuration for which you want to generate migrations**

## Run typeorm migrations

Guide to run the migrations generated via above "Generate typeorm migrations" guide. This guide will help you to commit entity changes to database

1. Make sure you have followed steps in "Local Setup" guide and you are able to start server without errors
2. Run the command ```npm run typeorm:migration_run``` and it will automatically detect all the migration files and commit it to database

**NOTE - The project is configured in a way that typeorm will take database configuration you have defined in you .env file.**
**So make sure that .env file contains database configuration on which you want to commit migrations changes**
