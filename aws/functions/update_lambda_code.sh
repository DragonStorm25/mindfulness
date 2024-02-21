LAMBDA=$1

aws lambda update-function-code --function-name $LAMBDA --zip-file fileb://$LAMBDA.zip