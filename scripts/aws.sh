# CliGeneratedPrimordialKey
aws ec2 create-key-pair \
  --region ap-south-1 \
  --key-name CliGeneratedPrimordialKey \
  --query "KeyMaterial" \
  --output text > CliGeneratedPrimordialKey.pem

chmod 400 CliGeneratedPrimordialKey.pem

aws ec2 describe-images \
  --region ap-south-1 \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text

aws ec2 run-instances \
  --region ap-south-1 \
  --image-id ami-021a584b49225376d \
  --instance-type t2.micro \
  --key-name CliGeneratedPrimordialKey \
  --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":20,\"DeleteOnTermination\":true}}]" \
  --count 1

aws ec2 describe-instances \
  --region ap-south-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]" \
  --output table

INSTANCE_ID=""

aws ec2 describe-instances \
  --region ap-south-1 \
  --instance-ids $INSTANCE_ID \
  --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" \
  --output text

SECURITY_GROUP_ID=""

aws ec2 authorize-security-group-ingress \
  --region ap-south-1 \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --region ap-south-1 \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --region ap-south-1 \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-egress \
  --region ap-south-1 \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 0-65535 \
  --cidr 0.0.0.0/0

aws ec2 allocate-address \
  --region ap-south-1 \
  --domain vpc


ALLOCATION_ID=""
PUBLIC_IP=""

aws ec2 associate-address \
  --region ap-south-1 \
  --instance-id $INSTANCE_ID \
  --allocation-id $ALLOCATION_ID

aws ec2 describe-addresses \
  --region ap-south-1

export EC2_DNS="ec2-$(echo $PUBLIC_IP | tr '.' '-').ap-south-1.compute.amazonaws.com"
ssh -i CliGeneratedPrimordialKey.pem ubuntu@$EC2_DNS

# primordial-api.gettumbuh.com -> 3001

sudo apt-get update
sudo apt-get install nginx -y

sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

sudo apt install certbot python3-certbot-nginx -y
sudo vim /etc/nginx/sites-available/primordial-api.gettumbuh.com

server {
    listen 80;
    server_name primordial-api.gettumbuh.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/primordial-api.gettumbuh.com /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d primordial-api.gettumbuh.com

# primordial.gettumbuh.com -> 3000

sudo vim /etc/nginx/sites-available/primordial.gettumbuh.com

server {
    listen 80;
    server_name primordial.gettumbuh.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/primordial.gettumbuh.com /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d primordial.gettumbuh.com

sudo certbot renew --dry-run

# install node and pm2

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

nvm install node
nvm use node
npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v24.1.0/bin /home/ubuntu/.nvm/versions/node/v24.1.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# install postgres

sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql.service

sudo -u postgres psql

# create databases and user
sudo -i -u postgres
psql -U postgres -c "CREATE DATABASE primordialdb;"
psql -U postgres -c "CREATE DATABASE shadow_primordialdb;"
psql -U postgres -c "CREATE USER primordial_user WITH PASSWORD 'primordial_user_password';"

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE primordialdb TO primordial_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE shadow_primordialdb TO primordial_user;"

psql -U postgres -d primordialdb -c "GRANT ALL PRIVILEGES ON SCHEMA public TO primordial_user;"
psql -U postgres -d shadow_primordialdb -c "GRANT ALL PRIVILEGES ON SCHEMA public TO primordial_user;"
ctrl + d

# install gh

(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y

gh auth login
gh repo clone https://github.com/gettumbuh/primordial-1/

# install dependencies
npm i

# ssh copy typechain-types
scp -i CliGeneratedPrimordialKey.pem -r ./backend/src/typechain-types ubuntu@$EC2_DNS:~/primordial-1/backend/src/

vim .env

# run migrations
npx prisma migrate dev

# run server
npm run dev