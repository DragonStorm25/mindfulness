LAMBDA=$1
DEPENDENCIES=$2
VENV_DIR=venv/lib/python3.9/site-packages
CODE_DIR=$(pwd)

cd $VENV_DIR
zip -r $CODE_DIR/$1.zip .

cd $CODE_DIR
zip -g $1.zip lambda_function.py
zip -g -r $1.zip $2