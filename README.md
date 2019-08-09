# Featmap, the simple user story mapping tool
Featmap is a simple user story mapping tool for product managers to build, plan and communicate product backlogs. It is built using React, Typescript and Go. Try it out at [www.featmap.com](https://www.featmap.com).

![Featmap screenshot](screenshot.png)


## How to run locally

### Database requirements
Featmap runs on top of [PostgreSQL](https://www.postgresql.org/), so make sure you have it running on your system.

### Downloading
[Download](https://github.com/amborle/featmap/releases) the Featmap binary for your respective platform and save it somewhere on your system. 

### Configuration
In the directory where you placed the binary, create a file called ```conf.json```.

Here's a sample  ```conf.json```

```json
{  
  "appSiteURL": "http://localhost/",
  "dbConnectionString": "postgresql://featmap:featmap@localhost:5432/featmap?sslmode=disable",
  "jwtSecret": "some_secret",
  "port": "80",
  "emailFrom" : "contact@example.com",
  "smtpServer" : "smtp.example.com",
  "smtpUser" : "postmaster@mail.example.com",
  "smtpPass": "some_smtp_password"
}
```

### Running
Execute the binary and you are ready to go!

```bash
./featmap-1.0.0-linux-amd64
Serving on port 80
```

















