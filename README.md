# Featmap, the simple user story mapping tool
Featmap is a simple user story mapping tool for product managers to build, plan and communicate product backlogs. It is built using React, Typescript and Go. Try it out at [www.featmap.com](https://www.featmap.com).

![Featmap screenshot](screenshot.png)


## How to run locally

### Database requirements
Featmap runs on top of [PostgreSQL](https://www.postgresql.org/), so make sure you have it running on your system. At this step, make sure to setup the credentials and database that Featmap will use.


### Downloading
[Download](https://github.com/amborle/featmap/releases) the Featmap binary for your respective platform and save it somewhere on your system. 

### Configuration
In the directory where you placed the binary, create a file called ```conf.json```.

Here's a sample  ```conf.json```

```json
{  
  "appSiteURL": "http://localhost/",
  "dbConnectionString": "postgresql://featmap:featmap@localhost:5432/featmap?sslmode=disable",
  "jwtSecret": "mC3qd44x5hr5YaRhaj5pM5L",
  "port": "80",
  "emailFrom" : "contact@example.com",
  "smtpServer" : "smtp.example.com",
  "smtpUser" : "postmaster@mail.example.com",
  "smtpPass": "some_smtp_password",
  "environment": "production"
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
`smtpUser` | SMTP server username.
`smtpPass` | SMTP server password.
`environment` |  Optional. If set to `development`, the backend will not serve secure cookies.

It is possible to run Featmap without filling in the mail details, but recovery emails and workspace invites will not be available.

### Running
Execute the binary.

```bash
./featmap-1.0.0-linux-amd64
Serving on port 80
```

Open a browser to http://localhost and you are ready to go!

## Building

### Requirements
The following must be installed on your system in order to build
* [Node.js](https://nodejs.org/)
* [Go](https://golang.org/)
* [go-bindata](https://github.com/jteeuwen/go-bindata)

### Instructions
Start by cloning the repository.

```bash
git clone https://github.com/amborle/featmap.git
```

Navigate to the repository.

```bash
cd featmap
```

Now let's build it (requires Bash).

```bash
./build/complete_build.sh
```

Binaries for Linux, Win and Mac are now available in the ```bin``` folder.

```bash
cd bin
ls
featmap-1.0.3-darwin-amd64  featmap-1.0.3-linux-amd64  featmap-1.0.3-windows-amd64.exe
```























