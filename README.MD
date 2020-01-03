
MICROVIDEO
Bootstrapping microservices with Docker, Kubernetes and Terraform

export VIDEOS_PATH=./videos
npm run start:dev

docker build -t microvideo --file Dockerfile .
docker image list
docker run -d -p 3000:3000 microvideo
docker container list
docker logs 5cb40b5f231f
docker tag microvideo konstas/kubia:microvideo
docker login --username konstas --password password
docker push konstas/kubia:microvideo

