# init.sh
set -e
mongosh <<EOF
use admin
db.createUser({
  user: '$MONGO_USER',
  pwd:  '$MONGO_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_DATABASE'
  }]
})
EOF