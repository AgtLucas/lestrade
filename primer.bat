cd "$(dirname "$0")"
sudo npm update -g npm
sudo npm update -g bower
if [ ! -d node_modules ];then
    npm install
fi
if [ ! -d app/bower_components ];then
    bower install
fi
gulp
