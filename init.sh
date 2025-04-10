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
db.createUser({
  user: '$MONGO_USER_TEST',
  pwd:  '$MONGO_PASSWORD_TEST',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_DATABASE_TEST'
  }]
})
EOF