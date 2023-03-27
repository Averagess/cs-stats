# cs-stats
## Description
cs-stats was an Discord bot that could fetch player statistics and other matchmaking data that i made for learning javascript.
Backend has been built with express, and it uses an mongoDB as an database. The bot is built with discord.js.

## Usage
```
Before first run, do npm i and then fill in .env in main folder and in server.
Bot's default prefix is is !cs <command> <args>
To see commands use !cs help
```
### cs-stats/.env
```
replace <> value with its value
DISCORDSECRET=<Discord bot token>
STEAMSECRET=<Steam API key> 
```

### cs-stats/server/.env
```
replace <> value with its value
MONGOURI=<Mongodb uri>
STEAMUSERNAME=<Steam username>
STEAMPASSWORD=<Steam password>
```
