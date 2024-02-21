# Usage: "bash ../publish_layer.sh <layer_name>" from /aws/layers/sentiment/

LAYER_NAME=$1

rm -rf python.zip
zip -r9 python.zip python

aws lambda publish-layer-version --layer-name $LAYER_NAME \
    --description "Sentiment layer" \
    --license-info "MIT" \
    --zip-file fileb://python.zip \
    --compatible-runtimes python3.9 \
    --compatible-architectures "arm64"
