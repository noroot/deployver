# Deployver
Fast deployment tool for anything that works via ssh.

## Setup

### Installation

`npm install deployver`

### Configure

**ssh** - username@hostname string for ssh connection (works only with public key authorization without password)

**debug** - verbose mode

**keep** - how much release keep to rollback

**paths** - object with two paths *local* for from and remote for *to*

Thats all, it's damn simple.

### Usage

```
deployConfig =
  ssh: 'hexen@falsetrue.ru'
  debug: true
  keep: 5
  paths:
    local: './package.json'
    remote: '/tmp'

Deployver = require('deployver')(deployConfig)


Deployver.deploy() - push something to 
Deployver.rollback() - rollback it

```

See *gulp.example.coffee* (included in repo)

### Change log
#### 1.0.2
- Minor bugfix on init method to create releases current stub directory



### Credits

Author: Dmitry Rodichev (@noroot)

License: MIT

Inspired by capistrano, and shipit.


