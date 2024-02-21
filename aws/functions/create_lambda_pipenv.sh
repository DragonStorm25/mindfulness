# Create a directory for the Lambda Function
mkdir $1
cd $1

# Create a virtual environment for the Lambda Function and activate it
pipenv --python 3.9

cp ../lambda_template.py lambda_function.py

pipenv shell

cd ..