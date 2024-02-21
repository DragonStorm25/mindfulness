LAMBDA=$1
VENV_DIR=~/.local/share/virtualenvs/$LAMBDA-*/lib/python3.9/site-packages
CODE_DIR=$(pwd)

cp $CODE_DIR/lambda_function.py $VENV_DIR
cd $VENV_DIR
zip -r9 $CODE_DIR/$1.zip .
cd $CODE_DIR