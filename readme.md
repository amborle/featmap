# Featmap

Featmap is a user story mapping tool for product people to build, plan and communicate product backlogs.

![Featmap screenshot](screenshot.png)

- [Introduction](#introduction)
  - [Purpose](#purpose)
  - [Features](#features)
  - [Intended audience](#intended-audience)
  - [Motivation](#motivation)
- [Getting started](#getting-started) 
- [Self hosting](#self-hosting) 
  - [Requirements](#requirements) 
  - [Download](#download) 
  - [Configuration](#configuration) 
  - [Run](#run) 
  - [Upgrade](#upgrade) 
  - [Building from source and running with docker-compose](#Building-from-source-and-running-with-docker-compose)
- [License](#license) 

## Introduction
 Featmap is an open source user story mapping tool. It is built using React, Typescript and Go. 
 ### Purpose
Featmap was built for product people to take advantage of a technique called *user story mapping*. User story mapping, or just story mapping, is an effective tool to create, plan and communicate your product backlog. Story mapping was created by Jeff Patton and its primary utility is providing us with an overview of the entire product and how user goals are broken down into a series of tasks. Finally, it helps us to define valuable product slices (releases) and prioritize between them.
### Features
* Personas
* Markdown editing
* Discuss user stories
* Share your user story maps with external stakeholders
* User story annotations
* User story estimates with roll-ups

### Intended audience
Featmap is great for product managers, product owners or just about anyone who is building products. Featmap can also be used as a light weight work item management system for development teams.

### Motivation
There are many user story mapping tools, however none are really focused on easy-of-use and simplicity. Featmap was built to fill that gap. We hope you will find it as useful as we found building it.
## Getting started
You have two choices when it comes to using Featmap.
1. Use our hosted service at https://www.featmap.com. This is the most simple way of using Featmap. Note that we also offer a free trial.
2. Host it yourself by running it on you own server, without cost. Please refer to the [instructions](#self-hosting) for self-hosting.
## Self hosting
Featmap can be run on your own server.
### Requirements
Featmap runs on top of [PostgreSQL](https://www.postgresql.org/), so make sure you have it running on your system. At this step, make sure to setup the credentials and database that Featmap will use.
### Download
[Download](https://github.com/amborle/featmap/releases) the Featmap binary for your respective platform and save it somewhere on your system. If needed, make it executable on your system.
### Configuration
In the directory where you placed the binary, create a file called ```conf.json```.

Here's a sample  ```conf.json``` you can use:

```json
{
  "appSiteURL": "https://localhost:5000",
  "dbConnectionString": "postgresql://postgres:postgres@postgres:5432/postgres?sslmode=disable",
  "jwtSecret": "ChangeMeForProduction",
  "port": "5000",
  "emailFrom": "",
  "smtpServer": "",
  "smtpPort": "587",
  "smtpUser": "",
  "smtpPass": "",
  "environment": "development"
}
```
Setting | Description
--- | --- 
`appSiteURL` | The url to where you will be hosting the app.
`dbConnectionString` | The connection string to the PostgreSQL database that Featmap should connect to.
`jwtSecret` | This setting is used to secure the cookies produced by Featmap. Generate a random string and keep it safe! 
`port` | The port that Featmap should run on.
`emailFrom` | The email adress that should be used as sender when sending invitation and password reset mails.
`smtpServer` | SMTP server for sending emails.
`smtpPort` | **Optional** Will default to port 587 if not specified. 
`smtpUser` | SMTP server username.
`smtpPass` | SMTP server password.
`environment` |  **Optional** If set to `development`, Featmap assumes your are **not** running on **https** and the the backend will not serve secure cookies. Remove this setting if you have set it up to run https.

Configuration settings can also be overridden by environment variables in the 
format `FEATMAP_<uppercase setting name>`.  E.g. to override `dbConnectionString` 
you can set the environment variable `FEATMAP_DBCONNECTIONSTRING`.

NOTE: Environment variables can only *override* settings from `conf.json`.  If
a setting is not in `conf.json` it *will not* be loaded even if there is an
environment variable for it.

### Run
Execute the binary.

```bash
./featmap-1.0.0-linux-amd64
Serving on port 5000
```
Open a browser to http://localhost:5000 and you are ready to go!
### Upgrading
Just download the latest release and swap out the executable. Remember to backup your database and the old executable.

## Building from source and running with docker-compose

Clone the repository

```bash
git clone https://github.com/amborle/featmap.git
```

Navigate to the repository.

```bash
cd featmap
```

Let's copy the configuration files

```bash
cp config/.env .
cp config/conf.json .
```

Now let's build it.

```bash
docker-compose build
```

Startup the services, the app should now be available on the port you defined in you configuration files (default 5000).
```bash
docker-compose up -d
```

### Upgrading
Remember to backup your database (/data), just in case.

Pull down the latest source
```bash
git pull
```
Now let's rebuild it.
```bash
docker-compose build --no-cache
```
And finally run it.
```bash
docker-compose up -d
```

## License
Featmap is licensed under Business Source License 1.1. See [license](https://github.com/amborle/featmap/blob/master/LICENSE)
