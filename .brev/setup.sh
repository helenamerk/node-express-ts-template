#!/bin/bash

set -euo pipefail

####################################################################################
##### Specify software and dependencies that are required for this project     #####
#####                                                                          #####
##### Note:                                                                    ##### 
##### (1) A log file is auto-created when this file runs. If you want to write #####
##### to it, the relative path is ./.brev/logs/setup.log. By default, all      #####
##### stderr and stdout from this file are sent there.                         #####
#####                                                                          #####
##### (2) The working directory is /home/brev/<PROJECT_FOLDER_NAME>. Execution #####
##### of this file happens at this level.                                      #####
####################################################################################

##### Yarn #####
# (echo ""; echo "##### Yarn #####"; echo "";) >> ./.brev/logs/setup.log
# curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add
# echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# sudo apt update
# sudo apt install -y yarn

##### Homebrew #####
# (echo ""; echo "##### Homebrew #####"; echo "";) >> ./.brev/logs/setup.log
# curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash -
# echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/brev/.bash_profile
# echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/brev/.zshrc
# eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

##### Node v14.x + npm #####
# (echo ""; echo "##### Node v14.x + npm #####"; echo "";) >> ./.brev/logs/setup.log
# curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
# sudo apt-get install -y nodejs

##### Python + Pip + Poetry #####
# (echo ""; echo "##### Python + Pip + Poetry #####"; echo "";) >> ./.brev/logs/setup.log
# sudo apt-get install -y python3-distutils
# sudo apt-get install -y python3-apt
# curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3 -
# curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
# python3 get-pip.py
# rm get-pip.py
# source $HOME/.poetry/env

##### Golang v16x #####
# (echo ""; echo "##### Golang v16x #####"; echo "";) >> ./.brev/logs/setup.log
# wget https://golang.org/dl/go1.16.7.linux-amd64.tar.gz
# sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.16.7.linux-amd64.tar.gz
# echo "" | sudo tee -a ~/.bashrc
# echo "export PATH=\$PATH:/usr/local/go/bin" | sudo tee -a ~/.bashrc
# source ~/.bashrc
# echo "" | sudo tee -a ~/.zshrc
# echo "export PATH=\$PATH:/usr/local/go/bin" | sudo tee -a ~/.zshrc
# source ~/.zshrc
# rm go1.16.7.linux-amd64.tar.gz

##### Custom commands #####
# (echo ""; echo "##### Custom commands #####"; echo "";) >> ./.brev/logs/setup.log
# npm install


# note this installs node v14
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

npm i

docker run -p 6379:6379 -d redis      
docker run -p 7474:7474 -p7687:7687     -d     -v $HOME/neo4j/data:/data     -v $HOME/neo4j/logs:/logs -v $HOME/neo4j/import:/var/lib/neo4j/import     -v $HOME/neo4j/plugins:/plugins     --env NEO4J_AUTH=neo4j/test   --env 'NEO4JLABS_PLUGINS=["apoc"]'   neo4j:3.5.21