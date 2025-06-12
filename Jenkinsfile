pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'your-dockerhub-username/weather-app'
        SONARQUBE_ENV = 'SonarQube' // Name configured in Jenkins → Manage Jenkins → Configure System → SonarQube servers
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Trivy Vulnerability Scan') {
            steps {
                sh '''
                if ! command -v trivy &> /dev/null; then
                    echo "Trivy not found. Please install it."
                    exit 1
                fi
                trivy fs --exit-code 0 --severity LOW,MEDIUM,HIGH .
                '''
            }
        }

        stage('SonarQube Analysis') {
            environment {
                // Add token in Jenkins Credentials and reference here
                SONAR_TOKEN = credentials('sonarqube-token')
            }
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=weather_app \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Deploy (Optional)') {
            steps {
                echo 'Deploy your app here. This can be SSH to server, kubectl, or Docker run.'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

