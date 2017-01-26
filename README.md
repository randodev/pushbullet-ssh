# pushbullet-ssh

### Overview
A utility application used to notify a system admin when a user succesfully authenticated on a certain machine over ssh or scp. 

  - Listens for any changes in ssh logs
  - Verifies that an user succesfully authenticated with any user
     * Optionally, an option is added to disregard any local IPs (e.g. 192.168.*.*)      
  - Sends any logon event to the pushbullet api wrapper, which sends this event to all devices connected through the API key provided

### Installing

Place the two components anywhere on the server. These can also be placed on 2 diffrent machines, but they have to be able to reach eachother over socket.io

After cloning the repository, to run them both just create a node process:
```sh
$ node pushbullet/index.js
$ node watcher/watcher.js
```

### Running

Make sure you change the following options:
* API key inside pushbullet index
* Option to avoid LAN connections
* Ports used for socket.io (you can use any of your unused ones)

### Credits
Alex Whitman <alex@alexwhitman.com> - PushBullet API
