pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'kartikhiremath/weather_app:${BUILD_NUMBER}'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Kartik-Hiremath/weather_app.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('MySonarQube') {
                        sh '''
                        /opt/homebrew/opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.token=$SONAR_TOKEN
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

        stage('Trivy Security Scan') {
            steps {
                // Allow scan to fail without breaking pipeline, but still alert you
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL $DOCKER_IMAGE || echo "Trivy found issues."
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                // Stop previous container if running, then start new one
                sh '''
                    docker stop weather_app_container || true
                    docker rm weather_app_container || true
                    docker run -d -p 80:80 --name weather_app_container $DOCKER_IMAGE
                '''
            }
        }

        stage('Docker Test') {
            steps {
                sh 'which docker'
                sh 'docker ps'
            }
        }

    }

    post {
        failure {
            echo 'Pipeline failed ❌'
        }
        success {
            echo 'Pipeline executed successfully ✅'
        }
    }
}

