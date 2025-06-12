pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kartikhiremath/weather_app:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                sh 'command -v trivy'
                sh 'trivy fs --exit-code 0 --severity LOW,MEDIUM,HIGH .'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('MySonarQube') {
                        sh '''
                            sonar-scanner \
                            -Dsonar.projectKey=weather_app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Deploy (Optional)') {
            when {
                expression { return false } // Set to true if you want to enable deployment
            }
            steps {
                echo "Deploying Docker container..."

                sh '''
                    docker stop weather_app_container || true
                    docker rm weather_app_container || true
                    docker run -d -p 8080:80 --name weather_app_container $DOCKER_IMAGE
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
            echo 'Pipeline finished ✅'
        }
        failure {
            echo 'Pipeline failed ❌'
        }
    }
}

