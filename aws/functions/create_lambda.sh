# Usage: create_lambda.sh <lambda_name>
# Example: create_lambda.sh my_lambda

# Create a directory for the Lambda Function
mkdir $1
cd $1

# Create a virtual environment for the Lambda Function and activate it
python3 -m venv venv
source venv/bin/activate

cp ../lambda_template.py lambda_function.py